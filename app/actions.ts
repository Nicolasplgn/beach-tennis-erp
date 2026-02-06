'use server'

import { prisma } from '@/lib/prisma'
import { auth, signIn, signOut } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- AUTH ---
export async function loginAction(formData: FormData) {
  await signIn("credentials", formData)
}
export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}

// --- LIGAS ---
export async function createLeague(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return
  const name = formData.get('name') as string
  const league = await prisma.league.create({ data: { name, adminId: session.user.id } })
  revalidatePath('/')
  redirect(`/league/${league.id}`)
}

export async function deleteLeague(id: string) {
  const session = await auth()
  if (!session?.user?.id) return
  await prisma.league.delete({ where: { id, adminId: session.user.id } })
  revalidatePath('/')
}

// --- TORNEIOS ---
export async function createTournament(leagueId: string, formData: FormData) {
  const name = formData.get('name') as string
  const dateStr = formData.get('date') as string
  if (!name || !dateStr) return
  const date = new Date(dateStr)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
  await prisma.tournament.create({ data: { name, date, leagueId, status: 'DRAFT' } })
  revalidatePath(`/league/${leagueId}`)
}

export async function deleteTournament(tournamentId: string, leagueId: string) {
    await prisma.tournament.delete({ where: { id: tournamentId } })
    revalidatePath(`/league/${leagueId}`)
}

// --- JOGADORES ---
export async function addPlayer(leagueId: string, formData: FormData) {
  const name = formData.get('name') as string
  const level = formData.get('level') as string
  const nickname = formData.get('nickname') as string
  if (!name) return
  await prisma.player.create({ data: { name, nickname, level, leagueId } })
  revalidatePath(`/league/${leagueId}`)
}

export async function togglePlayerInTournament(tournamentId: string, playerId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { participants: { where: { id: playerId } } }
  })
  if (tournament?.participants.length) {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { participants: { disconnect: { id: playerId } } } })
  } else {
    await prisma.tournament.update({ where: { id: tournamentId }, data: { participants: { connect: { id: playerId } } } })
  }
  revalidatePath(`/tournament/${tournamentId}`)
}

export async function updatePlayer(playerId: string, leagueId: string, formData: FormData) {
  const name = formData.get('name') as string
  const nickname = formData.get('nickname') as string
  const level = formData.get('level') as string
  const points = parseInt(formData.get('points') as string) || 0
  await prisma.player.update({ where: { id: playerId }, data: { name, nickname, level, points } })
  revalidatePath(`/league/${leagueId}`)
}

export async function deletePlayer(playerId: string, leagueId: string) {
  await prisma.player.delete({ where: { id: playerId } })
  revalidatePath(`/league/${leagueId}`)
}

// --- SORTEIO E CHAVEAMENTO ---
export async function generateTeams(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId }, include: { participants: true } })
  if (!tournament || tournament.participants.length < 4) return
  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { tournamentId } })
    await tx.team.deleteMany({ where: { tournamentId } })
    await tx.tournament.update({ where: { id: tournamentId }, data: { status: 'DRAFT' }})
    const shuffled = [...tournament.participants].sort(() => Math.random() - 0.5)
    for (let i = 0; i < shuffled.length; i += 2) {
      const p1 = shuffled[i]; const p2 = shuffled[i+1]
      if (p2) {
        await tx.team.create({
          data: { tournamentId, name: `${p1.nickname || p1.name.split(' ')[0]} & ${p2.nickname || p2.name.split(' ')[0]}`, players: { connect: [{ id: p1.id }, { id: p2.id }] } }
        })
      }
    }
  }, { timeout: 20000 })
  revalidatePath(`/tournament/${tournamentId}`)
}

export async function generateBracket(tournamentId: string, format: 'KNOCKOUT' | 'GROUPS') {
  const teams = await prisma.team.findMany({ where: { tournamentId } })
  if (teams.length < 2) return
  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { tournamentId } })
    await tx.tournament.update({ where: { id: tournamentId }, data: { status: 'ACTIVE', format } })
    if (format === 'GROUPS') {
        const shuffled = [...teams].sort(() => Math.random() - 0.5)
        const half = Math.ceil(shuffled.length / 2)
        const gA = shuffled.slice(0, half); const gB = shuffled.slice(half)
        for (const t of gA) await tx.team.update({ where: { id: t.id }, data: { group: 'A' } })
        for (const t of gB) await tx.team.update({ where: { id: t.id }, data: { group: 'B' } })
        const createRoundRobin = async (groupTeams: any[], groupName: string) => {
            let count = 0
            for (let i = 0; i < groupTeams.length; i++) {
                for (let j = i + 1; j < groupTeams.length; j++) {
                    count++
                    await tx.match.create({ data: { tournamentId, type: 'GROUP_STAGE', group: groupName, round: 1, position: count, teamAId: groupTeams[i].id, teamBId: groupTeams[j].id, status: 'PENDING' } })
                }
            }
        }
        await createRoundRobin(gA, 'A'); await createRoundRobin(gB, 'B')
    } else {
        const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(teams.length)))
        const totalRounds = Math.log2(powerOfTwo)
        const bracketSlots: (any | null)[] = [...teams].sort(() => Math.random() - 0.5)
        while (bracketSlots.length < powerOfTwo) bracketSlots.push(null)
        const createdMatches: Record<number, Record<number, string>> = {}
        for (let r = totalRounds; r >= 1; r--) {
          const nMatches = Math.pow(2, totalRounds - r)
          createdMatches[r] = {}
          for (let pos = 0; pos < nMatches; pos++) {
            const nextId = r < totalRounds ? createdMatches[r + 1][Math.floor(pos / 2)] : undefined
            let tAId = undefined, tBId = undefined, status = "PENDING", winnerId = undefined
            if (r === 1) {
              const tA = bracketSlots[pos * 2]; const tB = bracketSlots[pos * 2 + 1]
              tAId = tA?.id; tBId = tB?.id
              if (tA && !tB) { status = "FINISHED"; winnerId = tA.id }
              else if (!tA && tB) { status = "FINISHED"; winnerId = tB.id }
            }
            const match = await tx.match.create({ data: { tournamentId, round: r, position: pos, nextMatchId: nextId, teamAId: tAId, teamBId: tBId, status, winnerId, type: 'KNOCKOUT' } })
            createdMatches[r][pos] = match.id
            if (status === "FINISHED" && winnerId && nextId) {
               const updateData = (pos % 2 === 0) ? { teamAId: winnerId } : { teamBId: winnerId }
               await tx.match.update({ where: { id: nextId }, data: updateData })
            }
          }
        }
    }
  }, { timeout: 30000 })
  revalidatePath(`/tournament/${tournamentId}`)
}

export async function updateScore(matchId: string, scoreA: number, scoreB: number) {
  const match = await prisma.match.findUnique({ where: { id: matchId }, include: { tournament: true } })
  if (!match) return
  let winnerId: string | null = null
  if (scoreA > scoreB) winnerId = match.teamAId
  else if (scoreB > scoreA) winnerId = match.teamBId
  await prisma.$transaction(async (tx) => {
    await tx.match.update({ where: { id: matchId }, data: { scoreA, scoreB, status: "FINISHED", winnerId } })
    if (match.type === 'KNOCKOUT' && winnerId && match.nextMatchId) {
      const isNextA = match.position % 2 === 0
      const updateData = isNextA ? { teamAId: winnerId } : { teamBId: winnerId }
      await tx.match.update({ where: { id: match.nextMatchId }, data: updateData })
    }
  })
  revalidatePath(`/tournament/${match.tournamentId}`)
}

// --- FASE FINAL (SEMIS CRUZADAS COM CONFRONTO DIRETO) ---
export async function generateFinalStage(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { teams: true, matches: { where: { type: 'GROUP_STAGE' }, include: { teamA: true, teamB: true } } }
  })
  if (!tournament) return

  const getTopTwo = (groupName: string) => {
    const groupTeams = tournament.teams.filter(t => t.group === groupName)
    const groupMatches = tournament.matches.filter(m => m.group === groupName)
    const stats: Record<string, any> = {}
    
    groupTeams.forEach(t => stats[t.id] = { id: t.id, wins: 0, balance: 0 })
    
    groupMatches.forEach(m => {
      if (m.status === 'FINISHED' && m.winnerId) {
        stats[m.winnerId].wins += 1
        const loserId = m.winnerId === m.teamAId ? m.teamBId : m.teamAId
        if (loserId && stats[loserId]) {
            stats[m.winnerId].balance += Math.abs((m.scoreA || 0) - (m.scoreB || 0))
            stats[loserId].balance -= Math.abs((m.scoreA || 0) - (m.scoreB || 0))
        }
      }
    })

    return Object.values(stats).sort((a: any, b: any) => {
        // 1. Critério: Vitórias
        if (b.wins !== a.wins) return b.wins - a.wins

        // 2. Critério: Confronto Direto
        const h2h = groupMatches.find(m => 
            (m.teamAId === a.id && m.teamBId === b.id) || 
            (m.teamAId === b.id && m.teamBId === a.id)
        )
        if (h2h && h2h.status === 'FINISHED' && h2h.winnerId) {
            return h2h.winnerId === a.id ? -1 : 1
        }

        // 3. Critério: Saldo de Games
        return b.balance - a.balance
    }).slice(0, 2)
  }

  const topA = getTopTwo('A'); const topB = getTopTwo('B')
  if (topA.length < 2 || topB.length < 2) return

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { tournamentId, type: 'KNOCKOUT' } })
    const final = await tx.match.create({ data: { tournamentId, type: 'KNOCKOUT', round: 3, position: 0, status: 'PENDING' } })
    await tx.match.create({ data: { tournamentId, type: 'KNOCKOUT', round: 2, position: 0, teamAId: topA[0].id, teamBId: topB[1].id, nextMatchId: final.id, status: 'PENDING' } })
    await tx.match.create({ data: { tournamentId, type: 'KNOCKOUT', round: 2, position: 1, teamAId: topB[0].id, teamBId: topA[1].id, nextMatchId: final.id, status: 'PENDING' } })
  })
  revalidatePath(`/tournament/${tournamentId}`)
}