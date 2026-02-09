'use client'

import { useState, useEffect } from 'react'
import { X, Save, User, Trophy } from 'lucide-react' // CORREÇÃO 1: Importado Trophy
import { updatePlayer } from '@/app/actions'

interface Player {
  id: string
  name: string
  nickname: string | null
  level: string | null
  points: number // CORREÇÃO 2: Adicionado points na interface
}

interface EditPlayerModalProps {
  player: Player
  leagueId: string
  onClose: () => void
}

export default function EditPlayerModal({ player, leagueId, onClose }: EditPlayerModalProps) {
  const [name, setName] = useState(player.name)
  const [nickname, setNickname] = useState(player.nickname || '')
  const [level, setLevel] = useState(player.level || 'C')
  const [points, setPoints] = useState(player.points) // Estado para os pontos
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('nickname', nickname)
      formData.append('level', level)
      formData.append('points', points.toString()) // Enviando os pontos manuais

      await updatePlayer(player.id, leagueId, formData)
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar atleta:', error)
      alert('Erro ao atualizar atleta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-4xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-black text-white uppercase italic">Editar Atleta</h2>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Ajuste manual de dados e ranking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 bg-black/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
                Nome Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Apelido */}
                <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
                    Apelido
                </label>
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                />
                </div>

                {/* Nível */}
                <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">
                    Categoria
                </label>
                <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                >
                    <option value="D">CAT. D</option>
                    <option value="C">CAT. C</option>
                    <option value="B">CAT. B</option>
                    <option value="A">CAT. A</option>
                    <option value="PRO">PRO</option>
                </select>
                </div>
            </div>

            {/* PONTOS MANUAIS */}
            <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100">
                <label className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase mb-3 ml-1">
                    <Trophy size={14}/> Pontos Manuais no Ranking
                </label>
                <input 
                    type="number" 
                    value={points} 
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full bg-white border-2 border-indigo-200 rounded-2xl px-5 py-4 text-2xl font-black text-indigo-700 outline-none focus:border-indigo-500 shadow-inner" 
                />
                <p className="text-[9px] text-indigo-400 mt-2 font-bold italic text-center uppercase">
                    * Digite o valor exato que o atleta deve ter no ranking
                </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 border-2 border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-[2] py-4 px-8 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}