import { prisma } from '@/lib/prisma'
import { deleteTournament } from '@/app/actions'
import { CreateTournamentModal } from '@/app/components/CreateTournamentModal'
import { AddPlayerModal } from '@/app/components/AddPlayerModal' // Import novo
import { Trophy, Calendar, ArrowRight, Trash2, ArrowLeft, Medal, Users, LayoutDashboard, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const league = await prisma.league.findUnique({
    where: { id },
    include: { 
      players: { orderBy: { points: 'desc' } }, 
      tournaments: { orderBy: { date: 'desc' } } 
    }
  })

  if (!league) return <div>404</div>

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER DA LIGA */}
        <div className="flex items-center gap-4">
            <Link href="/" className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-slate-400 hover:text-indigo-600">
               <ArrowLeft size={20}/>
            </Link>
            <div>
               <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{league.name}</h1>
               <div className="flex items-center gap-3 mt-1">
                   <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Ativa</span>
                   <span className="text-slate-400 text-xs font-medium">Criada em {new Date(league.createdAt).toLocaleDateString()}</span>
               </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUNA ESQUERDA: RANKING (LIMPO) */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 h-fit">
                    
                    {/* CABEÇALHO DO CARD COM O BOTÃO DE ADICIONAR */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                            <Trophy className="text-yellow-500" size={24}/> Ranking
                        </h2>
                        
                        {/* AQUI FICA O BOTÃO NOVO */}
                        <AddPlayerModal leagueId={league.id} />
                    </div>
                    
                    {/* LISTA DO RANKING */}
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                        {league.players.map((player, index) => (
                            <div key={player.id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group">
                                <div className="flex items-center gap-3">
                                    {/* Medalha/Posição */}
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-black ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-slate-100 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-white border border-slate-100 text-slate-400'}`}>
                                        {index + 1}
                                    </div>
                                    
                                    {/* Nome e Categoria */}
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{player.name}</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Cat. {player.level}</p>
                                            {player.nickname && <p className="text-[10px] text-indigo-400">({player.nickname})</p>}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Pontos */}
                                <div className="text-right">
                                    <span className="block font-black text-indigo-600 text-sm leading-none">{player.points}</span>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase">PTS</span>
                                </div>
                            </div>
                        ))}
                        {league.players.length === 0 && (
                            <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                                <Users size={32} className="opacity-20 mb-2"/>
                                <p className="text-xs font-medium">Lista vazia.</p>
                                <p className="text-[10px]">Clique no + para adicionar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* COLUNA DIREITA: TORNEIOS */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <Calendar className="text-indigo-500" size={24}/> Torneios da Liga
                        </h2>
                        {/* Botão Modal para criar torneio */}
                        <CreateTournamentModal leagueId={league.id} />
                    </div>

                    <div className="grid gap-4">
                        {league.tournaments.map(t => (
                            <div key={t.id} className="group bg-white hover:bg-slate-50 p-5 rounded-3xl border border-slate-200 hover:border-indigo-200 transition-all flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Medal size={24}/>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{t.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${t.status === 'FINISHED' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {t.status === 'DRAFT' ? 'Aberto' : t.status === 'ACTIVE' ? 'Jogando' : 'Finalizado'}
                                            </span>
                                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                <Calendar size={12}/> {new Date(t.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/tournament/${t.id}`} className="px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-lg shadow-slate-200">
                                        Gerenciar <ArrowRight size={14}/>
                                    </Link>
                                    <form action={deleteTournament.bind(null, t.id, league.id)}>
                                        <button className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                                    </form>
                                </div>
                            </div>
                        ))}
                         {league.tournaments.length === 0 && (
                            <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                                <LayoutDashboard size={40} className="mx-auto mb-3 text-slate-300"/>
                                <p className="font-bold text-slate-400">Nenhum torneio criado.</p>
                                <p className="text-xs text-slate-400 mt-1">Clique em "Criar Torneio" para começar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}