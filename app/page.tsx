import { redirect } from 'next/navigation'

export default function Home() {
  // トップページはVAXAL社員ログインにリダイレクト
  redirect('/login/vaxal')
}
