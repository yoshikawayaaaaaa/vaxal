'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function EngineerRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    const data = {
      // 個人情報
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      phoneNumber: formData.get('phoneNumber'),
      address: formData.get('address'),
      birthDate: formData.get('birthDate') || undefined,
      bloodType: formData.get('bloodType') || undefined,
      hasQualification: formData.get('hasQualification') === 'true',
      availableServices: formData.get('availableServices') || undefined,
      
      // 会社情報
      company: {
        companyName: formData.get('companyName'),
        address: formData.get('companyAddress'),
        representativeName: formData.get('representativeName'),
        phoneNumber: formData.get('companyPhoneNumber'),
        email: formData.get('companyEmail'),
      }
    }

    // パスワード確認
    const confirmPassword = formData.get('confirmPassword')
    if (data.password !== confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/register/engineer', {
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

      router.push('/login?type=engineer&registered=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            エンジニア登録（マスターアカウント）
          </h1>
          <p className="text-gray-600">
            新しいマスターアカウントと会社情報を登録します
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 個人情報 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2">
              個人情報
            </h2>

            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="phoneNumber">電話番号 *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder="090-1234-5678"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">メールアドレス *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="engineer@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">住所 *</Label>
              <Input
                id="address"
                name="address"
                type="text"
                required
                placeholder="東京都渋谷区..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="birthDate">生年月日 *</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bloodType">血液型 *</Label>
                <select
                  id="bloodType"
                  name="bloodType"
                  required
                  className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">選択してください</option>
                  <option value="A">A型</option>
                  <option value="B">B型</option>
                  <option value="O">O型</option>
                  <option value="AB">AB型</option>
                  <option value="UNKNOWN">不明</option>
                </select>
              </div>

              <div>
                <Label htmlFor="hasQualification">資格 *</Label>
                <select
                  id="hasQualification"
                  name="hasQualification"
                  required
                  className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">選択してください</option>
                  <option value="true">あり</option>
                  <option value="false">なし</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="availableServices">対応可能業種</Label>
              <Input
                id="availableServices"
                name="availableServices"
                type="text"
                placeholder="例: エコキュート, ガス給湯器, 太陽光パネル"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">カンマ区切りで入力してください</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* 会社情報 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2">
              会社情報
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">会社名 *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  placeholder="株式会社〇〇"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="representativeName">代表者名 *</Label>
                <Input
                  id="representativeName"
                  name="representativeName"
                  type="text"
                  required
                  placeholder="山田 太郎"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="companyAddress">所在地 *</Label>
              <Input
                id="companyAddress"
                name="companyAddress"
                type="text"
                required
                placeholder="東京都渋谷区..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyPhoneNumber">会社電話番号 *</Label>
                <Input
                  id="companyPhoneNumber"
                  name="companyPhoneNumber"
                  type="tel"
                  required
                  placeholder="03-1234-5678"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="companyEmail">会社メールアドレス *</Label>
                <Input
                  id="companyEmail"
                  name="companyEmail"
                  type="email"
                  required
                  placeholder="info@company.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
            disabled={isLoading}
          >
            {isLoading ? '登録中...' : '登録'}
          </Button>

          <div className="text-center">
            <a
              href="/login?type=engineer"
              className="text-sm text-green-600 hover:text-green-700"
            >
              既にアカウントをお持ちの方はこちら
            </a>
          </div>
        </form>
      </Card>
    </div>
  )
}
