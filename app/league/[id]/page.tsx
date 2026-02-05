import { PrismaClient } from '@prisma/client'
import { addPlayer, generateTeams, deletePlayer } from '@/app/actions'
import { Users, Shield, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function LeaguePage({ params }: { params: { id: string } }) {
  // Busca dados profundos da liga
  const league = await prisma.league.findUnique({
    where: { id: params.id },
    include: { 
      players: { orderBy: { name: 'asc' } }, 
      teams: { include: { players: true } } 
    }
  })

  if (!league) return <div className="p-8">Liga não encontrada</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="mb-8">
          <Link href="/" className="text-slate-500 hover:text-orange-600 flex items-center gap-1 text-sm mb-4">
            <ArrowLeft size={16}/> Voltar para Home
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{league.name}</h1>
              <p className="text-slate-500">Gerencie jogadores e sorteios</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
               league.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {league.status === 'DRAFT' ? 'Aguardando Início' : 'Em Andamento'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* PAINEL DE JOGADORES */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                <Users size={20} className="text-blue-500"/> Jogadores 
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                  {league.players.length}
                </span>
              </h2>
            </div>
            
            <form action={addPlayer.bind(null, league.id)} className="flex gap-2 mb-6">
              <input name="name" placeholder="Nome do Jogador" className="flex-1 border p-2 rounded-lg text-sm" required />
              <select name="level" className="border p-2 rounded-lg text-sm bg-slate-50 text-slate-600">
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermed.</option>
                <option value="Avançado">Avançado</option>
              </select>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg font-bold text-lg">+</button>
            </form>

            <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2">
              {league.players.map(player => (
                <li key={player.id} className="py-3 flex justify-between items-center group">
                  <div>
                    <p className="font-medium text-slate-700">{player.name}</p>
                    <p className="text-xs text-slate-400">{player.level}</p>
                  </div>
                  <form action={deletePlayer.bind(null, player.id, league.id)}>
                    <button className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">
                        <Trash2 size={16}/>
                    </button>
                  </form>
                </li>
              ))}
              {league.players.length === 0 && <p className="text-sm text-slate-400 italic">Nenhum jogador cadastrado.</p>}
            </ul>
          </div>

          {/* PAINEL DE SORTEIO */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                <Shield size={20} className="text-purple-500"/> Duplas
              </h2>
              {league.players.length >= 2 && (
                <form action={generateTeams.bind(null, league.id)}>
                   <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm shadow-purple-200">
                    Sortear Duplas
                  </button>
                </form>
              )}
            </div>

            {league.teams.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm mb-2">As duplas ainda não foram formadas.</p>
                <p className="text-xs text-slate-400">Cadastre pelo menos 2 jogadores para sortear.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {league.teams.map((team) => (
                  <div key={team.id} className="border border-slate-200 p-3 rounded-lg flex justify-between items-center bg-slate-50/50">
                    <div className="font-bold text-slate-700 text-sm">{team.name}</div>
                    <div className="flex items-center gap-2">
                        {team.players.map(p => (
                            <span key={p.id} className="bg-white border text-xs px-2 py-1 rounded text-slate-600 shadow-sm">
                                {p.name}
                            </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Aviso sobre ímpar */}
            {league.teams.some(t => t.players.length === 1) && (
              <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-100">
                ⚠️ Atenção: Há jogadores sem dupla (número ímpar de participantes).
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}