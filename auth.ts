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
        if (!credentials?.email) return null
        
        let user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email as string,
            
            }
          })
        }
        return { id: user.id, email: user.email, }
      }
    })
  ],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/league")
      if (isOnDashboard) return isLoggedIn
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