'use client'

import { useState, useMemo } from 'react'
import { updateScore } from '@/app/actions'
import { CheckCircle, Edit3, Trophy, PlayCircle } from 'lucide-react'

export function GroupStageView({ matches, teams, isAdmin, tournamentId }: any) {
  // Filtra times por grupo
  const groupA = teams.filter((t: any) => t.group === 'A')
  const groupB = teams.filter((t: any) => t.group === 'B')
  
  // Filtra partidas por grupo
  const matchesA = matches.filter((m: any) => m.group === 'A' && m.type === 'GROUP_STAGE')
  const matchesB = matches.filter((m: any) => m.group === 'B' && m.type === 'GROUP_STAGE')

  /**
   * Lógica de Classificação (Tabela)
   * Critérios: Vitórias > Saldo de Games > Confronto Direto (Simplificado aqui)
   */
  const calculateStandings = (grpMatches: any[], grpTeams: any[]) => {
    const std: Record<string, any> = {}
    grpTeams.forEach(t => std[t.id] = { id: t.id, name: t.name, points: 0, wins: 0, balance: 0 })
    
    grpMatches.forEach(m => {
        if (m.status === 'FINISHED' && m.winnerId) {
            std[m.winnerId].wins += 1
            const loserId = m.winnerId === m.teamAId ? m.teamBId : m.teamAId
            if (loserId && std[loserId]) {
                const diff = Math.abs((m.scoreA || 0) - (m.scoreB || 0))
                std[m.winnerId].balance += diff
                std[loserId].balance -= diff
            }
        }
    })
    
    return Object.values(std).sort((a: any, b: any) => {
        if (b.wins !== a.wins) return b.wins - a.wins
        return b.balance - a.balance
    })
  }

  const standingsA = useMemo(() => calculateStandings(matchesA, groupA), [matchesA, groupA])
  const standingsB = useMemo(() => calculateStandings(matchesB, groupB), [matchesB, groupB])

  // Estados locais para edição de placar
  const [localScores, setLocalScores] = useState<Record<string, { scoreA: number, scoreB: number }>>({})
  const [editingMatches, setEditingMatches] = useState<Record<string, boolean>>({})

  // Atualiza o estado local do input (com trava de 0 a 7)
  const handleScoreChange = (id: string, key: 'scoreA' | 'scoreB', value: string) => {
    let num = parseInt(value)
    if (isNaN(num)) num = 0
    if (num > 7) num = 7
    if (num < 0) num = 0
    setLocalScores(prev => ({ ...prev, [id]: { ...prev[id], [key]: num } }))
  }

  // Salva no banco de dados
  const handleConfirm = async (matchId: string) => {
    const s = localScores[matchId]
    const m = matches.find((match: any) => match.id === matchId)
    await updateScore(matchId, s?.scoreA ?? m.scoreA, s?.scoreB ?? m.scoreB)
    setEditingMatches(prev => ({ ...prev, [matchId]: false }))
  }

  /**
   * Componente interno para renderizar a tabela e a lista de jogos
   * AQUI ESTÁ A LÓGICA DE ORDENAÇÃO (Jogos Pendentes Primeiro)
   */
  const renderGroupContainer = (groupLetter: string, standings: any[], groupMatches: any[]) => {
    
    // ORDENAÇÃO: Jogos PENDENTES no topo, FINALIZADOS no final
    const sortedMatches = [...groupMatches].sort((a, b) => {
        if (a.status === 'FINISHED' && b.status !== 'FINISHED') return 1
        if (a.status !== 'FINISHED' && b.status === 'FINISHED') return -1
        return a.position - b.position
    })

    return (
      <div className="flex flex-col gap-6">
          {/* TABELA DE CLASSIFICAÇÃO (Visual Compacto) */}
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
              <div className="bg-indigo-600 px-6 py-3 flex justify-between items-center">
                  <h3 className="font-black text-white text-lg italic tracking-tighter">GRUPO {groupLetter}</h3>
                  <Trophy size={16} className="text-indigo-200" />
              </div>
              <table className="w-full text-sm text-left text-slate-300">
                  <thead className="bg-slate-900/50 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                      <tr><th className="px-4 py-3">Pos</th><th className="px-4 py-3 w-full">Dupla</th><th className="px-4 py-3 text-center">V</th><th className="px-4 py-3 text-center">SG</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                      {standings.map((team: any, index: number) => (
                          <tr key={team.id} className={index < 2 ? 'bg-indigo-500/10' : ''}>
                              <td className={`px-4 py-3 font-black ${index < 2 ? 'text-indigo-400' : 'text-slate-600'}`}>{index + 1}º</td>
                              <td className="px-4 py-3 font-bold text-white truncate max-w-[120px]">{team.name}</td>
                              <td className="px-4 py-3 text-center font-black">{team.wins}</td>
                              <td className="px-4 py-3 text-center text-xs font-mono opacity-70">{team.balance > 0 ? `+${team.balance}` : team.balance}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* LISTA DE JOGOS (Cards Estilo Ticket) */}
          <div className="space-y-3">
              {sortedMatches.map((match: any) => {
                  const isFin = match.status === 'FINISHED'
                  const isEd = editingMatches[match.id] || !isFin
                  
                  return (
                      <div key={match.id} className={`
                          relative overflow-hidden rounded-2xl border-2 transition-all duration-300
                          ${isFin ? 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100' : 'bg-slate-800 border-indigo-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]'}
                      `}>
                          <div className="flex items-center">
                              {/* Lado Esquerdo: Info do Jogo */}
                              <div className="flex-1 p-4 flex flex-col gap-3">
                                  {/* Time A */}
                                  <div className="flex justify-between items-center">
                                      <span className={`text-xs font-bold truncate max-w-[120px] ${match.winnerId === match.teamAId ? 'text-emerald-400' : 'text-slate-200'}`}>{match.teamA?.name}</span>
                                      <input 
                                          type="number" min="0" max="7"
                                          disabled={!isAdmin || (isFin && !isEd)} 
                                          className={`w-8 h-8 text-center bg-slate-950 rounded border border-slate-700 font-bold text-white focus:border-indigo-500 outline-none transition-all ${isFin ? 'border-transparent' : ''}`}
                                          value={localScores[match.id]?.scoreA ?? match.scoreA} 
                                          onChange={(e) => handleScoreChange(match.id, 'scoreA', e.target.value)} 
                                      />
                                  </div>
                                  
                                  {/* Divisor VS */}
                                  <div className="h-px bg-slate-700/50 w-full relative">
                                      <span className="absolute left-0 -top-1.5 text-[8px] font-black text-slate-600 bg-slate-800 pr-2">VS</span>
                                  </div>

                                  {/* Time B */}
                                  <div className="flex justify-between items-center">
                                      <span className={`text-xs font-bold truncate max-w-[120px] ${match.winnerId === match.teamBId ? 'text-emerald-400' : 'text-slate-200'}`}>{match.teamB?.name}</span>
                                      <input 
                                          type="number" min="0" max="7"
                                          disabled={!isAdmin || (isFin && !isEd)} 
                                          className={`w-8 h-8 text-center bg-slate-950 rounded border border-slate-700 font-bold text-white focus:border-indigo-500 outline-none transition-all ${isFin ? 'border-transparent' : ''}`}
                                          value={localScores[match.id]?.scoreB ?? match.scoreB} 
                                          onChange={(e) => handleScoreChange(match.id, 'scoreB', e.target.value)} 
                                      />
                                  </div>
                              </div>

                              {/* Lado Direito: Botão de Ação */}
                              {isAdmin && (
                                  <div className="w-12 border-l border-slate-700 flex items-center justify-center bg-slate-900/50 h-full min-h-[100px]">
                                      {isFin && !isEd ? (
                                          <button onClick={() => setEditingMatches(prev => ({ ...prev, [match.id]: true }))} className="text-slate-500 hover:text-white transition-colors" title="Editar">
                                              <Edit3 size={16} />
                                          </button>
                                      ) : (
                                          <button onClick={() => handleConfirm(match.id)} className="text-indigo-500 hover:text-emerald-400 transition-colors" title="Salvar">
                                              <CheckCircle size={20} />
                                          </button>
                                      )}
                                  </div>
                              )}
                          </div>
                          
                          {/* Faixa lateral indicando status */}
                          <div className={`absolute top-0 left-0 bottom-0 w-1 ${isFin ? 'bg-slate-700' : 'bg-indigo-500'}`}></div>
                      </div>
                  )
              })}
          </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {renderGroupContainer('A', standingsA, matchesA)}
        {renderGroupContainer('B', standingsB, matchesB)}
    </div>
  )
}