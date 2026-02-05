import { PrismaClient } from '@prisma/client'
import { createLeague } from './actions'
import Link from 'next/link'
import { Trophy, Plus, Calendar } from 'lucide-react'

const prisma = new PrismaClient()

export default async function Home() {
  // Busca ligas ordenadas pela mais recente
  const leagues = await prisma.league.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { players: true } } }
  })

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-3 mb-8">
          <div className="bg-orange-500 p-3 rounded-lg text-white">
            <Trophy size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Beach Tennis Manager</h1>
            <p className="text-slate-500">Gerencie seus torneios de forma simples</p>
          </div>
        </header>
        
        {/* Formulário de Criação */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus size={20} className="text-orange-500"/> Criar Nova Liga
          </h2>
          <form action={createLeague} className="flex flex-col md:flex-row gap-3">
            <input 
              name="name" 
              type="text" 
              placeholder="Nome do Campeonato (ex: Open Verão 2024)" 
              className="flex-1 border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition">
              Criar Liga
            </button>
          </form>
        </section>

        {/* Listagem */}
        <h2 className="text-xl font-bold text-slate-700 mb-4">Seus Campeonatos</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {leagues.map((league) => (
            <Link key={league.id} href={`/league/${league.id}`}>
              <div className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-orange-600 transition">
                    {league.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    league.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {league.status === 'DRAFT' ? 'Rascunho' : 'Em Andamento'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {new Date(league.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span>
                    • {league._count.players} Jogadores
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {leagues.length === 0 && (
            <div className="text-center py-10 text-slate-400 col-span-2 bg-white rounded-xl border border-dashed">
              Nenhuma liga criada ainda. Comece agora!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}