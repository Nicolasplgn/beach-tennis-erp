import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { deleteLeague, logoutAction } from './actions'
import { CreateLeagueForm } from '@/components/CreateLeagueForm'
import Link from 'next/link'
import { Trophy, Users, Trash2, LogOut, LayoutDashboard, ChevronRight, CalendarRange } from 'lucide-react'

export default async function Dashboard() {
  const session = await auth()
  const leagues = await prisma.league.findMany({
    where: { adminId: session?.user?.id },
    include: { _count: { select: { players: true, teams: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform">
            <Trophy size={22} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            BEACH<span className="text-indigo-600">PRO</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">
            {session?.user?.email}
          </span>
          <form action={logoutAction}>
            <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <LogOut size={20}/>
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-16">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Meus Torneios</h1>
            <p className="text-slate-500 text-lg font-medium">Gerencie suas ligas com a precisão de um profissional.</p>
          </div>
          
          <div className="w-full xl:w-auto bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100">
             <CreateLeagueForm />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leagues.map((league) => (
            <div key={league.id} className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500">
              <div className="flex justify-between items-start mb-8">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  league.status === 'DRAFT' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                }`}>
                  {league.status === 'DRAFT' ? 'Configuração' : 'Em Curso'}
                </div>
                
                <form action={deleteLeague.bind(null, league.id)}>
                   <button className="text-slate-200 hover:text-red-400 transition-colors p-2">
                     <Trash2 size={18} />
                   </button>
                </form>
              </div>

              <Link href={`/league/${league.id}`} className="block">
                <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors truncate">
                    {league.name}
                </h3>
                {league.startDate && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6">
                        <CalendarRange size={14} />
                        {league.startDate.toLocaleDateString()} 
                        {league.endDate ? ` - ${league.endDate.toLocaleDateString()}` : ''}
                    </div>
                )}
                
                <div className="flex gap-8 mb-8 border-t border-slate-50 pt-6">
                  <div>
                    <div className="text-[10px] text-slate-300 font-black uppercase mb-1">Atletas</div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xl">
                        <Users size={18} className="text-indigo-400"/> {league._count.players}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-300 font-black uppercase mb-1">Duplas</div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xl">
                        <LayoutDashboard size={18} className="text-indigo-400"/> {league._count.teams}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Gerenciar Painel <ChevronRight size={14}/>
                  </span>
                </div>
              </Link>
            </div>
          ))}

          {leagues.length === 0 && (
            <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-50">
              <Trophy size={48} className="text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900">Nenhum campeonato encontrado</h3>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}