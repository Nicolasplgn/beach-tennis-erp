'use client'

import { Lock } from 'lucide-react'
import { finishTournament } from '@/app/actions'

export function FinishTournamentButton({ tournamentId }: { tournamentId: string }) {
  
  const handleFinish = async () => {
    // Agora o confirm() funciona porque estamos num Client Component
    if (window.confirm("ATENÇÃO: Deseja realmente finalizar o torneio agora? Isso vai fechar os jogos e mostrar o pódio.")) {
      await finishTournament(tournamentId)
    }
  }

  return (
    <button 
        onClick={handleFinish}
        className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all cursor-pointer shadow-lg shadow-red-200"
    >
        <Lock size={18}/> ENCERRAR TORNEIO
    </button>
  )
}