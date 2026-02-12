'use client'

import { useState } from 'react'
import { Plus, X, Save, User } from 'lucide-react'
import { addPlayer } from '@/app/actions'

export function AddPlayerModal({ leagueId }: { leagueId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    await addPlayer(leagueId, formData)
    setIsSubmitting(false)
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-lg shadow-slate-200 cursor-pointer"
      >
        <Plus size={16} />
        <span>Cadastrar Atleta</span>
      </button>

      {isOpen && (
        // --- CORREÇÃO AQUI: Garante a Centralização Vertical e Horizontal ---
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200 border border-slate-200">
            
            <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
              <h3 className="text-white font-black flex items-center gap-3 uppercase italic tracking-wider">
                <User size={20} className="text-indigo-400"/> Novo Competidor
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-white/10 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form action={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                <input 
                  name="name" 
                  placeholder="Ex: João da Silva" 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                  autoFocus
                  required 
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Apelido</label>
                    <input 
                      name="nickname" 
                      placeholder="Ex: Beto" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all" 
                    />
                </div>
                <div className="w-1/3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoria</label>
                    <select 
                      name="level" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-3 py-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all cursor-pointer"
                    >
                        <option value="D">Cat. D</option>
                        <option value="C">Cat. C</option>
                        <option value="B">Cat. B</option>
                        <option value="A">Cat. A</option>
                        <option value="PRO">PRO</option>
                    </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 border-2 border-transparent hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-xl shadow-indigo-200 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? 'Salvando...' : <><Save size={18}/> Salvar Atleta</>}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}