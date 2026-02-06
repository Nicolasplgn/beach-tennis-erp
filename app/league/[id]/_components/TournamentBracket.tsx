'use client'

import { updateScore } from "@/app/actions"
import { Trophy } from "lucide-react"
import { useState, useEffect } from "react"

export default function TournamentBracket({ matches, isAdmin }: { matches: any[], isAdmin: boolean }) {
  const [scores, setScores] = useState<Record<string, { scoreA: number, scoreB: number }>>({})

  useEffect(() => {
    const initial: Record<string, { scoreA: number, scoreB: number }> = {}
    matches.forEach(m => {
      initial[m.id] = { scoreA: m.scoreA || 0, scoreB: m.scoreB || 0 }
    })
    setScores(initial)
  }, [matches])

  const rounds = matches.reduce((acc: any, m) => {
    if (!acc[m.round]) acc[m.round] = []
    acc[m.round].push(m)
    return acc
  }, {})

  // --- CORREÇÃO AQUI ---
  // Antes estava b - a (Decrescente). Agora mudamos para a - b (Crescente).
  // Round 1 (Muitos jogos) fica na Esquerda. Round Maior (Final) fica na Direita.
  const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b))

  const handleBlur = async (matchId: string, scoreA: number, scoreB: number) => {
    await updateScore(matchId, scoreA, scoreB)
  }

  const handleChange = (matchId: string, field: 'scoreA' | 'scoreB', value: string) => {
    const num = parseInt(value) || 0
    setScores(prev => ({
      ...prev,
      [matchId]: {
        scoreA: field === 'scoreA' ? num : (prev[matchId]?.scoreA || 0),
        scoreB: field === 'scoreB' ? num : (prev[matchId]?.scoreB || 0)
      }
    }))
  }

  return (
    <div className="w-full h-full overflow-x-auto pb-12 pt-12 px-8 custom-scrollbar-dark flex justify-start lg:justify-center">
      <div className="flex gap-16 items-center">
        {roundKeys.map((round, index) => {
          // A última rodada do array é a Final
          const isFinal = index === roundKeys.length - 1
          const roundMatches = rounds[round].sort((a: any, b: any) => a.position - b.position)
          
          return (
            <div key={round} className="flex flex-col justify-center space-y-10 relative h-full">
              {/* Título da Rodada */}
              <div className="absolute -top-10 left-0 w-full text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {isFinal ? '🏆 Grande Final' : `Rodada ${round}`}
                </span>
              </div>

              {roundMatches.map((match: any) => (
                <div key={match.id} className="relative flex items-center">
                  
                  {/* CARD DO JOGO */}
                  <div className={`
                    w-72 flex flex-col rounded-xl overflow-hidden border-2 transition-all duration-300 relative z-10
                    ${match.status === 'FINISHED' ? 'border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]' : 'border-slate-700 bg-slate-800'}
                    ${match.status === 'PENDING' ? 'opacity-60 grayscale' : 'opacity-100'}
                  `}>
                    
                    {/* Header */}
                    <div className="bg-slate-900/50 px-3 py-1.5 flex justify-between items-center border-b border-slate-700/50">
                        <span className="text-[9px] font-bold text-slate-500">JOGO #{match.position + 1}</span>
                        {match.status === 'FINISHED' && <Trophy size={10} className="text-emerald-400" />}
                    </div>

                    {/* Time A */}
                    <div className={`
                      flex justify-between items-center px-4 py-3 border-b border-slate-700/50
                      ${match.winnerId === match.teamAId && match.winnerId ? 'bg-emerald-900/20' : 'bg-slate-800'}
                    `}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-1 h-8 rounded-full ${match.winnerId === match.teamAId ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                        <span className={`text-xs font-bold truncate max-w-[140px] ${match.teamA ? 'text-slate-100' : 'text-slate-500 italic'}`}>
                          {match.teamA?.name || 'A definir'}
                        </span>
                      </div>
                      
                      {isAdmin ? (
                        <input 
                          type="number"
                          value={scores[match.id]?.scoreA ?? 0}
                          onChange={(e) => handleChange(match.id, 'scoreA', e.target.value)}
                          onBlur={(e) => handleBlur(match.id, Number(e.target.value), scores[match.id]?.scoreB)}
                          className="w-10 h-8 text-center bg-slate-900 rounded-lg border border-slate-700 font-mono text-sm font-bold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        />
                      ) : (
                        <span className={`font-mono text-lg font-bold ${match.winnerId === match.teamAId ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {match.scoreA}
                        </span>
                      )}
                    </div>

                    {/* Time B */}
                    <div className={`
                      flex justify-between items-center px-4 py-3
                      ${match.winnerId === match.teamBId && match.winnerId ? 'bg-emerald-900/20' : 'bg-slate-800'}
                    `}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-1 h-8 rounded-full ${match.winnerId === match.teamBId ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                        <span className={`text-xs font-bold truncate max-w-[140px] ${match.teamB ? 'text-slate-100' : 'text-slate-500 italic'}`}>
                          {match.teamB?.name || 'A definir'}
                        </span>
                      </div>

                      {isAdmin ? (
                        <input 
                          type="number"
                          value={scores[match.id]?.scoreB ?? 0}
                          onChange={(e) => handleChange(match.id, 'scoreB', e.target.value)}
                          onBlur={(e) => handleBlur(match.id, scores[match.id]?.scoreA, Number(e.target.value))}
                          className="w-10 h-8 text-center bg-slate-900 rounded-lg border border-slate-700 font-mono text-sm font-bold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        />
                      ) : (
                        <span className={`font-mono text-lg font-bold ${match.winnerId === match.teamBId ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {match.scoreB}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* LINHAS CONECTORAS (Direita para Esquerda) */}
                  {!isFinal && (
                    <>
                      {/* Linha Horizontal saindo do card para a direita */}
                      <div className="absolute -right-8 top-1/2 w-8 h-[2px] bg-slate-700 z-0"></div>
                      
                      {/* Conector Vertical (Braço) */}
                      {/* Lógica: Pares descem, Ímpares sobem para encontrar o "pai" no meio */}
                      <div className={`
                        absolute -right-8 w-[2px] bg-slate-700 z-0
                        ${match.position % 2 === 0 ? 'top-1/2 h-[calc(50%+20px)]' : 'bottom-1/2 h-[calc(50%+20px)]'}
                        ${roundMatches.length === 1 ? 'hidden' : ''} 
                      `}></div>
                      
                      {/* Cotovelo para a próxima rodada */}
                      <div className={`
                         absolute -right-16 w-8 h-[2px] bg-slate-700
                         ${match.position % 2 === 0 ? 'top-[calc(100%+20px)]' : 'bottom-[calc(100%+20px)]'}
                         ${roundMatches.length === 1 ? 'hidden' : ''}
                      `}></div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}