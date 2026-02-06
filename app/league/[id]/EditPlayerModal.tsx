// app/components/EditPlayerModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, Save, User } from 'lucide-react'
import { updatePlayer } from '@/app/actions'

interface Player {
  id: string
  name: string
  nickname: string | null
  level: string
}

interface EditPlayerModalProps {
  player: Player
  leagueId: string
  onClose: () => void
}

export default function EditPlayerModal({ player, leagueId, onClose }: EditPlayerModalProps) {
  const [name, setName] = useState(player.name)
  const [nickname, setNickname] = useState(player.nickname || '')
  const [level, setLevel] = useState(player.level)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Bloquear scroll do body quando modal está aberto
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Editar Atleta</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ex: João Silva"
                required
              />
            </div>

            {/* Apelido */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-semibold text-gray-700 mb-2">
                Apelido
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Ex: Joãozinho"
              />
            </div>

            {/* Nível */}
            <div>
              <label htmlFor="level" className="block text-sm font-semibold text-gray-700 mb-2">
                Nível Técnico
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
              >
                <option value="BEGINNER">Iniciante</option>
                <option value="INTERMEDIATE">Intermediário</option>
                <option value="ADVANCED">Avançado</option>
                <option value="PRO">Profissional</option>
              </select>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}