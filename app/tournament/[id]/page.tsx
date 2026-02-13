import { prisma } from '@/lib/prisma'
import { togglePlayerInTournament, generateTeams, generateBracket, finishTournament, generateFinalStage } from '@/app/actions'
import TournamentBracket from '@/app/league/[id]/_components/TournamentBracket'
import { GroupStageView } from '@/app/league/[id]/_components/GroupStageView' 
import { TournamentPodium } from '@/app/league/[id]/_components/TournamentPodium'
import { FinishButton } from '@/app/components/FinishButton'
import { Check, Plus, Users, Dices, Shield, ArrowLeft, Trophy, PlayCircle, Grid, Lock, PartyPopper, Users2 } from 'lucide-react'
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

  const stats: Record<string, any> = {}
  tournament.matches.forEach(m => {
    if (m.status === 'FINISHED' && m.winnerId) {
        const winPl = m.winnerId === m.teamAId ? m.teamA?.players : m.teamB?.players
        const losPl = m.winnerId === m.teamAId ? m.teamB?.players : m.teamA?.players
        winPl?.forEach(p => { if(!stats[p.id]) stats[p.id] = {...p, points: 0}; stats[p.id].points += 100 })
        losPl?.forEach(p => { if(!stats[p.id]) stats[p.id] = {...p, points: 0}; stats[p.id].points += 10 })
    }
  })
  const topScorers = Object.values(stats).sort((a: any, b: any) => b.points - a.points)

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      
      {/* HEADER */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1920px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href={`/league/${tournament.leagueId}`} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all"><ArrowLeft size={20}/></Link>
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">{tournament.name}</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(tournament.date).toLocaleDateString()}</p>
                </div>
            </div>
            {isActive && <FinishButton tournamentId={tournament.id} />}
        </div>
      </nav>

      <main className="max-w-[1920px] mx-auto px-6 py-8 space-y-12">
        
        {isFinished ? (
            <TournamentPodium champions={champions} runnersUp={runnersUp} topScorers={topScorers} />
        ) : (
            <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* CHECK-IN */}
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm h-[600px] flex flex-col">
                        <h2 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2 mb-6">
                            <Users size={16} className="text-indigo-500"/> Check-in Atletas
                        </h2>
                        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {tournament.league.players.map(player => (
                                <form key={player.id} action={togglePlayerInTournament.bind(null, tournament.id, player.id)}>
                                    <button disabled={!isDraft} className={`w-full flex justify-between items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${participantIds.has(player.id) ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-50 text-slate-400'}`}>
                                        <span className="text-xs font-black">{player.name}</span>
                                        {participantIds.has(player.id) ? <Check size={14} strokeWidth={3}/> : <Plus size={14}/>}
                                    </button>
                                </form>
                            ))}
                        </div>
                    </div>

                    {/* COLUNA CENTRAL E DIREITA */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* 1. CARD DE SORTEIO */}
                        {isDraft && (
                            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden flex flex-col justify-center min-h-[200px]">
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div>
                                        <h2 className="text-2xl font-black italic uppercase mb-1">Painel de Controle</h2>
                                        <p className="text-indigo-100 text-sm">Passo 1: Realize o sorteio das duplas com os atletas confirmados.</p>
                                    </div>
                                    <form action={generateTeams.bind(null, tournament.id)}>
                                        <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all cursor-pointer shadow-lg flex items-center gap-2">
                                            <Dices size={18}/> {hasTeams ? 'Refazer Sorteio' : 'Sortear Duplas'}
                                        </button>
                                    </form>
                                </div>
                                <Dices size={150} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
                            </div>
                        )}

                        {/* 2. LISTA DE DUPLAS SORTEADAS (NOVO) */}
                        {isDraft && hasTeams && (
                             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                                <h2 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2 mb-6">
                                    <Users2 size={16} className="text-emerald-500"/> Duplas Confirmadas ({tournament.teams.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {tournament.teams.map((team, idx) => (
                                        <div key={team.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                {idx + 1}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-800">{team.players[0].name}</span>
                                                <span className="text-xs font-bold text-slate-800">{team.players[1]?.name || '?'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        )}

                        {/* 3. SELEÇÃO DE FORMATO */}
                        {isDraft && hasTeams && !hasMatches && (
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <h2 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2 mb-6">
                                    <Shield size={16} className="text-indigo-500"/> Passo 2: Escolha o Formato
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <form action={generateBracket.bind(null, tournament.id, 'KNOCKOUT')}>
                                        <button className="w-full bg-slate-50 p-6 rounded-[2rem] border-2 border-transparent hover:border-indigo-500 hover:bg-indigo-50 transition-all group flex items-center gap-4 cursor-pointer">
                                            <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform"><PlayCircle size={24}/></div>
                                            <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Mata-Mata</span>
                                        </button>
                                    </form>
                                    <form action={generateBracket.bind(null, tournament.id, 'GROUPS')}>
                                        <button className="w-full bg-slate-50 p-6 rounded-[2rem] border-2 border-transparent hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex items-center gap-4 cursor-pointer">
                                            <div className="bg-white p-3 rounded-2xl shadow-sm text-emerald-600 group-hover:scale-110 transition-transform"><Grid size={24}/></div>
                                            <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Fase de Grupos</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ÁREA INFERIOR: CAMPO DE BATALHA --- */}
                <div className="w-full mt-8">
                    <div className="bg-slate-900 rounded-[3.5rem] border border-slate-800 shadow-2xl shadow-indigo-900/20 relative overflow-hidden min-h-[800px] flex flex-col">
                        
                        <div className="bg-slate-950/50 px-10 py-8 border-b border-slate-800 flex justify-between items-center relative z-20">
                            <div className="flex items-center gap-4">
                                <Shield className="text-emerald-500" size={28} fill="currentColor" fillOpacity={0.2}/>
                                <div>
                                    <h2 className="text-white font-black uppercase tracking-widest italic text-2xl">Arena de Jogos</h2>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                                        {tournament.format === 'GROUPS' ? 'Fase de Grupos' : 'Mata-Mata'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 p-96 bg-indigo-600/10 blur-[200px] rounded-full pointer-events-none"></div>

                        <div className="flex-1 p-8 md:p-12 overflow-x-auto relative z-10 w-full">
                            {hasMatches ? (
                                <>
                                    {tournament.format === 'GROUPS' ? (
                                        <div className="space-y-24">
                                            <GroupStageView matches={tournament.matches} teams={tournament.teams} isAdmin={true} tournamentId={tournament.id} />
                                            {tournament.matches.some(m => m.type === 'KNOCKOUT') && (
                                                <div className="pt-20 border-t border-slate-800">
                                                    <h2 className="text-center text-white font-black text-3xl mb-16 uppercase tracking-tighter italic">Fase Eliminatória</h2>
                                                    <TournamentBracket matches={tournament.matches} isAdmin={true} />
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
                                        </div>
                                    ) : (
                                        <TournamentBracket matches={tournament.matches} isAdmin={true} />
                                    )}
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-40 opacity-20">
                                    <Trophy size={100} className="text-white mb-6" strokeWidth={0.5}/>
                                    <p className="text-white font-black text-3xl uppercase tracking-[0.2em]">Aguardando Jogos</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </>
        )}
      </main>
    </div>
  )
}