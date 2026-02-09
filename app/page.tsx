import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { deleteLeague, logoutAction } from './actions'
import { CreateLeagueModal } from '@/app/components/CreateLeagueModal' // Import novo
import Link from 'next/link'
import { Trophy, Users, Trash2, LogOut, LayoutDashboard, Calendar } from 'lucide-react'

export default async function Dashboard() {
  const session = await auth()
  const leagues = await prisma.league.findMany({
    where: { adminId: session?.user?.id },
    include: { _count: { select: { players: true, tournaments: true } } }, 
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200"><Trophy size={20} strokeWidth={3} /></div>
          <span className="text-lg font-black text-slate-900 tracking-tighter">BEACH<span className="text-indigo-600">PRO</span></span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">{session?.user?.email}</span>
          <form action={logoutAction}><button type="submit" className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Sair"><LogOut size={18}/></button></form>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div><h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Minhas Ligas</h1><p className="text-slate-500 font-medium">Gerencie seus circuitos e rankings.</p></div>
          
          {/* AQUI ESTÁ O MODAL NOVO */}
          <CreateLeagueModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <div key={league.id} className="group relative bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-slate-50 text-slate-500 border-slate-200">Ranking Ativo</div>
                <form action={deleteLeague.bind(null, league.id)}><button className="text-slate-300 hover:text-red-400 transition-colors p-1"><Trash2 size={16} /></button></form>
              </div>
              <Link href={`/league/${league.id}`} className="block">
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors truncate">{league.name}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6"><Calendar size={14} /> Criada em {new Date(league.createdAt).toLocaleDateString()}</div>
                <div className="flex gap-6 pt-4 border-t border-slate-50">
                  <div><div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Ranking</div><div className="flex items-center gap-1.5 font-bold text-slate-700"><Users size={16} className="text-indigo-500"/> {league._count.players} <span className="text-[10px] text-slate-400 font-normal">Atletas</span></div></div>
                  <div><div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Etapas</div><div className="flex items-center gap-1.5 font-bold text-slate-700"><LayoutDashboard size={16} className="text-indigo-500"/> {league._count.tournaments}</div></div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}