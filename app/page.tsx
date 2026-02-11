import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { deleteLeague, logoutAction } from './actions'
import { CreateLeagueModal } from '@/app/components/CreateLeagueModal'
import Link from 'next/link'
import { Trophy, Trash2, LogOut, Calendar } from 'lucide-react'

export default async function Dashboard() {
  const session = await auth()
  
  const leagues = await prisma.league.findMany({
    where: { adminId: session?.user?.id },
    include: { _count: { select: { players: true, tournaments: true } } }, 
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen">
      {/* NAVBAR FLUTUANTE */}
      <nav className="fixed top-6 left-0 right-0 max-w-7xl mx-auto px-6 z-50">
        <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-lg shadow-slate-200/20 rounded-full px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
            <div className="bg-linear-to-tr from-indigo-600 to-violet-600 p-2 rounded-full text-white shadow-md shadow-indigo-500/30">
                <Trophy size={18} strokeWidth={3} />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tighter">
                BEACH<span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600">PRO</span>
            </span>
            </div>
            <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block border border-slate-200 px-3 py-1 rounded-full">
                {session?.user?.email}
            </span>
            <form action={logoutAction}>
                <button type="submit" className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-full hover:bg-red-50 cursor-pointer">
                    <LogOut size={18}/>
                </button>
            </form>
            </div>
        </div>
      </nav>

      {/* CONTEÚDO */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
              Suas <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-500">Ligas</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-md">
              Gerencie ligas, rankings e torneios com a tecnologia que seu esporte merece.
            </p>
          </div>
          <CreateLeagueModal />
        </div>

        {/* GRID DE LIGAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {leagues.map((league) => (
            <div key={league.id} className="group relative bg-white/60 backdrop-blur-xl border border-white/60 p-1 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300">
              
              {/* Card Content */}
              <div className="bg-white rounded-[2rem] p-6 h-full flex flex-col justify-between relative overflow-hidden">
                {/* Efeito de brilho no fundo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-[100px] -mr-4 -mt-4 transition-all group-hover:scale-150 duration-500"></div>

                <div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                        Ranking Ativo
                        </div>
                        
                        <form action={deleteLeague.bind(null, league.id)}>
                        <button className="text-slate-300 hover:text-red-400 transition-colors p-2 hover:bg-red-50 rounded-full cursor-pointer">
                            <Trash2 size={16} />
                        </button>
                        </form>
                    </div>

                    <Link href={`/league/${league.id}`} className="block relative z-10">
                        <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-indigo-600 group-hover:to-violet-600 transition-all truncate">
                            {league.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-8">
                            <Calendar size={14} />
                            Desde {new Date(league.createdAt).toLocaleDateString()}
                        </div>
                    </Link>
                </div>
                
                <div className="flex gap-4 border-t border-slate-50 pt-6 relative z-10">
                  <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center group-hover:bg-indigo-50/50 transition-colors">
                    <p className="text-xl font-black text-slate-900">{league._count.players}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Atletas</p>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center group-hover:bg-indigo-50/50 transition-colors">
                    <p className="text-xl font-black text-slate-900">{league._count.tournaments}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Torneios</p>
                  </div>
                </div>

                {/* REMOVI O BOTÃO FLUTUANTE DA FLECHA AQUI */}
              </div>
            </div>
          ))}

          {leagues.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
                  <Trophy size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Nenhum campeonato ainda</h3>
              <p className="text-sm text-slate-500 mt-2">Comece criando sua primeira liga.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}