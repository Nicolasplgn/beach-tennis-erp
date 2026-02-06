import { Users, Dices, Layers, PlayCircle, CheckCircle2 } from 'lucide-react'

export function TournamentSteps({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 1, label: 'Inscrição', icon: Users },
    { id: 2, label: 'Sorteio', icon: Dices },
    { id: 3, label: 'Chaveamento', icon: Layers },
    { id: 4, label: 'Jogos', icon: PlayCircle }
  ]

  return (
    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto">
      {steps.map((s) => {
        const isActive = currentStep >= s.id
        const isCompleted = currentStep > s.id
        return (
          <div 
            key={s.id} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
              ${isActive ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400 opacity-50'}
            `}
          >
            <s.icon size={14} />
            <span className="hidden md:inline">{s.label}</span>
            {isCompleted && <CheckCircle2 size={12} className="text-emerald-500"/>}
          </div>
        )
      })}
    </div>
  )
}