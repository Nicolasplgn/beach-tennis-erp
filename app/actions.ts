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

// --- JOGADORES (CADASTRO E CONTROLE) ---
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
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { participants: { disconnect: { id: playerId } } }
    })
  } else {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { participants: { connect: { id: playerId } } }
    })
  }
  revalidatePath(`/tournament/${tournamentId}`)
}

// ESTA É A ÚNICA VERSÃO DA UPDATE PLAYER (MANUAL)
export async function updatePlayer(playerId: string, leagueId: string, formData: FormData) {
  const name = formData.get('name') as string
  const nickname = formData.get('nickname') as string
  const level = formData.get('level') as string
  const points = parseInt(formData.get('points') as string) || 0

  await prisma.player.update({ 
    where: { id: playerId }, 
    data: { name, nickname, level, points } 
  })
  
  revalidatePath(`/league/${leagueId}`)
}

export async function deletePlayer(playerId: string, leagueId: string) {
  await prisma.player.delete({ where: { id: playerId } })
  revalidatePath(`/league/${leagueId}`)
}

// --- SORTEIO E CHAVEAMENTO ---
// --- SORTEIO E CHAVEAMENTO ---
export async function generateTeams(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({ 
    where: { id: tournamentId }, 
    include: { participants: true }
  })
  
  if (!tournament || tournament.participants.length < 4) return

  // Aumentamos o timeout para 20 segundos (20000ms)
  await prisma.$transaction(async (tx) => {
    // 1. Limpa dados antigos
    await tx.match.deleteMany({ where: { tournamentId } })
    await tx.team.deleteMany({ where: { tournamentId } })
    await tx.tournament.update({ where: { id: tournamentId }, data: { status: 'DRAFT' }})

    // 2. Sorteia e cria as duplas
    const shuffled = [...tournament.participants].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < shuffled.length; i += 2) {
      const p1 = shuffled[i]
      const p2 = shuffled[i+1]
      
      if (p2) {
        await tx.team.create({
          data: {
            tournamentId,
            name: `${p1.nickname || p1.name.split(' ')[0]} & ${p2.nickname || p2.name.split(' ')[0]}`,
            players: { connect: [{ id: p1.id }, { id: p2.id }] }
          }
        })
      }
    }
  }, {
    timeout: 20000 // <--- ADICIONE ISSO AQUI (20 SEGUNDOS)
  })

  revalidatePath(`/tournament/${tournamentId}`)
}

export async function generateBracket(tournamentId: string, format: 'KNOCKOUT' | 'GROUPS') {
  // 1. Busca todos os times vinculados a este torneio específico
  const teams = await prisma.team.findMany({ 
    where: { tournamentId } 
  })

  // Validação mínima
  if (teams.length < 2) return

  // Início da transação com aumento de tempo limite para 30 segundos
  await prisma.$transaction(async (tx) => {
    
    // 2. Limpeza: Remove qualquer partida existente para evitar duplicidade ao regerar
    await tx.match.deleteMany({ 
      where: { tournamentId } 
    })

    // 3. Atualiza o status do torneio para Ativo e define o formato escolhido
    await tx.tournament.update({ 
      where: { id: tournamentId }, 
      data: { status: 'ACTIVE', format: format } 
    })

    // --- LÓGICA PARA FASE DE GRUPOS ---
    if (format === 'GROUPS') {
        const shuffled = [...teams].sort(() => Math.random() - 0.5)
        const half = Math.ceil(shuffled.length / 2)
        
        const groupA = shuffled.slice(0, half)
        const groupB = shuffled.slice(half)

        // Atribui os times aos seus respectivos grupos no banco de dados
        for (const team of groupA) {
            await tx.team.update({ where: { id: team.id }, data: { group: 'A' } })
        }
        for (const team of groupB) {
            await tx.team.update({ where: { id: team.id }, data: { group: 'B' } })
        }

        // Função interna para gerar jogos "Todos contra Todos" dentro do grupo
        const createRoundRobin = async (groupTeams: typeof teams, groupName: string) => {
            let positionCount = 0
            for (let i = 0; i < groupTeams.length; i++) {
                for (let j = i + 1; j < groupTeams.length; j++) {
                    positionCount++
                    await tx.match.create({
                        data: { 
                            tournamentId: tournamentId, 
                            type: 'GROUP_STAGE', 
                            group: groupName, 
                            round: 1, 
                            position: positionCount, 
                            teamAId: groupTeams[i].id, 
                            teamBId: groupTeams[j].id, 
                            status: 'PENDING' 
                        }
                    })
                }
            }
        }

        await createRoundRobin(groupA, 'A')
        await createRoundRobin(groupB, 'B')

    } else {
        // --- LÓGICA PARA MATA-MATA (KNOCKOUT) ---
        // Calcula a potência de 2 mais próxima (ex: 6 times -> chave de 8)
        const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(teams.length)))
        const totalRounds = Math.log2(powerOfTwo)
        
        // Preenche os espaços vazios (BYES) se o número de times não for potência de 2
        const bracketSlots: (any | null)[] = [...teams].sort(() => Math.random() - 0.5)
        while (bracketSlots.length < powerOfTwo) {
            bracketSlots.push(null)
        }
        
        const createdMatches: Record<number, Record<number, string>> = {}

        // Gera as partidas da Final para a Primeira Rodada (de trás para frente para mapear nextMatchId)
        for (let r = totalRounds; r >= 1; r--) {
          const numMatchesInRound = Math.pow(2, totalRounds - r)
          createdMatches[r] = {}

          for (let pos = 0; pos < numMatchesInRound; pos++) {
            // Define qual será a próxima partida para onde o vencedor irá
            const nextMatchId = r < totalRounds ? createdMatches[r + 1][Math.floor(pos / 2)] : undefined
            
            let teamAId = undefined
            let teamBId = undefined
            let status = "PENDING"
            let winnerId = undefined

            // Preenche a Rodada 1 com os times sorteados ou define vitórias por WO (BYES)
            if (r === 1) {
              const teamA = bracketSlots[pos * 2]
              const teamB = bracketSlots[pos * 2 + 1]
              
              teamAId = teamA?.id
              teamBId = teamB?.id

              // Se um dos lados for vazio (BYE), o outro vence automaticamente
              if (teamA && !teamB) { 
                  status = "FINISHED"
                  winnerId = teamA.id 
              } else if (!teamA && teamB) { 
                  status = "FINISHED"
                  winnerId = teamB.id 
              }
            }

            const match = await tx.match.create({
              data: { 
                  tournamentId: tournamentId, 
                  round: r, 
                  position: pos, 
                  nextMatchId: nextMatchId, 
                  teamAId: teamAId, 
                  teamBId: teamBId, 
                  status: status, 
                  winnerId: winnerId, 
                  type: 'KNOCKOUT' 
              }
            })

            createdMatches[r][pos] = match.id

            // Se a partida já foi finalizada (por conta de um BYE), avança o vencedor para o próximo jogo
            if (status === "FINISHED" && winnerId && nextMatchId) {
               const updateData = (pos % 2 === 0) ? { teamAId: winnerId } : { teamBId: winnerId }
               await tx.match.update({ 
                   where: { id: nextMatchId }, 
                   data: updateData 
                })
            }
          }
        }
    }
  }, {
    timeout: 30000 // Aumentado para 30 segundos para garantir a conclusão em conexões lentas
  })

  // Atualiza a interface do usuário
  revalidatePath(`/tournament/${tournamentId}`)
}

// ESTA É A VERSÃO ÚNICA DA UPDATE SCORE (SEM PONTOS AUTOMÁTICOS)
export async function updateScore(matchId: string, scoreA: number, scoreB: number) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true }
  })
  if (!match) return

  let winnerId: string | null = null
  if (scoreA > scoreB) winnerId = match.teamAId
  else if (scoreB > scoreA) winnerId = match.teamBId

  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: { scoreA, scoreB, status: "FINISHED", winnerId }
    })

    if (match.type === 'KNOCKOUT' && winnerId && match.nextMatchId) {
      const isNextA = match.position % 2 === 0
      const updateData = isNextA ? { teamAId: winnerId } : { teamBId: winnerId }
      await tx.match.update({ where: { id: match.nextMatchId }, data: updateData })
    }
  })
  
  revalidatePath(`/tournament/${match.tournamentId}`)
}