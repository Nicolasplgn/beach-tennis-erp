'use client'

import { updateScore } from "@/app/actions"
import { Trophy } from "lucide-react"
import { useState, useEffect } from "react"

export default function TournamentBracket({ matches, isAdmin }: { matches: any[], isAdmin: boolean }) {
  const [scores, setScores] = useState<Record<string, { scoreA: number, scoreB: number }>>({})

  useEffect(() => {
    const initialScores: Record<string, { scoreA: number, scoreB: number }> = {}
    matches.forEach(m => {
      initialScores[m.id] = { scoreA: m.scoreA || 0, scoreB: m.scoreB || 0 }
    })
    setScores(initialScores)
  }, [matches])

  const rounds = matches.reduce((acc: any, m) => {
    if (!acc[m.round]) acc[m.round] = []
    acc[m.round].push(m)
    return acc
  }, {})

  const sortedRounds = Object.keys(rounds).sort((a, b) => Number(b) - Number(a))

  const handleScoreUpdate = async (matchId: string, newScoreA: number, newScoreB: number) => {
    setScores(prev => ({
      ...prev,
      [matchId]: { scoreA: newScoreA, scoreB: newScoreB }
    }))
    await updateScore(matchId, newScoreA, newScoreB)
  }

  return (
    <div className="flex gap-12 overflow-x-auto pb-8 min-w-max p-4">
      {sortedRounds.map((round) => (
        <div key={round} className="flex flex-col justify-around gap-8 w-64">
          <h3 className="text-center font-black text-slate-400 uppercase text-xs tracking-widest">
            {Number(round) === 1 ? 'Grande Final' : `Rodada ${round}`}
          </h3>
          {rounds[round].sort((a: any, b: any) => a.position - b.position).map((match: any) => (
            <div key={match.id} className="relative group">
              <div className={`bg-white border-2 rounded-2xl overflow-hidden shadow-sm transition-all ${match.status === 'FINISHED' ? 'border-emerald-500 shadow-emerald-100' : 'border-slate-200'}`}>
                
                {/* Time A */}
                <div className={`flex justify-between items-center px-4 py-3 border-b border-slate-50 ${match.winnerId === match.teamAId && match.winnerId ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                  <span className="text-sm font-bold truncate pr-2">
                    {match.teamA?.name || 'A definir'}
                  </span>
                  {isAdmin ? (
                    <input 
                      type="number" 
                      value={scores[match.id]?.scoreA ?? match.scoreA ?? 0}
                      onChange={(e) => {
                        const newScoreA = Number(e.target.value)
                        setScores(prev => ({
                          ...prev,
                          [match.id]: { 
                            scoreA: newScoreA, 
                            scoreB: prev[match.id]?.scoreB ?? match.scoreB ?? 0 
                          }
                        }))
                      }}
                      onBlur={(e) => {
                        const newScoreA = Number(e.target.value)
                        const currentScoreB = scores[match.id]?.scoreB ?? match.scoreB ?? 0
                        handleScoreUpdate(match.id, newScoreA, currentScoreB)
                      }}
                      className="w-10 text-center bg-slate-50 rounded font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="font-mono font-bold">{match.scoreA ?? 0}</span>
                  )}
                </div>

                {/* Time B */}
                <div className={`flex justify-between items-center px-4 py-3 ${match.winnerId === match.teamBId && match.winnerId ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                  <span className="text-sm font-bold truncate pr-2">
                    {match.teamB?.name || 'A definir'}
                  </span>
                  {isAdmin ? (
                    <input 
                      type="number" 
                      value={scores[match.id]?.scoreB ?? match.scoreB ?? 0}
                      onChange={(e) => {
                        const newScoreB = Number(e.target.value)
                        setScores(prev => ({
                          ...prev,
                          [match.id]: { 
                            scoreA: prev[match.id]?.scoreA ?? match.scoreA ?? 0,
                            scoreB: newScoreB 
                          }
                        }))
                      }}
                      onBlur={(e) => {
                        const newScoreB = Number(e.target.value)
                        const currentScoreA = scores[match.id]?.scoreA ?? match.scoreA ?? 0
                        handleScoreUpdate(match.id, currentScoreA, newScoreB)
                      }}
                      className="w-10 text-center bg-slate-50 rounded font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <span className="font-mono font-bold">{match.scoreB ?? 0}</span>
                  )}
                </div>
              </div>

              {match.status === 'FINISHED' && match.winnerId && (
                <div className="absolute -right-3 -top-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                  <Trophy size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}