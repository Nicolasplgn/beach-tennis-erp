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
        <div className="flex-1 flex gap-2">
            <input name="name" defaultValue={player.name} className="w-1/2 text-xs font-bold bg-white px-2 py-1 rounded border border-indigo-200 outline-none" autoFocus />
            <input name="nickname" defaultValue={player.nickname || ''} placeholder="Apelido" className="w-1/4 text-[10px] bg-white px-2 py-1 rounded border border-indigo-200 outline-none" />
            <select name="level" defaultValue={player.level || 'D'} className="w-1/4 text-[10px] bg-white px-1 py-1 rounded border border-indigo-200 outline-none">
                <option value="D">D</option>
                <option value="C">C</option>
                <option value="B">B</option>
                <option value="A">A</option>
                <option value="PRO">PRO</option>
            </select>
        </div>
        <button type="submit" className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"><Check size={12} /></button>
        <button type="button" onClick={() => setIsEditing(false)} className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"><X size={12} /></button>
      </form>
    )
  }

  return (
    <div className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black border border-slate-200 ${player.level === 'PRO' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500'}`}>
                {player.level || 'C'}
            </div>
            <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-slate-900 truncate">{player.name}</span>
                {player.nickname && <span className="text-[9px] font-bold text-indigo-500">{player.nickname}</span>}
            </div>
        </div>
        
        {isAdmin && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"><Pencil size={12} /></button>
                <form action={deletePlayer.bind(null, player.id, leagueId)}>
                    <button className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"><Trash2 size={12} /></button>
                </form>
            </div>
        )}
    </div>
  )
}