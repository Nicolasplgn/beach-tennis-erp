'use server'

import { prisma } from '@/lib/prisma'
import { auth, signIn, signOut } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- AUTENTICAÇÃO ---
export async function loginAction(formData: FormData) {
  await signIn("credentials", formData)
}

export async function logoutAction() {
  await signOut()
}

// --- GESTÃO DE LIGAS (REQUISITO 2) ---
export async function createLeague(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const startDate = formData.get('startDate') as string

  const league = await prisma.league.create({
    data: { 
      name, 
      ...(description && { description }),
      ...(startDate && { startDate: new Date(startDate) }),
      adminId: session.user.id 
    }
  })
  revalidatePath('/')
  redirect(`/league/${league.id}`)
}

export async function updateLeagueStatus(id: string, status: string) {
  await prisma.league.update({ where: { id }, data: { status } })
  revalidatePath(`/league/${id}`)
}

export async function deleteLeague(id: string) {
  await prisma.league.delete({ where: { id } })
  revalidatePath('/')
  redirect('/')
}

// --- GESTÃO DE JOGADORES (REQUISITO 3) ---
export async function addPlayer(leagueId: string, formData: FormData) {
  const name = formData.get('name') as string
  const nickname = formData.get('nickname') as string
  const level = formData.get('level') as string
  
  await prisma.player.create({
    data: { 
      name, 
      ...(nickname && { nickname }),
      ...(level && { level }),
      leagueId 
    }
  })
  revalidatePath(`/league/${leagueId}`)
}

export async function deletePlayer(playerId: string, leagueId: string) {
  await prisma.player.delete({ where: { id: playerId } })
  revalidatePath(`/league/${leagueId}`)
}

// --- SORTEIO DE DUPLAS (REQUISITO 4) ---
export async function generateTeams(leagueId: string) {
  const players = await prisma.player.findMany({ where: { leagueId } })
  if (players.length < 2) return

  await prisma.team.deleteMany({ where: { leagueId } })
  const shuffled = [...players].sort(() => Math.random() - 0.5)

  for (let i = 0; i < shuffled.length; i += 2) {
    const p1 = shuffled[i]
    const p2 = shuffled[i+1]
    await prisma.team.create({
      data: {
        leagueId,
        name: `Dupla: ${p1.name.split(' ')[0]}${p2 ? ' & ' + p2.name.split(' ')[0] : ''}`,
        players: { connect: p2 ? [{id: p1.id}, {id: p2.id}] : [{id: p1.id}] }
      }
    })
  }
  revalidatePath(`/league/${leagueId}`)
}

// --- CHAVEAMENTO MATA-MATA (REQUISITO 5) ---
export async function generateBracket(leagueId: string) {
  const teams = await prisma.team.findMany({ where: { leagueId } })
  if (teams.length < 2) return

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { leagueId } })
    const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(teams.length)))
    const totalRounds = Math.log2(powerOfTwo)
    const byes = powerOfTwo - teams.length
    
    const bracketSlots = [...teams].sort(() => Math.random() - 0.5)
    for (let i = 0; i < byes; i++) bracketSlots.push(null as any)

    const created: Record<number, Record<number, string>> = {}

    for (let r = totalRounds; r >= 1; r--) {
      const nMatches = Math.pow(2, totalRounds - r)
      created[r] = {}
      for (let pos = 0; pos < nMatches; pos++) {
        const nextId = r < totalRounds ? created[r+1][Math.floor(pos/2)] : undefined
        
        let tAId, tBId, status = "PENDING", winnerId, sA = 0, sB = 0
        
        if (r === 1) {
          const tA = bracketSlots[pos*2]
          const tB = bracketSlots[pos*2+1]
          tAId = tA?.id; tBId = tB?.id
          if (tA && !tB) { status = "FINISHED"; winnerId = tA.id }
          else if (!tA && tB) { status = "FINISHED"; winnerId = tB.id }
        }

        const match = await tx.match.create({
          data: { leagueId, round: r, position: pos, nextMatchId: nextId, teamAId: tAId, teamBId: tBId, status, winnerId, scoreA: sA, scoreB: sB }
        })
        created[r][pos] = match.id

        if (status === "FINISHED" && winnerId && nextId) {
          await tx.match.update({ 
            where: { id: nextId }, 
            data: pos % 2 === 0 ? { teamAId: winnerId } : { teamBId: winnerId } 
          })
        }
      }
    }
    await tx.league.update({ where: { id: leagueId }, data: { status: 'IN_PROGRESS' } })
  })
  revalidatePath(`/league/${leagueId}`)
}

// --- LANÇAMENTO DE RESULTADOS E REGRAS (REQUISITO 6 e 7) ---
export async function updateScore(matchId: string, scoreA: number, scoreB: number) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { teamA: { include: { players: true } }, teamB: { include: { players: true } } }
  })
  if (!match) return

  // REQUISITO 7: Regras de Jogo (6 games, 6x5, Tie-break 7)
  let winnerId: string | null = null
  if (scoreA >= 6 && (scoreA - scoreB >= 2)) winnerId = match.teamAId
  else if (scoreB >= 6 && (scoreB - scoreA >= 2)) winnerId = match.teamBId
  else if (scoreA === 7 && scoreB === 6) winnerId = match.teamAId
  else if (scoreB === 7 && scoreA === 6) winnerId = match.teamBId

  const isFinished = !!winnerId
  const wasFinished = match.status === 'FINISHED'
  const previousWinnerId = match.winnerId

  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: { scoreA, scoreB, status: isFinished ? "FINISHED" : "PLAYING", winnerId: winnerId }
    })

    // Se o jogo estava finalizado antes, precisa reverter os wins/losses anteriores
    if (wasFinished && previousWinnerId) {
      const pA = match.teamA?.players || []
      const pB = match.teamB?.players || []
      
      for (const p of pA) {
        const updateData: any = {
          gamesWon: { decrement: match.scoreA || 0 }
        }
        if (previousWinnerId === match.teamAId) {
          updateData.wins = { decrement: 1 }
        }
        if (previousWinnerId === match.teamBId) {
          updateData.losses = { decrement: 1 }
        }
        await tx.player.update({
          where: { id: p.id },
          data: updateData
        })
      }
      for (const p of pB) {
        const updateData: any = {
          gamesWon: { decrement: match.scoreB || 0 }
        }
        if (previousWinnerId === match.teamBId) {
          updateData.wins = { decrement: 1 }
        }
        if (previousWinnerId === match.teamAId) {
          updateData.losses = { decrement: 1 }
        }
        await tx.player.update({
          where: { id: p.id },
          data: updateData
        })
      }
    }

    if (isFinished && winnerId && match.nextMatchId) {
      // Avanço automático (Requisito 6.2)
      const isNextA = match.position % 2 === 0
      await tx.match.update({
        where: { id: match.nextMatchId },
        data: isNextA ? { teamAId: winnerId } : { teamBId: winnerId }
      })
    }

    // Atualizar ranking apenas se o jogo está finalizado agora
    if (isFinished && winnerId) {
      const pA = match.teamA?.players || []
      const pB = match.teamB?.players || []
      
      for (const p of pA) {
        const updateData: any = {
          gamesWon: { increment: scoreA }
        }
        if (winnerId === match.teamAId) {
          updateData.wins = { increment: 1 }
        }
        if (winnerId === match.teamBId) {
          updateData.losses = { increment: 1 }
        }
        await tx.player.update({
          where: { id: p.id },
          data: updateData
        })
      }
      for (const p of pB) {
        const updateData: any = {
          gamesWon: { increment: scoreB }
        }
        if (winnerId === match.teamBId) {
          updateData.wins = { increment: 1 }
        }
        if (winnerId === match.teamAId) {
          updateData.losses = { increment: 1 }
        }
        await tx.player.update({
          where: { id: p.id },
          data: updateData
        })
      }
    }
  })
  revalidatePath(`/league/${match.leagueId}`)
}