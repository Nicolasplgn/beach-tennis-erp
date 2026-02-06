// middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnLogin = req.nextUrl.pathname.startsWith("/login")

  // 1. Se o cara não tá logado e tenta acessar o ERP, chuta pro login
  if (!isLoggedIn && !isOnLogin) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  // 2. Se o cara já tá logado e tenta ir pro login, manda pro dashboard
  if (isLoggedIn && isOnLogin) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
})

// Configuração de quais rotas o middleware deve vigiar
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}