import { loginAction } from "../actions"
import { Trophy } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-10 border border-slate-100">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white mb-4 shadow-lg shadow-indigo-100">
            <Trophy size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo ao ERP</h1>
          <p className="text-slate-500 text-sm">Organize seus torneios profissionalmente</p>
        </div>

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Email</label>
            <input name="email" type="email" required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="exemplo@email.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Senha</label>
            <input name="password" type="password" required className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-6">
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  )
}