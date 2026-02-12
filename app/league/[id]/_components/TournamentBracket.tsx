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

  const roundsData = knockoutMatches.reduce((acc: any, m) => {
    if (!acc[m.round]) acc[m.round] = []
    acc[m.round].push(m)
    return acc
  }, {})

  const roundKeys = Object.keys(roundsData).sort((a, b) => Number(a) - Number(b))
  
  // CONFIGURAÇÃO GEOMÉTRICA (Não mexer aqui, é a matemática do alinhamento)
  const CARD_HEIGHT = 160; // Altura real do card em pixels
  const VERTICAL_GAP = 60; // Espaço entre cards na Fase 1
  const SLOT_HEIGHT = CARD_HEIGHT + VERTICAL_GAP; // 220px

  const handleConfirm = async (id: string) => {
    const s = localScores[id]
    await updateScore(id, s.scoreA, s.scoreB)
    setEditingMatches(prev => ({ ...prev, [id]: false }))
  }

  return (
    <div className="flex items-start bg-slate-900/50 p-12 rounded-[3rem] min-w-max border border-slate-800 shadow-inner">
      {roundKeys.map((round, roundIndex) => {
        const roundMatches = roundsData[round].sort((a: any, b: any) => a.position - b.position)
        const isFinal = roundIndex === roundKeys.length - 1
        const multiplier = Math.pow(2, roundIndex) // 1, 2, 4, 8...

        return (
          <div key={round} className="flex flex-col" style={{ width: isFinal ? '450px' : '350px' }}>
            
            {/* Título da Fase */}
            <div className="h-20 flex items-center justify-center">
                <div className={`px-6 py-2 rounded-full border-2 font-black italic tracking-[0.3em] text-[10px]
                    ${isFinal ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10 animate-pulse' : 'border-slate-700 text-slate-500 bg-slate-800'}
                `}>
                    {isFinal ? '🏆 GRANDE FINAL' : `RODADA ${roundIndex + 1}`}
                </div>
            </div>

            {/* Container de Partidas */}
            <div className="relative">
              {roundMatches.map((match: any) => {
                const isFin = match.status === 'FINISHED'
                const isEd = editingMatches[match.id] || !isFin

                return (
                  <div 
                    key={match.id} 
                    className="relative flex items-center justify-center"
                    style={{ height: `${SLOT_HEIGHT * multiplier}px` }}
                  >
                    {/* Card Principal */}
                    <div className={`
                        relative z-20 w-72 flex flex-col rounded-[2rem] border-2 transition-all duration-500
                        ${isFinal ? 'w-80 scale-110 shadow-[0_0_60px_-15px_rgba(234,179,8,0.3)]' : 'shadow-2xl shadow-black/50'}
                        ${isFin ? 'border-emerald-500 bg-slate-950' : 'border-slate-700 bg-slate-800'}
                    `}>
                        {/* Header do Card */}
                        <div className="px-5 py-0.5 flex justify-between items-center border-b border-slate-700/50 bg-white/5">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Partida #{match.position + 1}</span>
                            {isFin && <Trophy size={12} className="text-emerald-400" />}
                        </div>

                        {/* Duplas e Placar */}
                        {[ 
                            {t: 'A', id: match.teamAId, name: match.teamA?.name, score: 'scoreA'}, 
                            {t: 'B', id: match.teamBId, name: match.teamB?.name, score: 'scoreB'} 
                        ].map((side, i) => (
                            <div key={side.t} className={`flex justify-between items-center px-5 py-4 ${i === 0 ? 'border-b border-slate-700/50' : ''}`}>
                                <div className="flex flex-col min-w-0 pr-4">
                                    <span className={`text-[7px] font-black uppercase mb-0.5 ${match.winnerId === side.id ? 'text-emerald-400' : 'text-slate-500'}`}>Dupla {side.t}</span>
                                    <span className={`text-xs font-black truncate ${match.winnerId === side.id ? 'text-white' : 'text-slate-400'}`}>
                                        {side.name || 'Aguardando...'}
                                    </span>
                                </div>
                                <input 
                                    type="number" 
                                    disabled={!isAdmin || (isFin && !isEd)} 
                                    value={localScores[match.id]?.[side.score as 'scoreA' | 'scoreB'] ?? 0} 
                                    onChange={(e) => setLocalScores(prev => ({ 
                                        ...prev, 
                                        [match.id]: { ...prev[match.id], [side.score]: Math.min(7, Math.max(0, parseInt(e.target.value) || 0)) }
                                    }))}
                                    className={`w-10 h-10 text-center rounded-xl border-2 text-base font-black transition-all outline-none 
                                        ${isFin && !isEd ? 'bg-transparent border-transparent text-emerald-500' : 'bg-slate-900 border-slate-600 text-white focus:border-indigo-500'}
                                    `} 
                                />
                            </div>
                        ))}

                        {/* Botão Confirmar */}
                        {isAdmin && (
                            <div className="p-2 bg-white/5 border-t border-slate-700/50">
                                {isFin && !isEd ? (
                                    <button onClick={() => setEditingMatches(prev => ({ ...prev, [match.id]: true }))} className="w-full py-2 rounded-xl text-slate-400 text-[8px] font-black uppercase hover:text-white transition-colors cursor-pointer">Editar Placar</button>
                                ) : (
                                    <button onClick={() => handleConfirm(match.id)} className="w-full py-2 rounded-xl bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all cursor-pointer">Confirmar</button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* LINHAS CONECTORAS (Matemática Pura) */}
                    {!isFinal && (
                        <div className="absolute right-0 w-1/2 h-full flex items-center pointer-events-none">
                            {/* Linha horizontal que sai do card */}
                            <div className="w-10 h-[2px] bg-slate-700 ml-auto"></div>
                            
                            {/* A "Cerca" (Linha vertical) */}
                            {match.position % 2 === 0 ? (
                                <div className="absolute right-0 border-r-2 border-slate-700" 
                                     style={{ height: `${(SLOT_HEIGHT * multiplier) / 2}px`, top: '50%' }}></div>
                            ) : (
                                <div className="absolute right-0 border-r-2 border-slate-700" 
                                     style={{ height: `${(SLOT_HEIGHT * multiplier) / 2}px`, bottom: '50%' }}></div>
                            )}

                            {/* O "Cotovelo" (Entrada pro próximo) */}
                            {match.position % 2 === 0 && (
                                <div className="absolute -right-10 w-10 h-[2px] bg-slate-700" 
                                     style={{ top: `${SLOT_HEIGHT * multiplier}px` }}></div>
                            )}
                        </div>
                    )}

                    {/* Linha de entrada vindo da fase anterior */}
                    {roundIndex > 0 && (
                        <div className="absolute left-0 w-10 h-[2px] bg-slate-700 z-0"></div>
                    )}
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