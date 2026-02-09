'use client'

import { useState } from 'react'
import { createLeague } from '@/app/actions'
import { Plus, X, Trophy, Loader2 } from 'lucide-react'

export function CreateLeagueModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    await createLeague(formData)
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 cursor-pointer"
      >
        <Plus size={18} /> Criar Nova Liga
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Trophy className="text-indigo-600" size={20}/> Nova Liga
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form action={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Nome da Liga</label>
                    <input 
                        name="name" 
                        placeholder="Ex: Circuito Verão 2026" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        autoFocus
                        required
                    />
                </div>
                <button 
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-indigo-600 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                    {loading ? <Loader2 className="animate-spin"/> : 'Criar Liga'}
                </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}