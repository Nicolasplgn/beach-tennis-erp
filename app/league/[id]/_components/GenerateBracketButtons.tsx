'use client'

import { generateBracket } from "@/app/actions"
import { PlayCircle, Grid } from "lucide-react"

export function GenerateBracketButtons({ leagueId, teamCount }: { leagueId: string, teamCount: number }) {
  const allowGroups = teamCount === 8

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OPÇÃO 1: MATA-MATA (Padrão) */}
        <button 
            onClick={() => generateBracket(leagueId, 'KNOCKOUT')}
            className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
        >
            <PlayCircle size={32} className="text-indigo-600 group-hover:scale-110 transition-transform"/>
            <div className="text-center">
                <span className="block font-black text-slate-900">Mata-Mata Direto</span>
                <span className="text-xs text-slate-500 font-medium">Oitavas, Quartas, Semis...</span>
            </div>
        </button>

        {/* OPÇÃO 2: GRUPOS (Condicional) */}
        <button 
            onClick={() => generateBracket(leagueId, 'GROUPS')}
            disabled={!allowGroups}
            className={`flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 transition-all relative overflow-hidden
                ${allowGroups 
                    ? 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer group' 
                    : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'}
            `}
        >
            {!allowGroups && (
                <div className="absolute top-2 right-2 bg-slate-200 text-slate-500 text-[9px] px-2 py-1 rounded font-bold">
                    Requer 8 duplas
                </div>
            )}
            <Grid size={32} className={`${allowGroups ? 'text-emerald-600 group-hover:scale-110' : 'text-slate-400'} transition-transform`}/>
            <div className="text-center">
                <span className={`block font-black ${allowGroups ? 'text-slate-900' : 'text-slate-400'}`}>Fase de Grupos</span>
                <span className="text-xs text-slate-500 font-medium">2 Grupos de 4 + Semis Cruzadas</span>
            </div>
        </button>
    </div>
  )
}