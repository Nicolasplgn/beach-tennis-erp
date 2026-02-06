import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createLeague, deleteLeague, logoutAction } from './actions'
import Link from 'next/link'
import { Trophy, Plus, Users, Trash2, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react'

export default async function Dashboard() {
  const session = await auth()
  const leagues = await prisma.league.findMany({
    where: { adminId: session?.user?.id },
    include: { _count: { select: { players: true, teams: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar / Topbar Hybrid */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Trophy size={20} />
          </div>
          <span className="text-xl font-bold text-slate-900">BeachTennis<span className="text-indigo-600">ERP</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 hidden md:block">{session?.user?.email}</span>
          <form action={logoutAction}>
            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
          </form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Meus Torneios</h1>
            <p className="text-slate-500 mt-2 text-lg">Gerencie e acompanhe seus campeonatos em tempo real.</p>
          </div>
          
          <form action={createLeague} className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 w-full md:w-auto">
            <input name="name" placeholder="Nome do torneio..." className="bg-transparent px-4 py-2 outline-none text-sm w-full md:w-64" required />
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center gap-2 whitespace-nowrap">
              <Plus size={18}/> Novo Torneio
            </button>
          </form>
        </div>

        {/* Grid de Ligas Inovadora */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <div key={league.id} className="group relative bg-white rounded-[2rem] border border-slate-200 p-6 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  league.status === 'DRAFT' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {league.status === 'DRAFT' ? 'Configuração' : 'Em Andamento'}
                </div>
                
                <form action={deleteLeague.bind(null, league.id)}>
                   <button className="text-slate-300 hover:text-red-500 transition-colors p-2">
                     <Trash2 size={18} />
                   </button>
                </form>
              </div>

              <Link href={`/league/${league.id}`}>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-4">{league.name}</h3>
                
                <div className="flex gap-6 mb-8">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Jogadores</div>
                    <div className="flex items-center gap-1 font-bold text-slate-700"><Users size={14}/> {league._count.players}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Duplas</div>
                    <div className="flex items-center gap-1 font-bold text-slate-700"><LayoutDashboard size={14}/> {league._count.teams}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">Painel de Controle <ChevronRight size={14}/></span>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">?</div>)}
                  </div>
                </div>
              </Link>
            </div>
          ))}

          {leagues.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <Trophy size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Nenhum campeonato ainda</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">Crie seu primeiro torneio e comece a organizar as chaves agora mesmo.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}