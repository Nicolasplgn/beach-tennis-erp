import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beach Tennis Pro",
  description: "Gestão profissional de campeonatos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#F8FAFC]`}>
        {/* Aqui removemos a Navbar antiga que estava duplicando */}
        {children}
      </body>
    </html>
  );
}