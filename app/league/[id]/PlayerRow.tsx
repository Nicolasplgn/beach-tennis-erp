'use client'

import { updatePlayer, deletePlayer } from "@/app/actions"
import { Pencil, Check, X, Trash2 } from "lucide-react"
import { useState } from "react"

export function PlayerRow({ player, leagueId, isAdmin }: { player: any, leagueId: string, isAdmin: boolean }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <form 
        action={async (formData) => {
            await updatePlayer(player.id, leagueId, formData)
            setIsEditing(false)
        }}
        className="flex items-center gap-2 p-2 bg-indigo-50 rounded-xl border border-indigo-100 animate-in fade-in"
      >
        <div className="flex-1 space-y-1">
            <input name="name" defaultValue={player.name} className="w-full text-xs font-bold bg-white px-2 py-1 rounded border border-indigo-200 outline-none" autoFocus />
            <div className="flex gap-1">
                <input name="nickname" defaultValue={player.nickname || ''} placeholder="Apelido" className="w-1/2 text-[10px] bg-white px-2 py-1 rounded border border-indigo-200 outline-none" />
                <select name="level" defaultValue={player.level || 'C'} className="w-1/2 text-[10px] bg-white px-1 py-1 rounded border border-indigo-200 outline-none">
                    <option value="C">C</option>
                    <option value="B">B</option>
                    <option value="A">A</option>
                    <option value="PRO">PRO</option>
                </select>
            </div>
        </div>
        <div className="flex flex-col gap-1">
            <button type="submit" className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                <Check size={12} />
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                <X size={12} />
            </button>
        </div>
      </form>
    )
  }

  return (
    <div className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className={`h-8 w-8 min-w-[2rem] rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm
                ${player.level === 'PRO' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}
            `}>
                {player.level || 'C'}
            </div>
            <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 truncate">{player.name}</span>
                {player.nickname && <span className="text-[10px] font-bold text-indigo-500">{player.nickname}</span>}
            </div>
        </div>
        
        {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <Pencil size={14} />
                </button>
                <form action={deletePlayer.bind(null, player.id, leagueId)}>
                    <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={14} />
                    </button>
                </form>
            </div>
        )}
    </div>
  )
}