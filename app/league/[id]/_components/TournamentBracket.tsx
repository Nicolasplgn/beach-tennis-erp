'use client'

import { updateScore } from "@/app/actions"
import { Trophy, CheckCircle, Edit3 } from "lucide-react"
import { useState, useEffect } from "react"

export default function TournamentBracket({ matches, isAdmin }: { matches: any[], isAdmin: boolean }) {
  // Estado para armazenar os placares digitados antes de confirmar
  const [localScores, setLocalScores] = useState<Record<string, { scoreA: number, scoreB: number }>>({})
  // Estado para controlar quais jogos estão em modo de edição
  const [editingMatches, setEditingMatches] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const initialScores: Record<string, { scoreA: number, scoreB: number }> = {}
    matches.forEach(match => {
      initialScores[match.id] = { 
        scoreA: match.scoreA ?? 0, 
        scoreB: match.scoreB ?? 0 
      }
    })
    setLocalScores(initialScores)
  }, [matches])

  const knockoutMatches = matches.filter(match => match.type === 'KNOCKOUT')
  
  if (knockoutMatches.length === 0) {
    return <div className="text-white p-10 font-bold text-center w-full uppercase tracking-widest opacity-20">Nenhum jogo de mata-mata disponível.</div>
  }

  const rounds = knockoutMatches.reduce((acc: any, match) => {
    if (!acc[match.round]) acc[match.round] = []
    acc[match.round].push(match)
    return acc
  }, {})

  const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b))

  const handleInputChange = (matchId: string, field: 'scoreA' | 'scoreB', value: string) => {
    const numericValue = parseInt(value) || 0
    setLocalScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: numericValue
      }
    }))
  }

  const handleConfirmResult = async (matchId: string) => {
    const scores = localScores[matchId]
    await updateScore(matchId, scores.scoreA, scores.scoreB)
    setEditingMatches(prev => ({ ...prev, [matchId]: false }))
  }

  return (
    <div className="flex gap-16 items-center p-10">
      {roundKeys.map((round, index) => {
        const isFinal = index === roundKeys.length - 1
        const roundMatches = rounds[round].sort((a: any, b: any) => a.position - b.position)
        
        return (
          <div key={round} className="flex flex-col justify-center space-y-20 relative h-full">
            <div className="absolute -top-16 left-0 w-full text-center">
              <span className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">
                {isFinal ? '🏆 Grande Final' : `Fase ${round}`}
              </span>
            </div>

            {roundMatches.map((match: any) => {
              const isFinished = match.status === 'FINISHED'
              const isBeingEdited = editingMatches[match.id] || !isFinished

              return (
                <div key={match.id} className="relative flex items-center">
                  {/* CARD - Ajustado para w-80 */}
                  <div className={`
                    w-80 flex flex-col rounded-3xl overflow-hidden border-2 transition-all duration-300 shadow-2xl
                    ${isFinished ? 'border-emerald-500 bg-slate-900' : 'border-slate-700 bg-slate-800'}
                  `}>
                    
                    <div className="bg-slate-950/50 px-5 py-3 flex justify-between items-center border-b border-slate-700/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Partida #{match.position + 1}</span>
                        {isFinished && <Trophy size={16} className="text-emerald-400" />}
                    </div>

                    {/* TIME A - Nome ajustado para text-lg */}
                    <div className="flex justify-between items-center px-6 py-6 border-b border-slate-700/50">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className={`text-[9px] font-black uppercase mb-1 tracking-tighter ${match.winnerId === match.teamAId ? 'text-emerald-400' : 'text-slate-500'}`}>Dupla A</span>
                        <span className="text-lg font-black text-white truncate pr-4 leading-tight">{match.teamA?.name || 'Aguardando...'}</span>
                      </div>
                      <input 
                        type="number"
                        disabled={!isAdmin || (isFinished && !isBeingEdited)}
                        value={localScores[match.id]?.scoreA ?? 0}
                        onChange={(event) => handleInputChange(match.id, 'scoreA', event.target.value)}
                        className={`w-14 h-14 text-center rounded-xl border-2 text-2xl font-black transition-all outline-none
                          ${isFinished && !isBeingEdited ? 'bg-slate-950 border-transparent text-emerald-400' : 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500'}
                        `}
                      />
                    </div>

                    {/* TIME B - Nome ajustado para text-lg */}
                    <div className="flex justify-between items-center px-6 py-6 border-b border-slate-700/50">
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className={`text-[9px] font-black uppercase mb-1 tracking-tighter ${match.winnerId === match.teamBId ? 'text-emerald-400' : 'text-slate-500'}`}>Dupla B</span>
                        <span className="text-lg font-black text-white truncate pr-4 leading-tight">{match.teamB?.name || 'Aguardando...'}</span>
                      </div>
                      <input 
                        type="number"
                        disabled={!isAdmin || (isFinished && !isBeingEdited)}
                        value={localScores[match.id]?.scoreB ?? 0}
                        onChange={(event) => handleInputChange(match.id, 'scoreB', event.target.value)}
                        className={`w-14 h-14 text-center rounded-xl border-2 text-2xl font-black transition-all outline-none
                          ${isFinished && !isBeingEdited ? 'bg-slate-950 border-transparent text-emerald-400' : 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500'}
                        `}
                      />
                    </div>

                    {/* BOTÕES */}
                    {isAdmin && (
                      <div className="p-3 bg-slate-950/30">
                        {isFinished && !isBeingEdited ? (
                          <button 
                            onClick={() => setEditingMatches(prev => ({ ...prev, [match.id]: true }))}
                            className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                          >
                            <Edit3 size={12} /> Editar Resultado
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleConfirmResult(match.id)}
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 transition-all"
                          >
                            <CheckCircle size={12} /> Confirmar Placar
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CONECTORES - Ajustados para a nova largura de card */}
                  {!isFinal && (
                    <>
                      <div className="absolute -right-8 top-1/2 w-8 h-[2px] bg-slate-700 z-0"></div>
                      <div className={`absolute -right-8 w-[2px] bg-slate-700 z-0 ${match.position % 2 === 0 ? 'top-1/2 h-[calc(50%+40px)]' : 'bottom-1/2 h-[calc(50%+40px)]'} ${roundMatches.length === 1 ? 'hidden' : ''}`}></div>
                      <div className={`absolute -right-16 w-8 h-[2px] bg-slate-700 ${match.position % 2 === 0 ? 'top-[calc(100%+40px)]' : 'bottom-[calc(100%+40px)]'} ${roundMatches.length === 1 ? 'hidden' : ''}`}></div>
                    </>
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