import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // VAXAL社員はカレンダー画面にリダイレクト
  if (session.user.role === 'VAXAL_ADMIN') {
    redirect('/dashboard/calendar')
  }
  
  // エンジニアは施工主基本情報ページにリダイレクト
  redirect('/dashboard/project')
}
