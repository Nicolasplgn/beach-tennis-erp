import { prisma } from '@/lib/prisma'
import { togglePlayerInTournament, generateTeams, generateBracket } from '@/app/actions'
import TournamentBracket from '@/app/league/[id]/_components/TournamentBracket'
import { GroupStageView } from '@/app/league/[id]/_components/GroupStageView' 
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
      matches: { include: { teamA: true, teamB: true } }
    }
  })

  if (!tournament) return <div>404</div>

  const participantIds = new Set(tournament.participants.map(p => p.id))
  const hasTeams = tournament.teams.length > 0
  const hasMatches = tournament.matches.length > 0

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
                <Link href={`/league/${tournament.leagueId}`} className="p-3 border rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all">
                    <ArrowLeft size={20}/>
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{tournament.name}</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(tournament.date).toLocaleDateString()}</p>
                </div>
            </div>
            
            {tournament.status === 'DRAFT' && tournament.participants.length >= 4 && (
                <form action={generateTeams.bind(null, tournament.id)}>
                    <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all cursor-pointer">
                        <Dices size={20}/> {hasTeams ? 'Refazer Sorteio' : 'Sortear Duplas'}
                    </button>
                </form>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LADO ESQUERDO: CHECK-IN */}
            <div className="lg:col-span-1 bg-white p-6 rounded-4xl border shadow-sm flex flex-col h-fit">
                <div className="mb-6">
                    <h2 className="font-black text-slate-900 uppercase text-sm tracking-widest flex items-center gap-2">
                        <Users size={18} className="text-indigo-500"/> Check-in Atletas
                    </h2>
                </div>
                
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {tournament.league.players.map(player => {
                        const isEnrolled = participantIds.has(player.id)
                        return (
                            <form key={player.id} action={togglePlayerInTournament.bind(null, tournament.id, player.id)}>
                                <button className={`w-full flex justify-between items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${isEnrolled ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'}`}>
                                    <div className="text-left">
                                        <p className="text-xs font-black leading-none">{player.name}</p>
                                        <p className="text-[10px] font-bold opacity-50 mt-1 uppercase">Cat. {player.level}</p>
                                    </div>
                                    {isEnrolled ? <Check size={18} strokeWidth={3}/> : <Plus size={18}/>}
                                </button>
                            </form>
                        )
                    })}
                </div>
            </div>

            {/* LADO DIREITO: CONTEÚDO PRINCIPAL */}
            <div className="lg:col-span-3 space-y-8">
                
                {/* 1. EXIBIÇÃO DAS DUPLAS FORMADAS (O QUE ESTAVA FALTANDO) */}
                {hasTeams && (
                    <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Shield size={16} className="text-indigo-500"/> Duplas Confirmadas
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {tournament.teams.map((team, idx) => (
                                <div key={team.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
                                    <span className="text-[10px] font-black text-slate-300">#{idx + 1}</span>
                                    <p className="text-sm font-black text-slate-700 truncate">{team.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. SELEÇÃO DE FORMATO (Só aparece se houver duplas e nenhum jogo criado) */}
                {hasTeams && !hasMatches && (
                    <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-6 text-center">Como deseja disputar este torneio?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <form action={generateBracket.bind(null, tournament.id, 'KNOCKOUT')}>
                                <button className="w-full bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group flex flex-col items-center gap-4 cursor-pointer">
                                    <PlayCircle size={32} className="text-indigo-600"/>
                                    <div className="text-center">
                                        <span className="block font-black text-slate-900">Mata-Mata (8-4-2)</span>
                                        <span className="text-xs text-slate-400 font-bold uppercase">Eliminação Direta</span>
                                    </div>
                                </button>
                            </form>
                            <form action={generateBracket.bind(null, tournament.id, 'GROUPS')}>
                                <button className="w-full bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center gap-4 cursor-pointer">
                                    <Grid size={32} className="text-emerald-600"/>
                                    <div className="text-center">
                                        <span className="block font-black text-slate-900">Fase de Grupos</span>
                                        <span className="text-xs text-slate-400 font-bold uppercase">Grupos + Classificação</span>
                                    </div>
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* 3. ÁREA DOS JOGOS */}
                <div className="bg-slate-900 rounded-4xl p-8 min-h-[500px] border border-slate-800 shadow-2xl flex flex-col items-center justify-center">
                    {hasMatches ? (
                         <div className="w-full overflow-x-auto custom-scrollbar-dark">
                            {tournament.format === 'GROUPS' ? (
                                <GroupStageView matches={tournament.matches} teams={tournament.teams} isAdmin={true} />
                            ) : (
                                <TournamentBracket matches={tournament.matches} isAdmin={true} />
                            )}
                         </div>
                    ) : (
                        <div className="text-center">
                            <Shield size={64} className="text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-600 font-black uppercase tracking-widest">
                                {!hasTeams ? "Sorteie as duplas primeiro" : "Escolha o formato acima"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}