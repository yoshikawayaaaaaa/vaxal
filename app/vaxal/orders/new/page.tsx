import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { OrderForm } from '@/components/forms/order-form'

export default async function NewOrderPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // VAXAL社員のみアクセス可能
  if (session.user.role !== 'VAXAL_ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">注文受付</h1>
          <p className="text-gray-600 mt-2">新規案件の情報を入力してください</p>
        </div>

        <OrderForm />
      </div>
    </div>
  )
}
