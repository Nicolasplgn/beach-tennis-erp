import { prisma } from '@/lib/prisma'
// CORREÇÃO 1: Importando do caminho absoluto correto
import { createTournament, deleteTournament } from '@/app/actions'
import { LeagueSidebar } from './_components/LeagueSidebar'
import { Calendar, Plus, ArrowRight, Trash2, ArrowLeft, Medal } from 'lucide-react'
import Link from 'next/link'

export default async function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const league = await prisma.league.findUnique({
    where: { id },
    include: { 
      players: true,
      tournaments: { orderBy: { date: 'desc' } }
    }
  })

  if (!league) return <div>Liga não encontrada</div>

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-4">
             <Link href="/" className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors text-slate-400 hover:text-indigo-600">
                <ArrowLeft size={20}/>
             </Link>
             <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{league.name}</h1>
                <p className="text-slate-500 font-medium">Gestão da Liga</p>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* COLUNA ESQUERDA: SIDEBAR */}
            <div className="lg:col-span-1">
                <LeagueSidebar players={league.players as any} leagueId={league.id} />
            </div>

            {/* COLUNA DIREITA: TORNEIOS */}
            <div className="lg:col-span-2 space-y-6">
                {/* CORREÇÃO 2: rounded-4xl */}
                <div className="bg-white p-8 rounded-4xl border border-slate-200 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <Calendar className="text-indigo-500" size={24}/> Etapas / Torneios
                    </h2>

                    <form action={createTournament.bind(null, league.id)} className="flex flex-col md:flex-row gap-3 mb-8 bg-slate-50 p-2 rounded-3xl border border-slate-100 pl-4">
                        <input name="name" placeholder="Nome da Etapa (ex: Verão)" className="flex-1 bg-transparent py-3 text-sm font-bold outline-none placeholder:text-slate-400" required />
                        <div className="flex gap-2">
                             <input name="date" type="date" className="bg-white px-4 py-3 rounded-xl text-xs font-bold outline-none text-slate-500 border border-slate-200 shadow-sm" required />
                             <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200">
                                <Plus size={16}/> Criar
                            </button>
                        </div>
                    </form>

                    <div className="grid gap-4">
                        {league.tournaments.map(t => (
                            <div key={t.id} className="group bg-white hover:bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-indigo-200 transition-all flex justify-between items-center shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Medal size={24}/>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-lg">{t.name}</h3>
                                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1">
                                            <Calendar size={12}/> {new Date(t.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href={`/tournament/${t.id}`} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-600 transition-colors flex items-center gap-2">
                                        Gerenciar <ArrowRight size={14}/>
                                    </Link>
                                    <form action={deleteTournament.bind(null, t.id, league.id)}>
                                        <button className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                                    </form>
                                </div>
                            </div>
                        ))}
                         {league.tournaments.length === 0 && (
                            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                                <Calendar size={48} className="mx-auto mb-4 opacity-20"/>
                                <p className="font-bold">Nenhuma etapa criada.</p>
                                <p className="text-xs mt-1">Crie o primeiro torneio para começar.</p>
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