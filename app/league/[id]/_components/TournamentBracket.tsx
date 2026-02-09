'use client'

import { updateScore } from "@/app/actions"
import { Trophy, CheckCircle, Edit3 } from "lucide-react"
import { useState, useEffect } from "react"

export default function TournamentBracket({ matches, isAdmin }: { matches: any[], isAdmin: boolean }) {
  const [localScores, setLocalScores] = useState<Record<string, { scoreA: number, scoreB: number }>>({})
  const [editingMatches, setEditingMatches] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const initial: Record<string, { scoreA: number, scoreB: number }> = {}
    matches.forEach(m => { initial[m.id] = { scoreA: m.scoreA ?? 0, scoreB: m.scoreB ?? 0 } })
    setLocalScores(initial)
  }, [matches])

  const knockoutMatches = matches.filter(m => m.type === 'KNOCKOUT')
  if (knockoutMatches.length === 0) return null

  const rounds = knockoutMatches.reduce((acc: any, m) => {
    if (!acc[m.round]) acc[m.round] = []
    acc[m.round].push(m)
    return acc
  }, {})
  const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b))

  const handleInputChange = (id: string, field: 'scoreA' | 'scoreB', val: string) => {
    let num = parseInt(val) || 0
    // TRAVA: Mínimo 0, Máximo 6
    if (num > 7) num = 7
    if (num < 0) num = 0
    
    setLocalScores(prev => ({ 
        ...prev, 
        [id]: { ...prev[id], [field]: num } 
    }))
  }

  const handleConfirm = async (id: string) => {
    const s = localScores[id]
    await updateScore(id, s.scoreA, s.scoreB)
    setEditingMatches(prev => ({ ...prev, [id]: false }))
  }

  return (
    <div className="flex gap-16 items-center p-10 overflow-x-auto">
      {roundKeys.map((round, index) => {
        const isFinal = index === roundKeys.length - 1
        const roundMatches = rounds[round].sort((a: any, b: any) => a.position - b.position)
        return (
          <div key={round} className="flex flex-col justify-center space-y-20 relative h-full">
            <div className="absolute -top-16 left-0 w-full text-center">
              <span className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">{isFinal ? '🏆 Final' : `Fase ${round}`}</span>
            </div>
            {roundMatches.map((match: any) => {
              const isFin = match.status === 'FINISHED'
              const isEd = editingMatches[match.id] || !isFin
              return (
                <div key={match.id} className="relative flex items-center">
                  <div className={`w-80 flex flex-col rounded-3xl overflow-hidden border-2 transition-all shadow-2xl ${isFin ? 'border-emerald-500 bg-slate-900' : 'border-slate-700 bg-slate-800'}`}>
                    <div className="bg-slate-950/50 px-5 py-3 flex justify-between items-center border-b border-slate-700/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Partida #{match.position + 1}</span>
                        {isFin && <Trophy size={16} className="text-emerald-400" />}
                    </div>
                    {[ {t: 'A', id: match.teamAId, name: match.teamA?.name}, {t: 'B', id: match.teamBId, name: match.teamB?.name} ].map(side => (
                        <div key={side.t} className={`flex justify-between items-center px-6 py-6 border-slate-700/50 ${side.t === 'A' ? 'border-b' : ''} ${match.winnerId === side.id && match.winnerId ? 'bg-emerald-900/20' : ''}`}>
                             <div className="flex flex-col flex-1 min-w-0">
                                <span className={`text-[9px] font-black uppercase mb-1 ${match.winnerId === side.id ? 'text-emerald-400' : 'text-slate-500'}`}>Dupla {side.t}</span>
                                <span className="text-lg font-black text-white truncate">{side.name || 'A definir'}</span>
                            </div>
                            <input 
                                type="number" 
                                min="0"
                                max="7"
                                disabled={!isAdmin || (isFin && !isEd)} 
                                value={localScores[match.id]?.[side.t === 'A' ? 'scoreA' : 'scoreB'] ?? 0} 
                                onChange={(e) => handleInputChange(match.id, side.t === 'A' ? 'scoreA' : 'scoreB', e.target.value)} 
                                className={`w-14 h-14 text-center rounded-xl border-2 text-2xl font-black transition-all ${isFin && !isEd ? 'bg-slate-950 border-transparent text-emerald-400' : 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500'}`} 
                            />
                        </div>
                    ))}
                    {isAdmin && (
                      <div className="p-3 bg-slate-950/30">
                        {isFin && !isEd ? (
                          <button onClick={() => setEditingMatches(prev => ({ ...prev, [match.id]: true }))} className="w-full py-3 rounded-xl bg-slate-700 text-white text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all"><Edit3 size={12} /> Editar Resultado</button>
                        ) : (
                          <button onClick={() => handleConfirm(match.id)} className="w-full py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 transition-all"><CheckCircle size={12} /> Confirmar Placar</button>
                        )}
                      </div>
                    )}
                  </div>
                  {!isFinal && (
                    <><div className="absolute -right-8 top-1/2 w-8 h-[2px] bg-slate-700 z-0"></div><div className={`absolute -right-8 w-[2px] bg-slate-700 z-0 ${match.position % 2 === 0 ? 'top-1/2 h-[calc(50%+40px)]' : 'bottom-1/2 h-[calc(50%+40px)]'} ${roundMatches.length === 1 ? 'hidden' : ''}`}></div><div className={`absolute -right-16 w-8 h-[2px] bg-slate-700 ${match.position % 2 === 0 ? 'top-[calc(100%+40px)]' : 'bottom-[calc(100%+40px)]'} ${roundMatches.length === 1 ? 'hidden' : ''}`}></div></>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}