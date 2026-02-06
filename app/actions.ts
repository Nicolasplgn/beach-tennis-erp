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

// --- LIGAS ---
export async function createLeague(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return

  const name = formData.get('name') as string
  const startDateStr = formData.get('startDate') as string
  const endDateStr = formData.get('endDate') as string

  // Correção de datas para evitar erros de Timezone
  const startDate = startDateStr ? new Date(startDateStr) : null
  const endDate = endDateStr ? new Date(endDateStr) : null

  const league = await prisma.league.create({
    data: { 
      name, 
      startDate,
      endDate,
      adminId: session.user.id 
    }
  })
  
  revalidatePath('/')
  redirect(`/league/${league.id}`)
}

export async function deleteLeague(id: string) {
  await prisma.league.delete({ where: { id } })
  revalidatePath('/')
  redirect('/')
}

export async function updateLeagueStatus(id: string, status: string) {
  await prisma.league.update({ where: { id }, data: { status } })
  revalidatePath(`/league/${id}`)
}

// --- JOGADORES ---
export async function addPlayer(leagueId: string, formData: FormData) {
  const name = formData.get('name') as string
  const nickname = formData.get('nickname') as string
  const level = formData.get('level') as string
  
  if (!name) return

  await prisma.player.create({
    data: { name, nickname, level, leagueId }
  })
  revalidatePath(`/league/${leagueId}`)
}

export async function updatePlayer(playerId: string, leagueId: string, formData: FormData) {
  const name = formData.get('name') as string
  const nickname = formData.get('nickname') as string
  const level = formData.get('level') as string

  await prisma.player.update({
    where: { id: playerId },
    data: { name, nickname, level }
  })
  revalidatePath(`/league/${leagueId}`)
}

export async function deletePlayer(playerId: string, leagueId: string) {
  await prisma.player.delete({ where: { id: playerId } })
  revalidatePath(`/league/${leagueId}`)
}

// --- TIMES (CORRIGIDO: PARALELISMO + TIMEOUT) ---
export async function generateTeams(leagueId: string) {
  const players = await prisma.player.findMany({ where: { leagueId } })
  if (players.length < 4) return 

  // Configuração de timeout aumentada para 20s
  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { leagueId } })
    await tx.team.deleteMany({ where: { leagueId } })

    const shuffled = [...players].sort(() => Math.random() - 0.5)
    
    // Array de promessas para criação paralela (Muito mais rápido)
    const createPromises = []

    for (let i = 0; i < shuffled.length; i += 2) {
      const p1 = shuffled[i]
      const p2 = shuffled[i+1]
      
      if (p2) {
        // Adiciona a operação na fila em vez de esperar (await)
        createPromises.push(
          tx.team.create({
            data: {
              leagueId,
              name: `${p1.nickname || p1.name.split(' ')[0]} & ${p2.nickname || p2.name.split(' ')[0]}`,
              players: { connect: [{ id: p1.id }, { id: p2.id }] }
            }
          })
        )
      }
    }

    // Executa tudo de uma vez
    await Promise.all(createPromises)

  }, {
    maxWait: 5000, // Tempo máximo esperando conexão
    timeout: 20000 // Tempo máximo para executar a transação (20 segundos)
  })

  revalidatePath(`/league/${leagueId}`)
}

// --- CHAVEAMENTO (CORRIGIDO: TIMEOUT AUMENTADO) ---
export async function generateBracket(leagueId: string) {
  const teams = await prisma.team.findMany({ where: { leagueId } })
  if (teams.length < 2) return

  // Aumentamos o timeout aqui também para evitar erro na geração da árvore
  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { leagueId } })

    const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(teams.length)))
    const totalRounds = Math.log2(powerOfTwo)
    const byes = powerOfTwo - teams.length
    
    const bracketSlots: (typeof teams[0] | null)[] = [...teams].sort(() => Math.random() - 0.5)
    for (let i = 0; i < byes; i++) bracketSlots.push(null)

    const createdMatches: Record<number, Record<number, string>> = {}

    for (let r = totalRounds; r >= 1; r--) {
      const nMatches = Math.pow(2, totalRounds - r)
      createdMatches[r] = {}
      
      for (let pos = 0; pos < nMatches; pos++) {
        const nextId = r < totalRounds ? createdMatches[r + 1][Math.floor(pos / 2)] : undefined
        
        let tAId: string | undefined = undefined
        let tBId: string | undefined = undefined
        let status = "PENDING"
        let winnerId: string | undefined = undefined
        
        if (r === 1) {
          const tA = bracketSlots[pos * 2]
          const tB = bracketSlots[pos * 2 + 1]
          tAId = tA?.id
          tBId = tB?.id

          if (tA && !tB) { status = "FINISHED"; winnerId = tA.id }
          else if (!tA && tB) { status = "FINISHED"; winnerId = tB.id }
        }

        const match = await tx.match.create({
          data: { 
            leagueId, 
            round: r, 
            position: pos, 
            nextMatchId: nextId, 
            teamAId: tAId, 
            teamBId: tBId, 
            status, 
            winnerId, 
            scoreA: 0, 
            scoreB: 0 
          }
        })
        createdMatches[r][pos] = match.id

        if (status === "FINISHED" && winnerId && nextId) {
           const isTeamA = pos % 2 === 0
           const updateData = isTeamA ? { teamAId: winnerId } : { teamBId: winnerId }
           
           await tx.match.update({ 
            where: { id: nextId }, 
            data: updateData 
          })
        }
      }
    }
    
    await tx.league.update({ where: { id: leagueId }, data: { status: 'IN_PROGRESS' } })
  }, {
    maxWait: 5000,
    timeout: 20000 // 20 segundos para garantir a árvore completa
  })
  
  revalidatePath(`/league/${leagueId}`)
}

export async function updateScore(matchId: string, scoreA: number, scoreB: number) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { teamA: true, teamB: true }
  })
  if (!match) return

  let winnerId: string | null = null
  if (scoreA >= 6 && (scoreA - scoreB >= 2)) winnerId = match.teamAId
  else if (scoreB >= 6 && (scoreB - scoreA >= 2)) winnerId = match.teamBId
  else if (scoreA === 7 && scoreB === 6) winnerId = match.teamAId
  else if (scoreB === 7 && scoreA === 6) winnerId = match.teamBId

  const isFinished = !!winnerId

  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: { scoreA, scoreB, status: isFinished ? "FINISHED" : "PLAYING", winnerId }
    })

    if (isFinished && winnerId && match.nextMatchId) {
      const isNextA = match.position % 2 === 0
      const updateData = isNextA ? { teamAId: winnerId } : { teamBId: winnerId }
      
      await tx.match.update({
        where: { id: match.nextMatchId },
        data: updateData
      })
    }
  }, {
    timeout: 10000 // Aumentado um pouco para segurança
  })
  
  revalidatePath(`/league/${match.leagueId}`)
}