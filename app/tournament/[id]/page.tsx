import { prisma } from '@/lib/prisma'
import { togglePlayerInTournament, generateTeams, generateBracket, finishTournament, generateFinalStage } from '@/app/actions'
import TournamentBracket from '@/app/league/[id]/_components/TournamentBracket'
import { GroupStageView } from '@/app/league/[id]/_components/GroupStageView' 
import { TournamentPodium } from '@/app/league/[id]/_components/TournamentPodium'
import { FinishButton } from '@/app/components/FinishButton'
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

  const finalMatch = tournament.matches.find(m => m.type === 'KNOCKOUT' && !m.nextMatchId)
  const champions = finalMatch?.winner
  const runnersUp = finalMatch?.winnerId === finalMatch?.teamAId ? finalMatch?.teamB : finalMatch?.teamA

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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${isFinished ? 'bg-indigo-600 text-white border-indigo-600' : isActive ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {isFinished ? 'FINALIZADO' : isActive ? 'EM ANDAMENTO' : 'INSCRIÇÕES'}
                        </span>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(tournament.date).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {isDraft && tournament.participants.length >= 4 && (
                    <form action={generateTeams.bind(null, tournament.id)}>
                        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all cursor-pointer shadow-lg shadow-indigo-200">
                            <Dices size={18}/> {hasTeams ? 'Refazer Sorteio' : 'Sortear Duplas'}
                        </button>
                    </form>
                )}
                {isActive && <FinishButton tournamentId={tournament.id} />}
            </div>
        </div>

        {/* CONTEÚDO */}
        {isFinished ? (
            <TournamentPodium champions={champions} runnersUp={runnersUp} />
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* CHECK-IN */}
                <div className="lg:col-span-1 bg-white p-6 rounded-[2.5rem] border shadow-sm flex flex-col h-fit">
                    <h2 className="font-black text-slate-900 uppercase text-sm tracking-widest flex items-center gap-2 mb-6"><Users size={18} className="text-indigo-500"/> Check-in</h2>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
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

                {/* COLUNA DIREITA: DUPLAS E JOGOS */}
                <div className="lg:col-span-3 space-y-8">
                    
                    {/* --- NOVO: VISUALIZAÇÃO DAS DUPLAS SORTEADAS (ANTES DE INICIAR) --- */}
                    {isDraft && hasTeams && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <h2 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                                <Dices size={20} className="text-indigo-500"/> Duplas Sorteadas
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {tournament.teams.map((team, idx) => (
                                    <div key={team.id} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs border border-indigo-200 shadow-sm">
                                            {idx + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900">{team.players[0].name}</span>
                                            <span className="text-xs font-bold text-slate-900">{team.players[1]?.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SELEÇÃO DE FORMATO */}
                    {isDraft && hasTeams && !hasMatches && (
                        <div className="bg-indigo-600 p-10 rounded-[2.5rem] shadow-xl text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-white/10 blur-[80px] rounded-full pointer-events-none"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black text-white mb-8 uppercase italic tracking-tighter">Pronto para Iniciar?</h2>
                                <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mb-8">Escolha o formato da competição</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                    <form action={generateBracket.bind(null, tournament.id, 'KNOCKOUT')}>
                                        <button className="w-full bg-white p-6 rounded-[2rem] border-4 border-transparent hover:border-indigo-300 transition-all group flex flex-col items-center gap-4 cursor-pointer shadow-lg">
                                            <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><PlayCircle size={32}/></div>
                                            <div>
                                                <span className="block font-black text-indigo-900 text-lg uppercase">Mata-Mata</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eliminatória Simples</span>
                                            </div>
                                        </button>
                                    </form>
                                    <form action={generateBracket.bind(null, tournament.id, 'GROUPS')}>
                                        <button className="w-full bg-emerald-50 p-6 rounded-[2rem] border-4 border-transparent hover:border-emerald-300 transition-all group flex flex-col items-center gap-4 cursor-pointer shadow-lg">
                                            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-700 group-hover:scale-110 transition-transform"><Grid size={32}/></div>
                                            <div>
                                                <span className="block font-black text-emerald-900 text-lg uppercase">Fase de Grupos</span>
                                                <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Todos vs Todos + Semis</span>
                                            </div>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PAINEL DE JOGOS (Só aparece se tiver jogos gerados) */}
                    {hasMatches && (
                        <div className="bg-slate-900 rounded-[3rem] p-4 md:p-10 min-h-[600px] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
                            <div className="absolute top-0 right-0 p-64 bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>
                            
                            <div className="w-full relative z-10 pb-20">
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
                                        {!tournament.matches.some(m => m.type === 'KNOCKOUT') && (
                                            <div className="mt-12 text-center">
                                                <form action={async () => { 'use server'; await generateFinalStage(tournament.id) }}>
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
                        </div>
                    )}

                    {/* Placeholder se não tiver times nem jogos */}
                    {!hasTeams && !hasMatches && (
                        <div className="text-center py-32 opacity-30 border-2 border-dashed border-slate-300 rounded-[3rem]">
                            <Shield size={64} className="text-slate-400 mx-auto mb-4" strokeWidth={1} />
                            <p className="text-slate-500 font-black text-xl uppercase tracking-widest">Aguardando Check-in</p>
                            <p className="text-slate-400 text-sm mt-2 font-medium">Selecione os atletas e realize o sorteio</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  )
}