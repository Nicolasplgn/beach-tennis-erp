import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Trophy } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beach Tennis Pro ERP",
  description: "Gestão profissional de campeonatos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Navbar Profissional */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 p-2 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  BeachTennis<span className="text-slate-500">Manager</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                  AD
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Conteúdo Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}