'use client'

import { useState, useMemo } from 'react'
import { updateScore } from '@/app/actions'
import { CheckCircle, Edit3 } from 'lucide-react'

type Match = any
type Team = any

function calculateStandings(matches: Match[], teams: Team[]) {
  const standings: Record<string, { id: string, name: string, points: number, wins: number, balance: number, played: number }> = {}

  teams.forEach(team => {
    standings[team.id] = { id: team.id, name: team.name, points: 0, wins: 0, balance: 0, played: 0 }
  })

  matches.forEach(match => {
    if (match.status === 'FINISHED' && match.winnerId) {
        const winner = standings[match.winnerId]
        const loserId = match.winnerId === match.teamAId ? match.teamBId : match.teamAId
        const loser = standings[loserId]

        if (winner) {
            winner.points += 1
            winner.wins += 1
            winner.played += 1
            winner.balance += Math.abs((match.scoreA || 0) - (match.scoreB || 0))
        }
        if (loser) {
            loser.played += 1
            loser.balance -= Math.abs((match.scoreA || 0) - (match.scoreB || 0))
        }
    }
  })

  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const headToHead = matches.find(m => (m.teamAId === a.id && m.teamBId === b.id) || (m.teamAId === b.id && m.teamBId === a.id))
    if (headToHead && headToHead.status === 'FINISHED' && headToHead.winnerId) {
        if (headToHead.winnerId === a.id) return -1
        if (headToHead.winnerId === b.id) return 1
    }
    return b.balance - a.balance
  })
}

export function GroupStageView({ matches, teams, isAdmin }: { matches: Match[], teams: Team[], isAdmin: boolean }) {
  const groupA = teams.filter((t: Team) => t.group === 'A')
  const groupB = teams.filter((t: Team) => t.group === 'B')
  const matchesA = matches.filter((m: Match) => m.group === 'A')
  const matchesB = matches.filter((m: Match) => m.group === 'B')

  const standingsA = useMemo(() => calculateStandings(matchesA, groupA), [matchesA, groupA])
  const standingsB = useMemo(() => calculateStandings(matchesB, groupB), [matchesB, groupB])

  const [localScores, setLocalScores] = useState<Record<string, { scoreA: number, scoreB: number }>>({})
  const [editingMatches, setEditingMatches] = useState<Record<string, boolean>>({})

  const handleScoreChange = (id: string, key: 'scoreA' | 'scoreB', value: string) => {
    setLocalScores(prev => ({
        ...prev,
        [id]: { ...prev[id], [key]: Number(value) }
    }))
  }

  const handleConfirm = async (matchId: string) => {
    const scores = localScores[matchId]
    const currentMatch = matches.find(m => m.id === matchId)
    const finalA = scores?.scoreA !== undefined ? scores.scoreA : currentMatch.scoreA
    const finalB = scores?.scoreB !== undefined ? scores.scoreB : currentMatch.scoreB
    
    await updateScore(matchId, finalA, finalB)
    setEditingMatches(prev => ({ ...prev, [matchId]: false }))
  }

  const renderGroup = (name: string, standings: any[], groupMatches: Match[]) => (
    <div className="bg-slate-800 rounded-[2.5rem] p-8 border border-slate-700 h-fit shadow-2xl">
        <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="bg-indigo-600 px-4 py-1.5 rounded-xl text-sm tracking-[0.2em] uppercase">Grupo {name}</span>
        </h3>

        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-600">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-900 text-[10px] uppercase font-black text-slate-500 tracking-tighter">
                    <tr>
                        <th className="px-6 py-4">Pos</th>
                        <th className="px-6 py-4 w-full">Dupla</th>
                        <th className="px-6 py-4 text-center">V</th>
                        <th className="px-6 py-4 text-center">SG</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 bg-slate-800/50">
                    {standings.map((team, idx) => (
                        <tr key={team.id} className={idx < 2 ? 'bg-indigo-500/5' : ''}>
                            <td className={`px-6 py-4 font-black text-base ${idx < 2 ? 'text-indigo-400' : 'text-slate-600'}`}>{idx + 1}º</td>
                            <td className="px-6 py-4 font-black text-white text-sm truncate max-w-[150px]">{team.name}</td>
                            <td className="px-6 py-4 text-center font-black">{team.wins}</td>
                            <td className="px-6 py-4 text-center text-xs font-mono opacity-50">{team.balance > 0 ? `+${team.balance}` : team.balance}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="space-y-6">
            {groupMatches.map(match => {
                const isFinished = match.status === 'FINISHED'
                const isBeingEdited = editingMatches[match.id] || !isFinished

                return (
                    <div key={match.id} className="bg-slate-950/40 p-6 rounded-3xl border border-slate-700/50 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            
                            {/* TIME A - Ajustado para text-lg */}
                            <div className="flex-1 text-center min-w-0">
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Dupla A</p>
                                <p className="text-lg font-black text-slate-100 mb-4 truncate leading-tight">{match.teamA?.name}</p>
                                <input 
                                    type="number" 
                                    disabled={!isAdmin || (isFinished && !isBeingEdited)}
                                    className={`w-16 h-16 text-4xl text-center font-black rounded-2xl border-2 transition-all outline-none
                                        ${isFinished && !isBeingEdited ? 'bg-slate-900 border-transparent text-emerald-400' : 'bg-slate-800 border-slate-600 text-white focus:border-indigo-500'}
                                    `}
                                    defaultValue={match.scoreA}
                                    onChange={(event) => handleScoreChange(match.id, 'scoreA', event.target.value)}
                                />
                            </div>

                            <div className="text-slate-700 font-black text-xl italic pt-12">VS</div>

                            {/* TIME B - Ajustado para text-lg */}
                            <div className="flex-1 text-center min-w-0">
                                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Dupla B</p>
                                <p className="text-lg font-black text-slate-100 mb-4 truncate leading-tight">{match.teamB?.name}</p>
                                <input 
                                    type="number" 
                                    disabled={!isAdmin || (isFinished && !isBeingEdited)}
                                    className={`w-16 h-16 text-4xl text-center font-black rounded-2xl border-2 transition-all outline-none
                                        ${isFinished && !isBeingEdited ? 'bg-slate-900 border-transparent text-emerald-400' : 'bg-slate-800 border-slate-600 text-white focus:border-indigo-500'}
                                    `}
                                    defaultValue={match.scoreB}
                                    onChange={(event) => handleScoreChange(match.id, 'scoreB', event.target.value)}
                                />
                            </div>
                        </div>

                        {isAdmin && (
                            <div className="mt-2">
                                {isFinished && !isBeingEdited ? (
                                    <button 
                                        onClick={() => setEditingMatches(prev => ({ ...prev, [match.id]: true }))}
                                        className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Edit3 size={14} /> Editar Resultado
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleConfirm(match.id)}
                                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                    >
                                        <CheckCircle size={14} /> Confirmar Placar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full p-4">
        {renderGroup('A', standingsA, matchesA)}
        {renderGroup('B', standingsB, matchesB)}
    </div>
  )
}