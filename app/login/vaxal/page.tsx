'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function VaxalLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        userType: 'vaxal',
        redirect: false,
      })

      if (result?.error) {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else {
        router.push('/vaxal')
        router.refresh()
      }
    } catch (error) {
      setError('ログイン中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            VAXAL
          </h1>
          <p className="text-gray-600">
            統合管理システム
          </p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-center mb-6">
            VAXAL社員ログイン
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@vaxal.co.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            {registered && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                登録が完了しました。ログインしてください。
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/login/engineer" 
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              エンジニアの方はこちら →
            </Link>
          </div>
        </div>

        {/* 新規登録リンク */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            アカウントをお持ちでない方は
          </p>
          <Link 
            href="/register/vaxal"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            新規登録はこちら
          </Link>
        </div>
      </div>
    </div>
  )
}
