import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { addPlayer, generateTeams, generateBracket, deleteLeague, updateLeagueStatus } from '@/app/actions'
import TournamentBracket from './_components/TournamentBracket'
import { PlayerRow } from './PlayerRow'
import { Users, Shield, ArrowLeft, Trash2, PlayCircle, Calendar, Dices, Layers, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Prisma } from '@prisma/client'

type LeagueWithDetails = Prisma.LeagueGetPayload<{
  include: {
    players: true,
    teams: { include: { players: true } },
    matches: { include: { teamA: true, teamB: true, winner: true } }
  }
}>

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  
  const league = await prisma.league.findUnique({
    where: { id },
    include: { 
      players: { orderBy: { createdAt: 'desc' } }, 
      teams: { include: { players: true } },
      matches: { include: { teamA: true, teamB: true, winner: true } }
    }
  }) as LeagueWithDetails | null

  if (!league) return <div className="p-20 text-center font-bold text-slate-400">Liga Inexistente</div>

  const isAdmin = session?.user?.id === league.adminId
  const isDraft = league.status === 'DRAFT'
  
  const hasMinPlayers = league.players.length >= 4
  const hasTeams = league.teams.length >= 2
  const hasMatches = league.matches.length > 0
  const currentStep = hasMatches ? 4 : hasTeams ? 3 : hasMinPlayers ? 2 : 1

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* HEADER & STEPS */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <Link href="/" className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-xs font-bold uppercase mb-4 transition-colors">
                        <ArrowLeft size={14}/> Voltar ao Dashboard
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{league.name}</h1>
                    <div className="flex items-center gap-4 mt-3 text-sm font-bold text-slate-500">
                        {league.startDate && (
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg">
                                <Calendar size={14}/> 
                                {league.startDate.toLocaleDateString()} 
                                {league.endDate ? ` - ${league.endDate.toLocaleDateString()}` : ''}
                            </span>
                        )}
                        <span className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider border ${league.status === 'FINISHED' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                            {league.status === 'DRAFT' ? 'Fase de Configuração' : 'Torneio em Andamento'}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl">
                    {[
                        { step: 1, label: 'Inscrição', icon: Users },
                        { step: 2, label: 'Sorteio', icon: Dices },
                        { step: 3, label: 'Chaveamento', icon: Layers },
                        { step: 4, label: 'Jogos', icon: PlayCircle }
                    ].map((s) => (
                        <div key={s.step} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${currentStep >= s.step ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 opacity-50'}`}>
                            <s.icon size={14} />
                            <span className="hidden md:inline">{s.label}</span>
                            {currentStep > s.step && <CheckCircle2 size={12} className="text-emerald-500"/>}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* PARTE SUPERIOR: GESTÃO (ATLETAS E DUPLAS) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            
            {/* ATLETAS */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm flex flex-col h-[600px]">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="font-black text-slate-900 uppercase text-sm tracking-widest flex items-center gap-2">
                        <Users size={16} className="text-indigo-500"/> Gestão de Atletas
                    </h2>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">{league.players.length}</span>
                </div>

                {isDraft && isAdmin && (
                    <form action={addPlayer.bind(null, league.id)} className="mb-6 bg-slate-50 p-4 rounded-3xl space-y-3 border border-slate-100 shrink-0">
                        <input name="name" placeholder="Nome Completo" className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" required />
                        <div className="flex gap-2">
                            <input name="nickname" placeholder="Apelido" className="w-1/2 bg-white border-none rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" />
                            <select name="level" className="w-1/2 bg-white border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="C">Nível C</option>
                                <option value="B">Nível B</option>
                                <option value="A">Nível A</option>
                                <option value="PRO">PRO</option>
                            </select>
                        </div>
                        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                            Adicionar
                        </button>
                    </form>
                )}

                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {league.players.map(player => (
                        <PlayerRow key={player.id} player={player} leagueId={league.id} isAdmin={isAdmin && isDraft} />
                    ))}
                </div>
            </div>

            {/* DUPLAS */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="font-black text-slate-900 uppercase text-sm tracking-widest flex items-center gap-2">
                        <Dices size={16} className="text-indigo-500"/> Duplas Formadas
                    </h2>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">{league.teams.length}</span>
                </div>

                {isDraft && isAdmin && (
                    <div className="mb-6 shrink-0">
                        <form action={generateTeams.bind(null, league.id)}>
                            <button 
                                disabled={!hasMinPlayers}
                                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Dices size={18} />
                                {league.teams.length > 0 ? 'Refazer Sorteio' : 'Sortear Duplas'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {league.teams.map((team, idx) => (
                        <div key={team.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-300">#{idx + 1}</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900">{team.players[0].name}</span>
                                    <span className="text-xs font-bold text-slate-900">{team.players[1]?.name || '?'}</span>
                                </div>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600">{team.players[0].name.charAt(0)}</div>
                                <div className="h-8 w-8 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-violet-600">{team.players[1]?.name.charAt(0)}</div>
                            </div>
                        </div>
                    ))}
                    {!hasTeams && (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl">
                            <Dices size={24} className="text-slate-200 mx-auto mb-2"/>
                            <p className="text-xs font-bold text-slate-400">Aguardando sorteio</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* PARTE INFERIOR: CHAVEAMENTO (OCUPA TUDO) */}
        <div className="w-full">
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl shadow-slate-200 min-h-[800px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
                    <h2 className="font-black text-white uppercase text-xl tracking-widest flex items-center gap-3">
                        <Shield size={24} className="text-emerald-400"/> Chaveamento Oficial
                    </h2>
                    {isDraft && isAdmin && hasTeams && (
                        <form action={generateBracket.bind(null, league.id)}>
                            <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-900/20 flex items-center gap-2 cursor-pointer hover:scale-105 transform">
                                <PlayCircle size={16} fill="currentColor"/> Gerar Chaves
                            </button>
                        </form>
                    )}
                </div>

                {league.matches.length > 0 ? (
                    <div className="w-full h-full overflow-x-auto pb-4 custom-scrollbar-dark flex justify-center items-start">
                         <TournamentBracket matches={league.matches} isAdmin={isAdmin} />
                    </div>
                ) : (
                    <div className="h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/50">
                        <Layers size={64} className="text-slate-700 mb-6"/>
                        <p className="text-xl font-bold text-slate-500">Chaveamento não gerado</p>
                        <p className="text-sm text-slate-600 mt-2">Realize o sorteio das duplas para liberar as chaves</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}