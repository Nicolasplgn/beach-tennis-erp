'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Função corrigida para receber tournamentId
export async function generateBracket(tournamentId: string, format: 'KNOCKOUT' | 'GROUPS') {
  try {
    // 1. Buscar Times pelo Torneio (e não pela liga)
    const teams = await prisma.team.findMany({
      where: { tournamentId }, // CORRIGIDO: tournamentId
      include: { players: true }
    })

    if (teams.length < 2) {
      // Retornamos erro para tratar no front (opcional) ou apenas paramos
      return { error: "Mínimo de 2 duplas necessárias." }
    }

    // 2. Transação
    await prisma.$transaction(async (tx) => {
        // Limpar partidas antigas DESTE torneio
        await tx.match.deleteMany({ where: { tournamentId } })

        // 3. Preparar Lógica Matemática (Mata-Mata)
        if (format === 'KNOCKOUT') {
            const totalTeams = teams.length
            const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(totalTeams)))
            const totalRounds = Math.log2(powerOfTwo)
            const byes = powerOfTwo - totalTeams

            // Embaralhar
            const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)
            
            // Slots (Times + Nulls para Byes)
            let bracketSlots: (typeof teams[0] | null)[] = [...shuffledTeams]
            for (let i = 0; i < byes; i++) {
                bracketSlots.push(null)
            }

            const createdMatches: Record<number, Record<number, string>> = {}

            for (let r = totalRounds; r >= 1; r--) {
                const numMatchesInRound = Math.pow(2, totalRounds - r) 
                createdMatches[r] = {}

                for (let pos = 0; pos < numMatchesInRound; pos++) {
                    let nextMatchId: string | undefined = undefined
                    
                    if (r < totalRounds) {
                        const parentPos = Math.floor(pos / 2)
                        nextMatchId = createdMatches[r + 1][parentPos]
                    }

                    let teamAId: string | undefined = undefined
                    let teamBId: string | undefined = undefined
                    let status = "PENDING"
                    let winnerId: string | undefined = undefined

                    // Primeira rodada preenche com os times/byes
                    if (r === 1) {
                        const tA = bracketSlots[pos * 2]
                        const tB = bracketSlots[pos * 2 + 1]
                        
                        teamAId = tA?.id
                        teamBId = tB?.id

                        if (tA && !tB) {
                            status = "FINISHED"
                            winnerId = tA.id
                        } else if (!tA && tB) {
                            status = "FINISHED"
                            winnerId = tB.id
                        }
                    }

                    // CORRIGIDO: Usando tournamentId e campos corretos
                    const match = await tx.match.create({
                        data: {
                            tournamentId, // Link com o torneio
                            round: r,
                            position: pos,
                            nextMatchId,
                            teamAId,
                            teamBId,
                            status,
                            winnerId,
                            type: 'KNOCKOUT'
                        }
                    })
                    
                    createdMatches[r][pos] = match.id

                    // Avançar vencedor automaticamente se for Bye
                    if (status === "FINISHED" && winnerId && nextMatchId) {
                        const isTeamAInNext = (pos % 2 === 0)
                        const updateData = isTeamAInNext 
                            ? { teamAId: winnerId } 
                            : { teamBId: winnerId }
                        
                        await tx.match.update({
                            where: { id: nextMatchId },
                            data: updateData
                        })
                    }
                }
            }
        } 
        
        // CORRIGIDO: Atualizar Status do TORNEIO, não da Liga
        await tx.tournament.update({
            where: { id: tournamentId },
            data: { status: 'ACTIVE', format }
        })
    })

    revalidatePath(`/tournament/${tournamentId}`)
    return { success: true }

  } catch (error) {
    console.error("Erro ao gerar chaveamento:", error)
    return { error: "Falha interna." }
  }
}