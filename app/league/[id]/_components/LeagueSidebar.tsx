'use client'

import { useState } from 'react'
import { Users, Trophy, Search, Medal, Pencil, Trash2 } from 'lucide-react'
// CORREÇÃO AQUI: Adicionado '/app' no caminho dos imports
import { AddPlayerModal } from '@/app/components/AddPlayerModal'
import EditPlayerModal from '@/app/components/EditPlayerModal'
import { deletePlayer } from '@/app/actions'

type Player = {
  id: string
  name: string
  nickname: string | null
  level: string | null
  points: number
  matches: number 
  wins: number
}

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const avatarColors = [
    'bg-red-100 text-red-600',
    'bg-orange-100 text-orange-600',
    'bg-amber-100 text-amber-600',
    'bg-green-100 text-green-600',
    'bg-emerald-100 text-emerald-600',
    'bg-teal-100 text-teal-600',
    'bg-cyan-100 text-cyan-600',
    'bg-blue-100 text-blue-600',
    'bg-indigo-100 text-indigo-600',
    'bg-violet-100 text-violet-600',
    'bg-purple-100 text-purple-600',
    'bg-fuchsia-100 text-fuchsia-600',
    'bg-pink-100 text-pink-600',
    'bg-rose-100 text-rose-600',
]

export function LeagueSidebar({ players, leagueId }: { players: Player[], leagueId: string }) {
  const hasRanking = players.some(p => p.points > 0)
  const [activeTab, setActiveTab] = useState<'players' | 'ranking'>(hasRanking ? 'ranking' : 'players')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const playersAlphabetical = [...players].sort((a, b) => a.name.localeCompare(b.name))
  const playersRanked = [...players].sort((a, b) => b.points - a.points)

  const filteredPlayers = (activeTab === 'players' ? playersAlphabetical : playersRanked).filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.nickname && p.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = async (playerId: string) => {
    if (confirm("Tem certeza que deseja excluir este atleta? Isso removerá o histórico dele.")) {
        await deletePlayer(playerId, leagueId)
    }
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden h-fit flex flex-col max-h-[850px]">
      
      {/* HEADER + ABAS */}
      <div className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex p-1 gap-1 m-2 bg-slate-100 rounded-xl">
            <button 
                onClick={() => setActiveTab('players')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'players' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Users size={14}/> Atletas
            </button>

            <button 
                onClick={() => setActiveTab('ranking')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'ranking' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <Trophy size={14}/> Ranking
            </button>
        </div>

        <div className="px-4 pb-4 pt-2 flex gap-2">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder="Buscar atleta..." 
                    className="w-full bg-slate-50 group-focus-within:bg-white border border-slate-200 pl-10 pr-3 py-3 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {/* Componente Modal de Adicionar */}
            <AddPlayerModal leagueId={leagueId} />
        </div>
      </div>

      {/* CONTEÚDO DA LISTA */}
      <div className="overflow-y-auto p-2 custom-scrollbar flex-1 bg-white">
        
        {/* LISTA DE ATLETAS (Com Edição) */}
        {activeTab === 'players' && (
            <div className="space-y-1">
                {filteredPlayers.length === 0 && <div className="text-center py-8 text-slate-400 text-sm font-medium">Nenhum atleta encontrado</div>}
                
                {filteredPlayers.map((player) => {
                    const colorClass = avatarColors[player.name.length % avatarColors.length]
                    
                    return (
                        <div key={player.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${colorClass}`}>
                                {getInitials(player.name)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate pr-16">{player.name}</p>
                                <div className="flex gap-2 text-[10px] font-bold uppercase text-slate-400">
                                    <span className="bg-slate-100 px-1.5 rounded text-slate-500 border border-slate-200">Cat. {player.level || '-'}</span>
                                    {player.nickname && <span className="text-indigo-500 truncate">{player.nickname}</span>}
                                </div>
                            </div>

                            <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-slate-100">
                                <button onClick={() => setEditingPlayer(player)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"><Pencil size={14} /></button>
                                <button onClick={() => handleDelete(player.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}

        {/* LISTA DE RANKING */}
        {activeTab === 'ranking' && (
            <div className="space-y-2 pb-4">
               {filteredPlayers.map((player, index) => {
                    const isTop1 = index === 0
                    const isTop2 = index === 1
                    const isTop3 = index === 2
                    
                    let medalColor = 'text-slate-300'
                    let borderClass = 'border-transparent hover:border-slate-100'

                    if (isTop1) { medalColor = 'text-yellow-500'; borderClass = 'border-yellow-200 bg-yellow-50/50' } 
                    else if (isTop2) { medalColor = 'text-slate-400'; borderClass = 'border-slate-300 bg-slate-50/50' } 
                    else if (isTop3) { medalColor = 'text-amber-700'; borderClass = 'border-amber-200 bg-amber-50/50' }

                    return (
                        <div key={player.id} className={`flex items-center gap-4 p-3 rounded-2xl border ${borderClass} transition-all`}>
                            <div className="flex flex-col items-center justify-center w-8">
                                {index < 3 ? <Medal size={24} className={medalColor} /> : <span className="text-sm font-black text-slate-400">#{index + 1}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-black truncate ${isTop1 ? 'text-slate-900 text-base' : 'text-slate-700'}`}>{player.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{player.matches} Jogos • {player.wins} Vitórias</p>
                            </div>
                            <div className="text-right pl-2">
                                <span className={`block font-black leading-none ${isTop1 ? 'text-2xl text-yellow-600' : 'text-lg text-indigo-600'}`}>{player.points}</span>
                                <span className="text-[9px] font-bold text-slate-300 uppercase">Pts</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </div>

      {editingPlayer && (
        <EditPlayerModal 
            player={editingPlayer} 
            leagueId={leagueId} 
            onClose={() => setEditingPlayer(null)} 
        />
      )}
    </div>
  )
}