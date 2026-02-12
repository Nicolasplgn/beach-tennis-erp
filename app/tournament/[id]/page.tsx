import { prisma } from '@/lib/prisma'
import { togglePlayerInTournament, generateTeams, generateBracket, generateFinalStage, finishTournament } from '@/app/actions'
import TournamentBracket from '@/app/league/[id]/_components/TournamentBracket'
import { GroupStageView } from '@/app/league/[id]/_components/GroupStageView' 
import { TournamentPodium } from '@/app/league/[id]/_components/TournamentPodium'
import { FinishButton } from '@/app/components/FinishButton'
import { Check, Plus, Users, Dices, Shield, ArrowLeft, Trophy, PlayCircle, Grid } from 'lucide-react'
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

  if (!tournament) return <div className="p-20 text-center font-bold">404</div>

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
    <div className="min-h-screen bg-[#F1F5F9] pb-20">
      
      {/* HEADER ESTRUTURADO */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
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

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        
        {/* FASE 1: PREPARAÇÃO (SÓ APARECE SE NÃO TIVER JOGOS OU SE FOR DRAFT) */}
        {!isFinished && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CHECK-IN */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm h-[400px] flex flex-col">
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

                {/* CONTROLES DE SORTEIO */}
                <div className="lg:col-span-2 space-y-6">
                    {isDraft && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                                <Dices className="text-indigo-600" /> Sorteio de Duplas
                            </h2>
                            <p className="text-slate-500 text-sm mb-6">Selecione os atletas ao lado e realize o sorteio para definir os confrontos.</p>
                            <form action={generateTeams.bind(null, tournament.id)}>
                                <button className="btn-primary w-full sm:w-auto py-4 px-10">
                                    <Dices size={18}/> {hasTeams ? 'Refazer Sorteio' : 'Iniciar Sorteio'}
                                </button>
                            </form>
                        </div>
                    )}

                    {isDraft && hasTeams && !hasMatches && (
                        <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 animate-in fade-in">
                            <h2 className="text-lg font-black text-indigo-900 mb-6 uppercase tracking-tight">Escolha o Formato do Torneio</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <form action={generateBracket.bind(null, tournament.id, 'KNOCKOUT')}>
                                    <button className="w-full bg-white p-6 rounded-3xl border-2 border-transparent hover:border-indigo-500 shadow-sm transition-all group flex items-center gap-4 cursor-pointer">
                                        <PlayCircle size={28} className="text-indigo-600"/>
                                        <span className="font-black text-slate-900 uppercase text-xs">Mata-Mata</span>
                                    </button>
                                </form>
                                <form action={generateBracket.bind(null, tournament.id, 'GROUPS')}>
                                    <button className="w-full bg-white p-6 rounded-3xl border-2 border-transparent hover:border-emerald-500 shadow-sm transition-all group flex items-center gap-4 cursor-pointer">
                                        <Grid size={28} className="text-emerald-600"/>
                                        <span className="font-black text-slate-900 uppercase text-xs">Fase de Grupos</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* FASE 2: ARENA DE JOGOS (O BLOCO ESTABILIZADO) */}
        <div className="relative">
            {isFinished ? (
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl">
                    <TournamentPodium champions={champions} runnersUp={runnersUp} />
                </div>
            ) : hasMatches ? (
                <div className="bg-slate-900 rounded-[3.5rem] border border-slate-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Header da Arena */}
                    <div className="bg-slate-950/50 px-10 py-6 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Shield className="text-emerald-500" size={20}/>
                            <h2 className="text-white font-black uppercase tracking-widest italic">Jogos Eliminatórios</h2>
                        </div>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Beach Pro Engine v4.0</span>
                    </div>

                    <div className="p-6 md:p-12 overflow-x-auto custom-scrollbar-dark">
                        {tournament.format === 'GROUPS' ? (
                            <div className="space-y-20">
                                <GroupStageView matches={tournament.matches} teams={tournament.teams} isAdmin={true} tournamentId={tournament.id} />
                                {tournament.matches.some(m => m.type === 'KNOCKOUT') && (
                                    <div className="pt-20 border-t border-slate-800">
                                        <h2 className="text-center text-white font-black text-3xl mb-16 uppercase italic">Fase Eliminatória</h2>
                                        <TournamentBracket matches={tournament.matches} isAdmin={true} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <TournamentBracket matches={tournament.matches} isAdmin={true} />
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-20 rounded-[3.5rem] border-2 border-dashed border-slate-200 text-center opacity-40">
                    <Trophy size={64} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-black text-slate-400 uppercase tracking-widest">Os confrontos aparecerão aqui</p>
                </div>
            )}
        </div>

      </main>
    </div>
  )
}