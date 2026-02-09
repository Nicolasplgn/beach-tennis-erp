'use client'

import { useState } from 'react'
import { X, Save, User, Trophy } from 'lucide-react'
import { updatePlayer } from '@/app/actions'

interface Player {
  id: string
  name: string
  nickname: string | null
  level: string | null
  points?: number // Adicionado pontos para edição manual
}

interface EditPlayerModalProps {
  player: Player
  leagueId: string
  onClose: () => void
}

export default function EditPlayerModal({ player, leagueId, onClose }: EditPlayerModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
        await updatePlayer(player.id, leagueId, formData)
        setIsSubmitting(false)
        onClose()
    } catch (error) {
        console.error("Erro ao atualizar:", error)
        setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200" 
        onClick={(event) => event.stopPropagation()}
      >
        
        {/* Cabeçalho do Modal */}
        <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
                <User size={24} className="text-white"/>
            </div>
            <div>
                <h3 className="text-white font-black text-xl leading-none">Editar Atleta</h3>
                <p className="text-indigo-200 text-xs font-bold mt-1 uppercase tracking-widest">Informações Cadastrais</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-black/10 hover:bg-black/20 rounded-full text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulário de Edição */}
        <form action={handleSubmit} className="p-8 space-y-6">
          
          {/* Campo Nome */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Nome Completo do Atleta
            </label>
            <input 
              name="name" 
              type="text"
              defaultValue={player.name}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Campo Apelido */}
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Apelido
                </label>
                <input 
                  name="nickname" 
                  type="text"
                  defaultValue={player.nickname || ''}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all" 
                  placeholder="Como é conhecido"
                />
            </div>

            {/* Campo Categoria */}
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Categoria (Nível)
                </label>
                <select 
                  name="level" 
                  defaultValue={player.level || 'C'}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none"
                >
                    <option value="D">CAT. D (Iniciante)</option>
                    <option value="C">CAT. C (Intermediário)</option>
                    <option value="B">CAT. B (Avançado)</option>
                    <option value="A">CAT. A (Alta Performance)</option>
                    <option value="PRO">PROFISSIONAL</option>
                </select>
            </div>
          </div>

          {/* CAMPO DE PONTUAÇÃO MANUAL (RANKING) */}
          <div className="bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100">
            <div className="flex items-center gap-3 mb-3">
                <Trophy size={18} className="text-indigo-600" />
                <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    Pontos Totais no Ranking
                </label>
            </div>
            <input 
              name="points" 
              type="number"
              defaultValue={player.points || 0}
              className="w-full bg-white border-2 border-indigo-200 rounded-2xl px-5 py-4 text-2xl font-black text-indigo-700 outline-none focus:border-indigo-500 shadow-inner"
            />
            <p className="text-[9px] text-indigo-400 mt-3 leading-relaxed font-bold italic text-center">
                * Alterar este valor afetará a posição do atleta no Ranking Geral imediatamente.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all uppercase text-xs tracking-widest"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-2 bg-indigo-600 text-white py-4 px-10 rounded-2xl font-black hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-xl shadow-indigo-200 disabled:opacity-50 uppercase text-xs tracking-widest"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <><Save size={18}/> Salvar Alterações</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}