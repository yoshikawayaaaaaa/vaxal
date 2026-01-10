import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { OrderForm } from '@/components/forms/order-form'
import { prisma } from '@/lib/prisma'

export default async function NewOrderPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // VAXAL社員のみアクセス可能
  if (session.user.role !== 'VAXAL_ADMIN') {
    redirect('/dashboard')
  }

  // 全エンジニア会社とそのスタッフを取得
  const companies = await prisma.company.findMany({
    include: {
      masterUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      staffUsers: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      companyName: 'asc',
    },
  })

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">注文受付</h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">新規案件の情報を入力してください</p>
        </div>

        <OrderForm engineerCompanies={companies} />
      </div>
    </div>
  )
}
