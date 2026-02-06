'use client'

import { Users, Dices, Trophy, CheckCircle2 } from 'lucide-react'

export default function TournamentSteps({ playersCount, teamsCount, matchesCount }: any) {
  const steps = [
    { id: 1, label: 'Inscrição', icon: Users, done: playersCount >= 4 },
    { id: 2, label: 'Sorteio', icon: Dices, done: teamsCount >= 2 },
    { id: 3, label: 'Torneio', icon: Trophy, done: matchesCount > 0 },
  ]

  return (
    <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${step.done ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {step.done ? <CheckCircle2 size={24} /> : <step.icon size={24} />}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${step.done ? 'text-green-600' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`h-[2px] w-full flex-1 mx-4 ${steps[idx + 1].done ? 'bg-green-500' : 'bg-slate-100'}`} />
          )}
        </div>
      ))}
    </div>
  )
}