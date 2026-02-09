'use client'

import { useState, useMemo } from 'react'
import { updateScore, generateFinalStage } from '@/app/actions'
import { CheckCircle, Edit3, Trophy } from 'lucide-react'

export function GroupStageView({ matches, teams, isAdmin, tournamentId }: any) {
  const groupA = teams.filter((t: any) => t.group === 'A')
  const groupB = teams.filter((t: any) => t.group === 'B')
  const matchesA = matches.filter((m: any) => m.group === 'A' && m.type === 'GROUP_STAGE')
  const matchesB = matches.filter((m: any) => m.group === 'B' && m.type === 'GROUP_STAGE')

  const calculateStandings = (grpMatches: any[], grpTeams: any[]) => {
    const std: Record<string, any> = {}
    grpTeams.forEach(t => std[t.id] = { id: t.id, name: t.name, points: 0, wins: 0, balance: 0 })
    grpMatches.forEach(m => {
        if (m.status === 'FINISHED' && m.winnerId) {
            std[m.winnerId].wins += 1
            const loserId = m.winnerId === m.teamAId ? m.teamBId : m.teamAId
            if (loserId && std[loserId]) {
                std[m.winnerId].balance += Math.abs((m.scoreA || 0) - (m.scoreB || 0))
                std[loserId].balance -= Math.abs((m.scoreA || 0) - (m.scoreB || 0))
            }
        }
    })
    return Object.values(std).sort((a: any, b: any) => {
        if (b.wins !== a.wins) return b.wins - a.wins
        const h2h = grpMatches.find(m => (m.teamAId === a.id && m.teamBId === b.id) || (m.teamAId === b.id && m.teamBId === a.id))
        if (h2h && h2h.status === 'FINISHED' && h2h.winnerId) return h2h.winnerId === a.id ? -1 : 1
        return b.balance - a.balance
    })
  }

  const standingsA = useMemo(() => calculateStandings(matchesA, groupA), [matchesA, groupA])
  const standingsB = useMemo(() => calculateStandings(matchesB, groupB), [matchesB, groupB])

  const [localScores, setLocalScores] = useState<Record<string, { scoreA: number, scoreB: number }>>({})
  const [editingMatches, setEditingMatches] = useState<Record<string, boolean>>({})

  const handleScoreChange = (id: string, key: 'scoreA' | 'scoreB', value: string) => {
    let num = parseInt(value) || 0
    // TRAVA: Mínimo 0, Máximo 6
    if (num > 7) num = 7
    if (num < 0) num = 0
    
    setLocalScores(prev => ({ 
        ...prev, 
        [id]: { ...prev[id], [key]: num } 
    }))
  }

  const handleConfirm = async (matchId: string) => {
    const s = localScores[matchId]
    const m = matches.find((match: any) => match.id === matchId)
    await updateScore(matchId, s?.scoreA ?? m.scoreA, s?.scoreB ?? m.scoreB)
    setEditingMatches(prev => ({ ...prev, [matchId]: false }))
  }

  const renderGroupContainer = (groupLetter: string, standings: any[], groupMatches: any[]) => (
    <div className="bg-slate-800 rounded-[2.5rem] p-8 border border-slate-700 h-fit shadow-2xl">
        <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="bg-indigo-600 px-4 py-1.5 rounded-xl text-sm tracking-widest">GRUPO {groupLetter}</span>
        </h3>
        <div className="mb-10 overflow-hidden rounded-2xl border border-slate-600">
            <table className="w-full text-sm text-left text-slate-300">
                <thead className="bg-slate-900 text-[10px] uppercase font-black text-slate-500 tracking-tighter">
                    <tr><th className="px-6 py-4">Pos</th><th className="px-6 py-4 w-full">Dupla</th><th className="px-6 py-4 text-center">V</th><th className="px-6 py-4 text-center">SG</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700 bg-slate-800/50">
                    {standings.map((team: any, index: number) => (
                        <tr key={team.id} className={index < 2 ? 'bg-indigo-500/5' : ''}>
                            <td className={`px-6 py-4 font-black ${index < 2 ? 'text-indigo-400' : 'text-slate-600'}`}>{index + 1}º</td>
                            <td className="px-6 py-4 font-bold text-white truncate max-w-[150px]">{team.name}</td>
                            <td className="px-6 py-4 text-center font-black">{team.wins}</td>
                            <td className="px-6 py-4 text-center text-xs font-mono">{team.balance > 0 ? `+${team.balance}` : team.balance}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="space-y-6">
            {groupMatches.map((match: any) => {
                const isFin = match.status === 'FINISHED'
                const isEd = editingMatches[match.id] || !isFin
                return (
                    <div key={match.id} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-700/50 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 text-center min-w-0">
                                <p className="text-lg font-black text-slate-100 mb-4 truncate">{match.teamA?.name}</p>
                                <input 
                                    type="number" 
                                    min="0"
                                    max="7"
                                    disabled={!isAdmin || (isFin && !isEd)} 
                                    className={`w-16 h-16 text-4xl text-center font-black rounded-2xl border-2 transition-all outline-none ${isFin && !isEd ? 'bg-slate-900 border-transparent text-emerald-400' : 'bg-slate-800 border-slate-600 text-white focus:border-indigo-500'}`} 
                                    value={localScores[match.id]?.scoreA ?? match.scoreA} 
                                    onChange={(e) => handleScoreChange(match.id, 'scoreA', e.target.value)} 
                                />
                            </div>
                            <div className="text-slate-700 font-black text-xl italic pt-12">VS</div>
                            <div className="flex-1 text-center min-w-0">
                                <p className="text-lg font-black text-slate-100 mb-4 truncate">{match.teamB?.name}</p>
                                <input 
                                    type="number" 
                                    min="0"
                                    max="7"
                                    disabled={!isAdmin || (isFin && !isEd)} 
                                    className={`w-16 h-16 text-4xl text-center font-black rounded-2xl border-2 transition-all outline-none ${isFin && !isEd ? 'bg-slate-900 border-transparent text-emerald-400' : 'bg-slate-800 border-slate-600 text-white focus:border-indigo-500'}`} 
                                    value={localScores[match.id]?.scoreB ?? match.scoreB} 
                                    onChange={(e) => handleScoreChange(match.id, 'scoreB', e.target.value)} 
                                />
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="mt-2">
                                {isFin && !isEd ? (
                                    <button onClick={() => setEditingMatches(prev => ({ ...prev, [match.id]: true }))} className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"><Edit3 size={14} /> Editar Resultado</button>
                                ) : (
                                    <button onClick={() => handleConfirm(match.id)} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 transition-all"><CheckCircle size={14} /> Confirmar Placar</button>
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
    <div className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full p-4">
            {renderGroupContainer('A', standingsA, matchesA)}
            {renderGroupContainer('B', standingsB, matchesB)}
        </div>
        {isAdmin && (
            <div className="flex justify-center pb-10">
                <button 
                    onClick={async () => { if(confirm("Deseja gerar as Semifinais Cruzadas?")) await generateFinalStage(tournamentId) }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all"
                >
                    <Trophy size={24} /> Iniciar Fase Final
                </button>
            </div>
        )}
    </div>
  )
}