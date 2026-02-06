import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { addPlayer, deletePlayer, generateTeams, generateBracket, deleteLeague, updateLeagueStatus } from '@/app/actions'
import TournamentBracket from './_components/TournamentBracket'
import { Shield, ArrowLeft, Trash2, PlayCircle, Star, Calendar } from 'lucide-react'
import Link from 'next/link'

/** Tipo da liga com relações para esta página (contorna inferência do Prisma) */
interface LeagueForPage {
  id: string
  name: string
  description: string | null
  startDate: Date | null
  status: string
  adminId: string
  players: { id: string; name: string; nickname: string | null; level: string | null; wins: number; losses: number }[]
  teams: { id: string; name: string; leagueId: string; players: { id: string; name: string }[] }[]
  matches: { id: string; round: number; position: number; teamAId: string | null; teamBId: string | null; winnerId: string | null; scoreA: number | null; scoreB: number | null; status: string; teamA: { name: string } | null; teamB: { name: string } | null; winner: { name: string } | null }[]
}

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const raw = await prisma.league.findUnique({
    where: { id },
    include: {
      players: true,
      teams: { include: { players: true } },
      matches: { include: { teamA: true, teamB: true, winner: true } }
    }
  })
  const league = raw as LeagueForPage | null

  if (!league) return <div className="p-20 text-center font-bold text-slate-400 underline">Liga Inexistente</div>

  const isAdmin = session?.user?.id === league.adminId
  const isDraft = league.status === 'DRAFT'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* HEADER PROFISSIONAL (REQUISITO 2.2) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <Link href="/" className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-xs font-bold uppercase mb-4 transition-colors">
            <ArrowLeft size={14}/> Dashboard
          </Link>
          <h1 className="text-4xl font-black text-slate-900">{league.name}</h1>
          <p className="text-slate-500 mt-2 font-medium">{league.description || 'Sem descrição definida.'}</p>
          <div className="flex items-center gap-4 mt-4 text-sm font-bold text-slate-400">
             <span className="flex items-center gap-1"><Calendar size={14}/> {league.startDate?.toLocaleDateString() || 'Data não definida'}</span>
             <span className={`px-3 py-1 rounded-full text-[10px] border ${league.status === 'FINISHED' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {league.status}
             </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            {isDraft ? (
              <form action={generateBracket.bind(null, league.id)}>
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:scale-105 transition-all flex items-center gap-2">
                  <PlayCircle size={20}/> Iniciar Campeonato
                </button>
              </form>
            ) : (
              <form action={updateLeagueStatus.bind(null, league.id, 'FINISHED')}>
                <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-red-600 transition-all">
                  Finalizar Liga
                </button>
              </form>
            )}
            <form action={deleteLeague.bind(null, league.id)}>
              <button className="p-3 text-slate-300 hover:text-red-500 transition-colors border border-slate-200 rounded-2xl">
                <Trash2 size={20}/>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* CHAVEAMENTO (REQUISITO 5 e 6) */}
      {league.matches.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 px-2 flex items-center gap-2">
            <Shield className="text-indigo-600" /> Chaveamento Mata-Mata
          </h2>
          <div className="bg-slate-100 rounded-[3rem] p-4 border-4 border-white shadow-inner">
            <TournamentBracket matches={league.matches} isAdmin={isAdmin} />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-12">
        {/* RANKING (REQUISITO 8) */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
                    <Star className="text-amber-500" fill="currentColor"/> Ranking de Atletas
                </h2>
                <div className="space-y-4">
                    {[...league.players].sort((a, b) => b.wins - a.wins).map((player, index) => (
                        <div key={player.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-4">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${index < 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {index + 1}
                                </span>
                                <div>
                                    <div className="font-bold text-slate-900">{player.name}</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">{player.nickname || 'Sem apelido'} • {player.level}</div>
                                </div>
                            </div>
                            <div className="flex gap-8 text-center">
                                <div>
                                    <div className="text-[10px] font-black text-slate-300 uppercase">Vitórias</div>
                                    <div className="font-black text-emerald-600">{player.wins}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-300 uppercase">Eficiência</div>
                                    <div className="font-black text-slate-900">
                                        {((player.wins / (player.wins + player.losses || 1)) * 100).toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* GESTÃO LATERAL (REQUISITO 3 e 4) */}
        <div className="space-y-8">
            {isDraft && isAdmin && (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <h3 className="font-black text-slate-900 mb-6 uppercase text-sm tracking-widest">Inscrição de Atletas</h3>
                    <form action={addPlayer.bind(null, league.id)} className="space-y-3">
                        <input name="name" placeholder="Nome Completo" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
                        <input name="nickname" placeholder="Apelido" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        <select name="level" className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="iniciante">Iniciante</option>
                            <option value="intermediário">Intermediário</option>
                            <option value="avançado">Avançado</option>
                        </select>
                        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                            Adicionar Atleta
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Duplas</h3>
                    {isDraft && isAdmin && (
                        <form action={generateTeams.bind(null, league.id)}>
                            <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase">Refazer Sorteio</button>
                        </form>
                    )}
                </div>
                <div className="space-y-3">
                    {league.teams.map(team => (
                        <div key={team.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="text-xs font-black text-slate-900 mb-2 truncate">{team.name}</div>
                            <div className="flex -space-x-2">
                                {team.players.map(p => (
                                    <div key={p.id} className="h-8 w-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase" title={p.name}>
                                        {p.name.charAt(0)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {league.teams.length === 0 && <div className="text-center py-8 text-slate-300 text-sm font-bold">Aguardando sorteio...</div>}
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}