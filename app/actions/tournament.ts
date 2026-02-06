'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function generateBracket(leagueId: string) {
  try {
    // 1. Buscar e Validar Times
    const teams = await prisma.team.findMany({
      where: { leagueId },
      include: { players: true }
    })

    if (teams.length < 2) {
      throw new Error("É necessário no mínimo 2 duplas para gerar o chaveamento.")
    }

    // 2. Calcular Estrutura Matemática
    const totalTeams = teams.length
    const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(totalTeams)))
    const totalRounds = Math.log2(powerOfTwo)
    const byes = powerOfTwo - totalTeams

    // 3. Preparar Slots
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5)
    
    // Lista final de slots (Times + Nulls)
    let bracketSlots: (typeof teams[0] | null)[] = [...shuffledTeams]
    
    for (let i = 0; i < byes; i++) {
        bracketSlots.push(null)
    }

    // 4. Transação
    await prisma.$transaction(async (tx) => {
        await tx.match.deleteMany({ where: { leagueId } })

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

                // CORREÇÃO DE TIPAGEM AQUI: Usar undefined ao invés de null inicial
                let teamAId: string | undefined = undefined
                let teamBId: string | undefined = undefined
                let status = "PENDING"
                let winnerId: string | undefined = undefined
                let scoreA: number | undefined = undefined
                let scoreB: number | undefined = undefined

                if (r === 1) {
                    const tA = bracketSlots[pos * 2]
                    const tB = bracketSlots[pos * 2 + 1]
                    
                    teamAId = tA?.id
                    teamBId = tB?.id

                    if (tA && !tB) {
                        status = "FINISHED"
                        winnerId = tA.id
                        scoreA = 0; scoreB = 0;
                    } else if (!tA && tB) {
                        status = "FINISHED"
                        winnerId = tB.id
                        scoreA = 0; scoreB = 0;
                    } else if (!tA && !tB) {
                        status = "FINISHED"
                    }
                }

                const match = await tx.match.create({
                    data: {
                        leagueId,
                        round: r,
                        position: pos,
                        nextMatchId,
                        teamAId,
                        teamBId,
                        status,
                        winnerId,
                        scoreA, // Agora é number | undefined
                        scoreB  // Agora é number | undefined
                    }
                })
                
                createdMatches[r][pos] = match.id

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

        await tx.league.update({
            where: { id: leagueId },
            data: { status: 'IN_PROGRESS' }
        })
    })

    revalidatePath(`/league/${leagueId}`)
    // Retornamos um objeto simples que não quebra a assinatura do form action
    return { success: true }

  } catch (error) {
    console.error("Erro fatal ao gerar chaveamento:", error)
    return { error: "Falha interna ao gerar chaveamento." }
  }
}