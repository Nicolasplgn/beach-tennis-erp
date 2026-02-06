'use client'

import { useState } from 'react'
import { Plus, X, Save, User } from 'lucide-react'
import { addPlayer } from '@/app/actions' // Importamos a action existente

export function AddPlayerModal({ leagueId }: { leagueId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Função para fechar o modal após o submit (o revalidatePath cuidará de atualizar a lista)
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    await addPlayer(leagueId, formData)
    setIsSubmitting(false)
    setIsOpen(false)
  }

  return (
    <>
      {/* Botão Quadrado Pequeno */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-900 hover:bg-slate-800 text-white w-9 h-9 flex items-center justify-center rounded-xl transition-colors shadow-lg shadow-slate-200"
        title="Novo Atleta"
      >
        <Plus size={18} />
      </button>

      {/* O MODAL (JANELA) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            
            {/* Header do Modal */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <User size={20} className="text-indigo-400"/> Cadastrar Atleta
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Formulário */}
            <form action={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                <input 
                  name="name" 
                  placeholder="Ex: João da Silva" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  autoFocus
                  required 
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apelido (Opcional)</label>
                    <input 
                      name="nickname" 
                      placeholder="Ex: Beto" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500" 
                    />
                </div>
                <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                    <select 
                      name="level" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-sm font-semibold outline-none focus:border-indigo-500"
                    >
                        <option value="D">Cat. D</option>
                        <option value="C">Cat. C</option>
                        <option value="B">Cat. B</option>
                        <option value="A">Cat. A</option>
                        <option value="PRO">PRO</option>
                    </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex justify-center items-center gap-2"
                >
                  {isSubmitting ? 'Salvando...' : <><Save size={18}/> Salvar</>}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}