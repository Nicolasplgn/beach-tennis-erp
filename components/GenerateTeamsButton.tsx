'use client'

import { generateTeams } from '@/app/actions'
import { Dices, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'

interface Props {
  leagueId: string
  hasExistingTeams: boolean
  playersCount: number
}

export default function GenerateTeamsButton({ leagueId, hasExistingTeams, playersCount }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (playersCount < 4) {
      alert('São necessários pelo menos 4 atletas para formar as duplas.')
      return
    }
    if (hasExistingTeams) {
      if (!confirm('Isso irá resetar as duplas e partidas atuais. Deseja continuar?')) {
        return
      }
    }
    startTransition(() => {
      generateTeams(leagueId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending || playersCount < 4}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 transition-all"
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Dices className="w-5 h-5" />
      )}
      {hasExistingTeams ? 'Sortear Novamente' : 'Formar Duplas'}
    </button>
  )
}