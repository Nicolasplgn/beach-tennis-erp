import { prisma } from '@/lib/prisma'
import { deleteTournament } from '@/app/actions'
import { CreateTournamentModal } from '@/app/components/CreateTournamentModal'
import { AddPlayerModal } from '@/app/components/AddPlayerModal'
import { RankingRow } from './RankingRow'
import { Trophy, Calendar, ArrowRight, Trash2, ArrowLeft, Medal, Users, LayoutDashboard } from 'lucide-react'
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
    <div className="min-h-screen pb-20">
      
      {/* HEADER BANNER - QUEBRA O BRANCO */}
      <div className="bg-linear-to-br from-indigo-900 via-indigo-800 to-violet-900 pt-32 pb-24 px-6 md:px-12 relative overflow-hidden rounded-b-[3rem] shadow-2xl shadow-indigo-900/20">
        {/* Efeitos de fundo */}
        <div className="absolute top-0 right-0 p-64 bg-white/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 p-40 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-indigo-200 hover:text-white mb-6 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-widest hover:bg-white/20">
               <ArrowLeft size={16}/> Voltar para Home
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-sm">
                        {league.name}
                    </h1>
                    <div className="flex items-center gap-4 mt-4">
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-black uppercase tracking-widest">
                            Liga Ativa
                        </span>
                        <span className="text-indigo-200 text-sm font-medium flex items-center gap-2">
                            <Calendar size={16}/> Criada em {new Date(league.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Stats Rápidos */}
                <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center min-w-[100px]">
                        <p className="text-3xl font-black text-white">{league.players.length}</p>
                        <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Atletas</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center min-w-[100px]">
                        <p className="text-3xl font-black text-white">{league.tournaments.length}</p>
                        <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Torneios</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
            
            {/* COLUNA ESQUERDA: RANKING */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white/80 backdrop-blur-xl p-1 rounded-[2.5rem] border border-white/60 shadow-xl shadow-indigo-900/5">
                    <div className="bg-white rounded-[2rem] p-6 h-full">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                            <h2 className="font-black text-slate-900 flex items-center gap-3 text-xl uppercase italic tracking-tight">
                                <span className="bg-yellow-100 text-yellow-600 p-2 rounded-xl"><Trophy size={20}/></span> Ranking
                            </h2>
                            <AddPlayerModal leagueId={league.id} />
                        </div>
                        
                        <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                            {league.players.map((player, index) => (
                                <RankingRow key={player.id} player={player} index={index} leagueId={league.id} />
                            ))}
                            
                            {league.players.length === 0 && (
                                <div className="text-center py-20 opacity-40">
                                    <Users size={48} className="mx-auto mb-4 text-slate-400"/>
                                    <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Nenhum atleta inscrito</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUNA DIREITA: TORNEIOS */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white/80 backdrop-blur-xl p-1 rounded-[2.5rem] border border-white/60 shadow-xl shadow-indigo-900/5">
                    <div className="bg-white rounded-[2rem] p-8 h-full">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                            <h2 className="font-black text-slate-900 flex items-center gap-3 text-xl uppercase italic tracking-tight">
                                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl"><Calendar size={20}/></span> Torneios
                            </h2>
                            <CreateTournamentModal leagueId={league.id} />
                        </div>

                        <div className="grid gap-4">
                            {league.tournaments.map(t => (
                                <div key={t.id} className="group bg-slate-50 hover:bg-white p-5 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all flex justify-between items-center shadow-sm hover:shadow-xl hover:shadow-indigo-500/10">
                                    <div className="flex items-center gap-5">
                                        <div className="bg-white border border-slate-200 text-indigo-600 p-3 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                            <Medal size={24}/>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{t.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${t.status === 'FINISHED' ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                                    {t.status === 'DRAFT' ? 'Aberto' : t.status === 'ACTIVE' ? 'Jogando' : 'Finalizado'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                    {new Date(t.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/tournament/${t.id}`} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200 flex items-center gap-2">
                                            Gerenciar <ArrowRight size={14}/>
                                        </Link>
                                        <form action={deleteTournament.bind(null, t.id, league.id)}>
                                            <button className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                                                <Trash2 size={18}/>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                            {league.tournaments.length === 0 && (
                                <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
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