'use client'

import { createLeague } from "@/app/actions"
import { Calendar, Trophy, Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button 
      disabled={pending}
      className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 cursor-pointer flex items-center justify-center"
    >
      {pending ? <Loader2 className="animate-spin" size={20} /> : <Trophy size={20} />}
    </button>
  )
}

export function CreateLeagueForm() {
  return (
    <form action={createLeague} className="flex gap-2 w-full md:w-auto items-end">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 w-full">
            <div className="md:col-span-2 relative">
                <input 
                    name="name" 
                    placeholder="Nome do Torneio" 
                    className="w-full pl-4 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400" 
                    required 
                />
            </div>
            
            <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
                    <Calendar size={16} />
                </div>
                <input 
                    name="startDate" 
                    type="date"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" 
                    required
                />
            </div>

            <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400 pointer-events-none">
                    <Calendar size={16} />
                </div>
                <input 
                    name="endDate" 
                    type="date"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500" 
                />
            </div>
        </div>
        
        <SubmitButton />
    </form>
  )
}