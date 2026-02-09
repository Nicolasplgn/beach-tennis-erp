import { Trophy, Medal, Star } from 'lucide-react'

export function TournamentPodium({ champions, runnersUp, topScorers }: any) {
  return (
    <div className="space-y-8 animate-in zoom-in duration-500">
      
      {/* PÓDIO PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CAMPEÕES */}
        <div className="bg-linear-to-br from-yellow-100 to-amber-100 border-2 border-yellow-300 p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl shadow-yellow-100">
            <div className="absolute top-0 right-0 p-20 bg-yellow-400/20 blur-3xl rounded-full"></div>
            <div className="relative z-10 text-center">
                <Trophy className="mx-auto text-yellow-600 mb-4 drop-shadow-sm" size={48} fill="currentColor" />
                <h3 className="text-sm font-black text-yellow-700 uppercase tracking-widest mb-1">Grande Campeão</h3>
                <div className="text-3xl font-black text-slate-900 mt-2">
                    {champions ? champions.name : 'A Definir'}
                </div>
                {champions && (
                    <div className="flex justify-center gap-2 mt-2">
                        {champions.players.map((p: any) => (
                            <span key={p.id} className="bg-white/60 px-3 py-1 rounded-full text-xs font-bold text-yellow-800 border border-yellow-200">
                                {p.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* VICE-CAMPEÕES */}
        <div className="bg-linear-to-br from-slate-100 to-slate-200 border-2 border-slate-300 p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-20 bg-slate-400/20 blur-3xl rounded-full"></div>
            <div className="relative z-10 text-center">
                <Medal className="mx-auto text-slate-500 mb-4 drop-shadow-sm" size={48} />
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Vice-Campeão</h3>
                <div className="text-2xl font-black text-slate-900 mt-2">
                    {runnersUp ? runnersUp.name : 'A Definir'}
                </div>
                {runnersUp && (
                    <div className="flex justify-center gap-2 mt-2">
                        {runnersUp.players.map((p: any) => (
                            <span key={p.id} className="bg-white/60 px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-slate-200">
                                {p.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* RANKING DO TORNEIO (QUEM MAIS PONTUOU) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Star className="text-indigo-500" fill="currentColor"/> Melhores Pontuadores (Neste Torneio)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topScorers.slice(0, 6).map((player: any, idx: number) => (
                <div key={player.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                        <span className={`font-black text-lg w-6 ${idx === 0 ? 'text-yellow-500' : 'text-slate-300'}`}>#{idx + 1}</span>
                        <div>
                            <p className="text-xs font-black text-slate-900">{player.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Cat. {player.level}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block font-black text-indigo-600">+{player.points}</span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase">Pts</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}