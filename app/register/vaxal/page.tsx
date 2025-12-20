'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function VaxalRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      phoneNumber: formData.get('phoneNumber'),
    }

    // パスワード確認
    const confirmPassword = formData.get('confirmPassword')
    if (data.password !== confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '登録に失敗しました')
      }

      // 登録成功後、ログインページにリダイレクト
      router.push('/login/vaxal?registered=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            VAXAL社員登録
          </h1>
          <p className="text-gray-600">
            新しいアカウントを作成します
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="name">氏名 *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="山田 太郎"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">メールアドレス *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="yamada@vaxal.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">電話番号 *</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              placeholder="03-1234-5678"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">パスワード *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="6文字以上"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">パスワード（確認） *</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder="パスワードを再入力"
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? '登録中...' : '登録'}
          </Button>

          <div className="text-center space-y-2">
            <Link
              href="/login/vaxal"
              className="block text-sm text-blue-600 hover:text-blue-700"
            >
              既にアカウントをお持ちの方はこちら
            </Link>
            <Link
              href="/login/engineer"
              className="block text-sm text-gray-600 hover:text-gray-900"
            >
              エンジニアの方はこちら →
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
