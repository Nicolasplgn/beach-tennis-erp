import { Trophy, Medal } from 'lucide-react'

// Removi "topScorers" dos props
export function TournamentPodium({ champions, runnersUp }: any) {
  return (
    <div className="space-y-8 animate-in zoom-in duration-500 max-w-4xl mx-auto mt-10">
      
      {/* TÍTULO */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Resultado Final</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Torneio Encerrado com Sucesso</p>
      </div>

      {/* PÓDIO PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CAMPEÕES (OURO) */}
        <div className="bg-linear-to-br from-yellow-100 to-amber-50 border-2 border-yellow-400/50 p-10 rounded-[3rem] relative overflow-hidden shadow-2xl shadow-yellow-200/50 flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-500">
            <div className="absolute top-0 right-0 p-32 bg-yellow-400/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="bg-yellow-400 text-yellow-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-400/40">
                    <Trophy size={40} fill="currentColor" />
                </div>
                
                <h3 className="text-xs font-black text-yellow-600 uppercase tracking-[0.2em] mb-2">Grande Campeão</h3>
                <div className="text-4xl font-black text-slate-900 leading-tight">
                    {champions ? champions.name : 'Indefinido'}
                </div>
                
                {champions && (
                    <div className="flex justify-center gap-2 mt-4 flex-wrap">
                        {champions.players.map((p: any) => (
                            <span key={p.id} className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold text-yellow-900 border border-yellow-200 shadow-sm">
                                {p.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* VICE-CAMPEÕES (PRATA) */}
        <div className="bg-linear-to-br from-slate-100 to-gray-50 border-2 border-slate-300 p-10 rounded-[3rem] relative overflow-hidden shadow-xl flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-500 mt-0 md:mt-8">
            <div className="relative z-10">
                <div className="bg-slate-300 text-slate-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Medal size={32} />
                </div>
                
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Vice-Campeão</h3>
                <div className="text-3xl font-black text-slate-700 leading-tight">
                    {runnersUp ? runnersUp.name : 'Indefinido'}
                </div>
                
                {runnersUp && (
                    <div className="flex justify-center gap-2 mt-4 flex-wrap">
                        {runnersUp.players.map((p: any) => (
                            <span key={p.id} className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 shadow-sm">
                                {p.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

    </div>
  )
}