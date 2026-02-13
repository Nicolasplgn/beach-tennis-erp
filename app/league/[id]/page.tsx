import { prisma } from '@/lib/prisma'
import { deleteTournament } from '@/app/actions'
import { CreateTournamentModal } from '@/app/components/CreateTournamentModal'
import { AddPlayerModal } from '@/app/components/AddPlayerModal'
import { RankingRow } from './RankingRow'
import { Trophy, Calendar, ArrowRight, Trash2, ArrowLeft, Medal, Users, LayoutDashboard, Home, AlertCircle } from 'lucide-react'
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

  // Tratamento de erro visual se a liga não existir
  if (!league) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-4 text-center">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200 max-w-md w-full">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Liga não encontrada</h1>
            <p className="text-slate-500 mb-8 font-medium">O link que você acessou é inválido.</p>
            <Link href="/" className="w-full bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                <Home size={20}/> Voltar ao Início
            </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER DA LIGA */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
                <Link href="/" className="bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors text-slate-400 hover:text-indigo-600">
                   <ArrowLeft size={24}/>
                </Link>
                <div>
                   <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{league.name}</h1>
                   <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest">Liga Ativa</span>
                       <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                          <Calendar size={12}/> Criada em {new Date(league.createdAt).toLocaleDateString()}
                       </span>
                   </div>
                </div>
            </div>
            
            <div className="flex gap-4">
                <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl text-center min-w-[100px]">
                    <p className="text-2xl font-black text-indigo-600">{league.players.length}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Atletas</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl text-center min-w-[100px]">
                    <p className="text-2xl font-black text-indigo-600">{league.tournaments.length}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Torneios</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* COLUNA ESQUERDA: RANKING */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 h-fit relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-24 bg-indigo-50/50 blur-3xl rounded-full pointer-events-none"></div>
                    
                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h2 className="font-black text-slate-900 flex items-center gap-3 text-2xl italic">
                            <Trophy className="text-yellow-500" size={28} fill="currentColor"/> RANKING
                        </h2>
                        <AddPlayerModal leagueId={league.id} />
                    </div>
                    
                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        {league.players.map((player, index) => (
                            <RankingRow 
                                key={player.id} 
                                player={player} 
                                index={index} 
                                leagueId={league.id} 
                            />
                        ))}
                        
                        {league.players.length === 0 && (
                            <div className="text-center py-20 opacity-30">
                                <Users size={64} className="mx-auto mb-4"/>
                                <p className="font-black uppercase tracking-widest text-sm">Nenhum atleta inscrito</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* COLUNA DIREITA: TORNEIOS */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm h-full">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 italic">
                            <Calendar className="text-indigo-500" size={32}/> TORNEIOS
                        </h2>
                        <CreateTournamentModal leagueId={league.id} />
                    </div>

                    <div className="grid gap-4">
                        {league.tournaments.map(t => (
                            <div key={t.id} className="group bg-slate-50 hover:bg-white p-6 rounded-[2.5rem] border border-slate-200 hover:border-indigo-300 transition-all flex justify-between items-center shadow-sm hover:shadow-xl">
                                <div className="flex items-center gap-5">
                                    <div className="bg-white border border-slate-200 text-indigo-600 p-4 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                        <Medal size={28}/>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-xl group-hover:text-indigo-600 transition-colors uppercase italic">{t.name}</h3>
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
                                    <Link href={`/tournament/${t.id}`} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2">
                                        Gerenciar <ArrowRight size={14}/>
                                    </Link>
                                    <form action={deleteTournament.bind(null, t.id, league.id)}>
                                        <button className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
                                            <Trash2 size={20}/>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                        {league.tournaments.length === 0 && (
                            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2.5rem] opacity-40">
                                <LayoutDashboard size={48} className="mx-auto mb-4 text-slate-300"/>
                                <p className="font-black text-slate-400 uppercase tracking-widest">Nenhum torneio criado</p>
                                <p className="text-xs text-slate-400 mt-2 font-bold">Clique no botão acima para começar</p>
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