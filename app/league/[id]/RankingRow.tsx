'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { deletePlayer } from '@/app/actions'
import EditPlayerModal from '@/app/components/EditPlayerModal'

export function RankingRow({ player, index, leagueId }: any) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleDelete = async () => {
    if (confirm("Excluir este atleta permanentemente?")) {
      await deletePlayer(player.id, leagueId)
    }
  }

  return (
    <>
      <div className="group flex justify-between items-center p-3 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all relative">
          <div className="flex items-center gap-4">
              
              {/* POSIÇÃO */}
              <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black italic border-2 ${
                  index === 0 ? 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-md' : 
                  index === 1 ? 'bg-slate-200 border-slate-300 text-slate-600' : 
                  index === 2 ? 'bg-amber-100 border-amber-200 text-amber-800' : 
                  'bg-white border-slate-100 text-slate-300'
              }`}>
                  {index + 1}º
              </div>
              
              {/* NOME E CATEGORIA */}
              <div>
                  <p className="text-sm font-black text-slate-800 uppercase group-hover:text-indigo-600 transition-colors">{player.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">CAT. {player.level}</span>
                    {player.nickname && <span className="text-[9px] font-bold text-indigo-400 italic">"{player.nickname}"</span>}
                  </div>
              </div>
          </div>
          
          <div className="flex items-center gap-4">
              
              {/* --- PONTOS (VISUAL CORRIGIDO) --- */}
              <div className="text-right">
                  <span className="block font-black text-indigo-600 text-lg leading-none">{player.points}</span>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">PONTOS</span>
              </div>
              {/* ---------------------------------- */}
              
              {/* BOTÕES DE AÇÃO */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => setIsEditOpen(true)}
                    className="p-2.5 bg-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                      <Pencil size={14}/>
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="p-2.5 bg-slate-100 text-slate-400 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                      <Trash2 size={14}/>
                  </button>
              </div>
          </div>
      </div>

      {isEditOpen && (
          <EditPlayerModal 
            player={player} 
            leagueId={leagueId} 
            onClose={() => setIsEditOpen(false)} 
          />
      )}
    </>
  )
}