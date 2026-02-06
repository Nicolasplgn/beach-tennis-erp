import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        let user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email as string,
              password: credentials.password as string, // Em produção, use bcrypt
              name: "Organizador"
            }
          })
        }

        return { id: user.id, email: user.email, name: user.name }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/league")
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redireciona para login
      }
      return true
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    }
  }
})