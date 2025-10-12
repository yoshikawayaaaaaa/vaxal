import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // デフォルトで施工主基本情報ページにリダイレクト
  redirect('/dashboard/project')
}
