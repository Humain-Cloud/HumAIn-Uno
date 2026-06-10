import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Demo Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'demo@humain-uno.dev' },
        name: { label: 'Name', type: 'text', placeholder: 'Demo User' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        let user = await db.user.findUnique({ where: { email: credentials.email } })
        if (!user) {
          user = await db.user.create({
            data: {
              email: credentials.email,
              name: credentials.name || credentials.email.split('@')[0],
              role: credentials.email === 'admin@humain-uno.dev' ? 'admin' : 'user',
            },
          })
        }
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.userRole = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string
        (session.user as any).role = token.userRole as string
      }
      return session
    },
  },
  pages: {
    signIn: '/#auth',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'humain-uno-dev-secret-key-change-in-production',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
