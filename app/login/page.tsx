import { loginAction } from "../actions"
import { Trophy, Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      
      {/* BACKGROUND COM EFEITOS DE LUZ */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        
        {/* CARD DE LOGIN (GLASSMORPHISM) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-950/50">
          
          {/* Logo e Título */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Trophy size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              BEACH<span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-violet-400">PRO</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Faça login para gerenciar sua liga</p>
          </div>

          {/* Formulário */}
          <form action={loginAction} className="space-y-5">
            
            {/* Input Email */}
            <div className="group">
              <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 ml-4">Email Corporativo</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:bg-slate-900/80 transition-all" 
                  placeholder="admin@beachpro.com" 
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="group">
              <label className="block text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2 ml-4">Senha de Acesso</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  name="password" 
                  type="password" 
                  required 
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:bg-slate-900/80 transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {/* Botão Entrar */}
            <button 
              type="submit" 
              className="w-full bg-white text-indigo-950 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-50 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-white/10 mt-4 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Acessar Painel <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              Sistema exclusivo para organizadores.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}