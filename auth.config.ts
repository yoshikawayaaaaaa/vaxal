import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.enum(['vaxal', 'engineer']).optional(),
})

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials)

        if (!validatedFields.success) {
          return null
        }

        const { email, password, userType } = validatedFields.data

        // userTypeが指定されている場合は、そのテーブルのみをチェック
        if (userType === 'engineer') {
          // EngineerUserのみを検索
          const engineerUser = await prisma.engineerUser.findUnique({
            where: { email },
            include: {
              company: true,
              masterCompany: true,
            },
          })

          if (!engineerUser) {
            return null
          }

          const passwordsMatch = await bcrypt.compare(password, engineerUser.password)
          
          if (!passwordsMatch) {
            return null
          }

          return {
            id: String(engineerUser.id),
            email: engineerUser.email,
            name: engineerUser.name,
            role: engineerUser.role === 'MASTER' ? 'ENGINEER_MASTER' : 'ENGINEER_STAFF',
            userType: 'engineer',
            companyId: engineerUser.companyId ? String(engineerUser.companyId) : null,
            masterCompanyId: engineerUser.masterCompanyId ? String(engineerUser.masterCompanyId) : null,
            engineerRole: engineerUser.role,
          }
        }

        // userTypeがvaxalまたは未指定の場合は、VaxalUserを検索
        const vaxalUser = await prisma.vaxalUser.findUnique({
          where: { email },
        })

        if (vaxalUser) {
          const passwordsMatch = await bcrypt.compare(password, vaxalUser.password)
          
          if (!passwordsMatch) {
            return null
          }

          return {
            id: String(vaxalUser.id),
            email: vaxalUser.email,
            name: vaxalUser.name,
            role: 'VAXAL_ADMIN',
            userType: 'vaxal',
            accountType: vaxalUser.accountType,
          }
        }

        // userTypeが未指定の場合のみ、EngineerUserもチェック
        if (!userType) {
          const engineerUser = await prisma.engineerUser.findUnique({
            where: { email },
            include: {
              company: true,
              masterCompany: true,
            },
          })

          if (engineerUser) {
            const passwordsMatch = await bcrypt.compare(password, engineerUser.password)
            
            if (!passwordsMatch) {
              return null
            }

            return {
              id: String(engineerUser.id),
              email: engineerUser.email,
              name: engineerUser.name,
              role: engineerUser.role === 'MASTER' ? 'ENGINEER_MASTER' : 'ENGINEER_STAFF',
              userType: 'engineer',
              companyId: engineerUser.companyId ? String(engineerUser.companyId) : null,
              masterCompanyId: engineerUser.masterCompanyId ? String(engineerUser.masterCompanyId) : null,
              engineerRole: engineerUser.role,
            }
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.userType = user.userType
        token.companyId = user.companyId ?? null
        token.masterCompanyId = user.masterCompanyId ?? null
        token.engineerRole = user.engineerRole
        token.accountType = user.accountType
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.userType = token.userType as string
        session.user.companyId = token.companyId
        session.user.masterCompanyId = token.masterCompanyId
        session.user.engineerRole = token.engineerRole
        session.user.accountType = token.accountType
      }
      return session
    },
  },
} satisfies NextAuthConfig
