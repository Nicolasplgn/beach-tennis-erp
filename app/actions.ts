'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

// --- LIGAS ---
export async function createLeague(formData: FormData) {
  // SIMULAÇÃO: Cria um admin padrão se não existir (para o MVP funcionar sem login complexo agora)
  let user = await prisma.user.findUnique({ where: { email: "admin@beach.com" }})
  if (!user) {
    user = await prisma.user.create({ 
      data: { email: "admin@beach.com", password: "123", name: "Admin Geral" }
    })
  }

  const name = formData.get('name') as string
  
  const newLeague = await prisma.league.create({
    data: {
      name,
      status: 'DRAFT', // Começa como rascunho
      adminId: user.id
    }
  })
  
  revalidatePath('/')
  redirect(`/league/${newLeague.id}`)
}

// --- JOGADORES ---
export async function addPlayer(leagueId: string, formData: FormData) {
  const name = formData.get('name') as string
  const level = formData.get('level') as string
  
  if (!name) return;

  await prisma.player.create({
    data: { name, level, leagueId }
  })
  
  revalidatePath(`/league/${leagueId}`)
}

export async function deletePlayer(playerId: string, leagueId: string) {
    await prisma.player.delete({ where: { id: playerId }})
    revalidatePath(`/league/${leagueId}`)
}

// --- SORTEIO DE DUPLAS (ALGORITMO) ---
export async function generateTeams(leagueId: string) {
  // 1. Buscar todos os jogadores da liga
  const players = await prisma.player.findMany({ where: { leagueId } })
  
  if (players.length < 2) {
    throw new Error("Precisa de pelo menos 2 jogadores")
  }

  // 2. Limpar times antigos dessa liga (Reset)
  // Atenção: Isso apaga partidas também por causa do CASCADE
  await prisma.team.deleteMany({ where: { leagueId } })

  // 3. Embaralhar array (Fisher-Yates Shuffle)
  const shuffled = [...players].sort(() => Math.random() - 0.5)

  // 4. Criar as duplas no banco
  for (let i = 0; i < shuffled.length; i += 2) {
    // Se sobrar um jogador (ímpar), cria um time incompleto ou espera lógica de "sobra"
    // Aqui vamos criar o time mesmo que fique sozinho (para visualização)
    const player1 = shuffled[i];
    const player2 = shuffled[i+1]; // Pode ser undefined se for impar

    const members = [{ id: player1.id }]
    if (player2) members.push({ id: player2.id })

    await prisma.team.create({
      data: {
        leagueId,
        name: `Dupla ${Math.floor(i/2) + 1}`,
        players: {
          connect: members
        }
      }
    })
  }

  // 5. Atualizar status da liga
  await prisma.league.update({
    where: { id: leagueId },
    data: { status: 'ACTIVE' }
  })

  revalidatePath(`/league/${leagueId}`)
}