import { prisma } from '@/lib/prisma'
import { togglePlayerInTournament, generateTeams, generateBracket, finishTournament, generateFinalStage } from '@/app/actions'
import TournamentBracket from '@/app/league/[id]/_components/TournamentBracket'
import { GroupStageView } from '@/app/league/[id]/_components/GroupStageView' 
import { TournamentPodium } from '@/app/league/[id]/_components/TournamentPodium'
import { Check, Plus, Users, Dices, Shield, ArrowLeft, Trophy, PlayCircle, Grid, Lock, PartyPopper } from 'lucide-react'
import Link from 'next/link'

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { 
      league: { include: { players: { orderBy: { name: 'asc' } } } }, 
      participants: true,
      teams: { include: { players: true } },
      matches: { include: { teamA: { include: { players: true } }, teamB: { include: { players: true } }, winner: { include: { players: true } } } }
    }
  })

  if (!tournament) return <div>404</div>

  const isFinished = tournament.status === 'FINISHED'
  const isActive = tournament.status === 'ACTIVE'
  const isDraft = tournament.status === 'DRAFT'
  
  const participantIds = new Set(tournament.participants.map(p => p.id))
  const hasTeams = tournament.teams.length > 0
  const hasMatches = tournament.matches.length > 0
  
  // Lógica de Pódio SIMPLIFICADA (Apenas Campeão e Vice)
  const finalMatch = tournament.matches.find(m => m.type === 'KNOCKOUT' && !m.nextMatchId)
  const champions = finalMatch?.winner
  const runnersUp = finalMatch?.winnerId === finalMatch?.teamAId ? finalMatch?.teamB : finalMatch?.teamA

  // REMOVI O CÁLCULO DE ESTATÍSTICAS (STATS) DAQUI

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
                <Link href={`/league/${tournament.leagueId}`} className="p-3 border rounded-2xl text-slate-400 hover:text-indigo-600 transition-all bg-slate-50 hover:bg-white"><ArrowLeft size={20}/></Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">{tournament.name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${isFinished ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {isFinished ? 'FINALIZADO' : isActive ? 'EM ANDAMENTO' : 'INSCRIÇÕES'}
                        </span>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(tournament.date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {/* BOTÃO SORTEIO */}
                {isDraft && tournament.participants.length >= 4 && (
                    <form action={generateTeams.bind(null, tournament.id)}>
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-200">
                            <Dices size={18}/> {hasTeams ? 'Refazer' : 'Sortear'}
                        </button>
                    </form>
                )}

                {/* BOTÃO ENCERRAR MANUAL */}
                {isActive && (
                    <form action={finishTournament.bind(null, tournament.id)}>
                        <button 
                            className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all cursor-pointer shadow-lg shadow-red-200"
                            onClick={(e) => { if(!confirm("Tem certeza que deseja encerrar o torneio?")) e.preventDefault() }}
                        >
                            <Lock size={18}/> ENCERRAR TORNEIO
                        </button>
                    </form>
                )}
            </div>
        </div>

        {/* --- BANNER FLUTUANTE --- */}
        {!isFinished && champions && (
            <div className="fixed bottom-6 left-0 right-0 px-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="max-w-3xl mx-auto bg-slate-900 text-white p-4 md:p-6 rounded-[2rem] shadow-2xl shadow-indigo-900/40 border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-400 text-yellow-900 p-3 rounded-2xl shadow-lg shadow-yellow-400/20">
                            <Trophy size={32} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Campeão Definido</p>
                            <h3 className="text-xl font-black text-white">{champions?.name}</h3>
                        </div>
                    </div>
                    
                    <form action={finishTournament.bind(null, tournament.id)}>
                        <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95">
                            <PartyPopper size={20}/> Oficializar Vitória
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* --- PÓDIO (SEM PONTUADORES) --- */}
        {isFinished ? (
            <TournamentPodium champions={champions} runnersUp={runnersUp} />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* CHECK-IN */}
                <div className="lg:col-span-1 bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col h-fit">
                    <h2 className="font-black text-slate-900 uppercase text-sm tracking-widest flex items-center gap-2 mb-6"><Users size={18} className="text-indigo-500"/> Check-in</h2>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {tournament.league.players.map(player => (
                            <form key={player.id} action={togglePlayerInTournament.bind(null, tournament.id, player.id)}>
                                <button 
                                    disabled={!isDraft}
                                    className={`w-full flex justify-between items-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${participantIds.has(player.id) ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'} disabled:cursor-not-allowed disabled:opacity-70`}
                                >
                                    <div className="text-left"><p className="text-xs font-black">{player.name}</p><p className="text-[10px] font-bold opacity-50 uppercase">Cat. {player.level}</p></div>
                                    {participantIds.has(player.id) ? <Check size={16} strokeWidth={3}/> : <Plus size={16}/>}
                                </button>
                            </form>
                        ))}
                    </div>
                </div>

                {/* ÁREA DE JOGOS */}
                <div className="lg:col-span-3 space-y-8">
                    
                    {/* SELEÇÃO FORMATO */}
                    {isDraft && tournament.teams.length > 0 && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center animate-in zoom-in duration-300">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex justify-center items-center gap-2">
                                <Shield className="text-indigo-600" size={24}/> Escolha o Formato
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                <form action={generateBracket.bind(null, tournament.id, 'KNOCKOUT')}>
                                    <button className="w-full bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group flex flex-col items-center gap-3 cursor-pointer">
                                        <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600 group-hover:scale-110 transition-transform"><PlayCircle size={28}/></div>
                                        <div><span className="block font-black text-slate-900 text-lg">Mata-Mata</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oitavas • Quartas • Final</span></div>
                                    </button>
                                </form>
                                <form action={generateBracket.bind(null, tournament.id, 'GROUPS')}>
                                    <button className="w-full bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center gap-3 cursor-pointer">
                                        <div className="bg-white p-3 rounded-full shadow-sm text-emerald-600 group-hover:scale-110 transition-transform"><Grid size={28}/></div>
                                        <div><span className="block font-black text-slate-900 text-lg">Fase de Grupos</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Todos vs Todos + Semis</span></div>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* BRACKET */}
                    <div className="bg-slate-900 rounded-[3rem] p-4 md:p-10 min-h-[600px] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
                        <div className="absolute top-0 right-0 p-64 bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>
                        
                        {hasMatches ? (
                            <div className="w-full relative z-10">
                                {tournament.format === 'GROUPS' ? (
                                    <>
                                        <GroupStageView matches={tournament.matches} teams={tournament.teams} isAdmin={true} tournamentId={tournament.id} />
                                        {tournament.matches.some(m => m.type === 'KNOCKOUT') && (
                                            <div className="mt-20 border-t border-slate-800 pt-12 w-full">
                                                <div className="flex items-center justify-center gap-3 mb-10">
                                                    <Trophy className="text-yellow-500" size={24}/>
                                                    <h2 className="text-center text-white font-black text-2xl uppercase tracking-widest italic">Fase Final</h2>
                                                </div>
                                                <div className="overflow-x-auto pb-4 custom-scrollbar-dark flex justify-center">
                                                    <TournamentBracket matches={tournament.matches} isAdmin={true} />
                                                </div>
                                            </div>
                                        )}
                                        {/* Botão de gerar fase final se ainda não existir */}
                                        {!tournament.matches.some(m => m.type === 'KNOCKOUT') && (
                                            <div className="mt-12 text-center">
                                                <form action={async () => { 
                                                    'use server'
                                                    await generateFinalStage(tournament.id) 
                                                }}>
                                                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center gap-2 mx-auto cursor-pointer">
                                                        <Trophy size={18}/> Iniciar Fase Final
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="overflow-x-auto pb-4 custom-scrollbar-dark flex justify-center">
                                        <TournamentBracket matches={tournament.matches} isAdmin={true} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center opacity-20 relative z-10">
                                <Shield size={80} className="text-white mx-auto mb-6" strokeWidth={1} />
                                <p className="text-white font-black text-2xl uppercase tracking-widest">Aguardando Início</p>
                                <p className="text-white/50 text-sm mt-2 font-medium">Realize o sorteio para gerar os jogos</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}