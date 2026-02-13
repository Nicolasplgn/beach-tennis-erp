'use client'

import { updateScore } from "@/app/actions"
import { Trophy, CheckCircle, Edit3 } from "lucide-react"
import { useState, useEffect } from "react"

export default function TournamentBracket({ matches, isAdmin }: { matches: any[], isAdmin: boolean }) {
  // ... (Estados e useEffect mantidos iguais)
  const [localScores, setLocalScores] = useState<Record<string, { scoreA: number, scoreB: number }>>({})
  const [editingMatches, setEditingMatches] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const initial: Record<string, { scoreA: number, scoreB: number }> = {}
    matches.forEach(m => { initial[m.id] = { scoreA: m.scoreA ?? 0, scoreB: m.scoreB ?? 0 } })
    setLocalScores(initial)
  }, [matches])

  const knockoutMatches = matches.filter(m => m.type === 'KNOCKOUT')
  if (knockoutMatches.length === 0) return null

  const roundsData = knockoutMatches.reduce((acc: any, m) => {
    if (!acc[m.round]) acc[m.round] = []
    acc[m.round].push(m)
    return acc
  }, {})

  const roundKeys = Object.keys(roundsData).sort((a, b) => Number(a) - Number(b))
  
  const BASE_HEIGHT = 300; // Altura base ajustada para dar espaço

  const handleConfirm = async (id: string) => {
    const s = localScores[id]
    await updateScore(id, s.scoreA, s.scoreB)
    setEditingMatches(prev => ({ ...prev, [id]: false }))
  }
  
  const handleInputChange = (id: string, field: 'scoreA' | 'scoreB', val: string) => {
    let num = parseInt(val)
    if (isNaN(num)) num = 0
    if (num > 7) num = 7
    if (num < 0) num = 0
    setLocalScores(prev => ({ ...prev, [id]: { ...prev[id], [field]: num } }))
  }

  return (
    // CORREÇÃO: pt-12 para não cortar o título da fase
    <div className="flex items-start gap-0 pt-12 pb-20 min-w-max mx-auto">
      {roundKeys.map((round, roundIndex) => {
        const roundMatches = roundsData[round].sort((a: any, b: any) => a.position - b.position)
        const isFinal = roundIndex === roundKeys.length - 1
        const multiplier = Math.pow(2, roundIndex)

        return (
          <div key={round} className="flex flex-col" style={{ width: isFinal ? '450px' : '350px' }}>
            
            {/* Título da Fase */}
            <div className="h-16 flex items-center justify-center">
                <span className={`
                    text-[10px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full border shadow-lg
                    ${isFinal ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50' : 'bg-slate-800 text-slate-500 border-slate-700'}
                `}>
                    {isFinal ? 'GRANDE FINAL' : `RODADA ${round}`}
                </span>
            </div>

            <div className="flex flex-col">
              {roundMatches.map((match: any) => {
                const isFin = match.status === 'FINISHED'
                const isEd = editingMatches[match.id] || !isFin

                return (
                  <div 
                    key={match.id} 
                    className="relative flex items-center justify-center"
                    style={{ height: `${BASE_HEIGHT * multiplier}px` }}
                  >
                    <div className="w-full px-8 relative z-10">
                        {/* CARD */}
                        <div className={`
                            w-full flex flex-col rounded-[2rem] overflow-hidden border-2 transition-all duration-500 relative
                            ${isFinal ? 'scale-110 shadow-[0_0_80px_-20px_rgba(234,179,8,0.2)]' : 'shadow-xl'}
                            ${isFin ? 'border-slate-800 bg-slate-900 opacity-80 grayscale-[0.5]' : 'border-indigo-500 bg-slate-800 shadow-indigo-500/20'}
                        `}>
                            {/* Header Card */}
                            <div className="px-5 py-3 flex justify-between items-center border-b border-white/5 bg-black/20">
                                <span className={`text-[8px] font-black uppercase tracking-widest ${isFin ? 'text-slate-600' : 'text-indigo-300'}`}>Jogo #{match.position + 1}</span>
                                {isFin && <Trophy size={12} className="text-yellow-600" />}
                            </div>

                            {[ {t: 'A', id: match.teamAId, name: match.teamA?.name, score: 'scoreA'}, {t: 'B', id: match.teamBId, name: match.teamB?.name, score: 'scoreB'} ].map((side, i) => (
                                <div key={side.t} className={`flex justify-between items-center px-5 py-3 ${i === 0 ? 'border-b border-white/5' : ''} ${match.winnerId === side.id && match.winnerId ? 'bg-emerald-500/10' : ''}`}>
                                    <div className="flex flex-col min-w-0 pr-4">
                                        <span className={`text-[8px] font-black uppercase mb-0.5 ${match.winnerId === side.id ? 'text-emerald-400' : 'text-slate-500'}`}>Dupla {side.t}</span>
                                        <span className={`text-sm font-black truncate ${match.winnerId === side.id ? 'text-emerald-400' : 'text-slate-300'}`}>
                                            {side.name || 'Aguardando...'}
                                        </span>
                                    </div>
                                    <input 
                                        type="number" min="0" max="7"
                                        disabled={!isAdmin || (isFin && !isEd)} 
                                        value={localScores[match.id]?.[side.score as 'scoreA' | 'scoreB'] ?? 0} 
                                        onChange={(e) => handleInputChange(match.id, side.score as 'scoreA' | 'scoreB', e.target.value)}
                                        className={`w-10 h-10 text-center rounded-xl border-2 text-lg font-black outline-none transition-all 
                                            ${isFin && !isEd ? 'bg-transparent border-transparent text-emerald-500' : 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500'}
                                        `} 
                                    />
                                </div>
                            ))}

                            {isAdmin && (
                                <div className="p-2 bg-black/20 flex justify-center">
                                    {isFin && !isEd ? (
                                        <button onClick={() => setEditingMatches(prev => ({ ...prev, [match.id]: true }))} className="text-[9px] font-black uppercase text-slate-500 hover:text-white transition-colors flex items-center gap-1"><Edit3 size={10} /> Corrigir</button>
                                    ) : (
                                        <button onClick={() => handleConfirm(match.id)} className="w-full py-2 rounded-xl bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg flex items-center justify-center gap-2"><CheckCircle size={12} /> Salvar Placar</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CONECTORES (LINHAS) */}
                    {!isFinal && (
                        <div className="absolute right-0 w-1/2 h-full pointer-events-none">
                            <div className="absolute right-0 top-1/2 w-8 h-[2px] bg-slate-800"></div>
                            {match.position % 2 === 0 ? (
                                <div className="absolute right-0 border-r-2 border-slate-800" style={{ height: `${(BASE_HEIGHT * multiplier) / 2}px`, top: '50%' }}></div>
                            ) : (
                                <div className="absolute right-0 border-r-2 border-slate-800" style={{ height: `${(BASE_HEIGHT * multiplier) / 2}px`, bottom: '50%' }}></div>
                            )}
                            {match.position % 2 === 0 && (
                                <div className="absolute -right-8 w-8 h-[2px] bg-slate-800" style={{ top: `${BASE_HEIGHT * multiplier}px` }}></div>
                            )}
                        </div>
                    )}
                    {roundIndex > 0 && <div className="absolute left-0 top-1/2 w-8 h-[2px] bg-slate-800 z-0"></div>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}