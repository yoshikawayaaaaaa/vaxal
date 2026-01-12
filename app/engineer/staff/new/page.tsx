'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NewStaffPage() {
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
      address: formData.get('address'),
      birthDate: formData.get('birthDate') || undefined,
      bloodType: formData.get('bloodType') || undefined,
      gender: formData.get('gender') || undefined,
      emergencyContact: formData.get('emergencyContact') || undefined,
      hasQualification: formData.get('hasQualification') === 'true',
      hasLicense: formData.get('hasLicense') === 'true',
      hasWorkersComp: formData.get('hasWorkersComp') === 'true',
      availableServices: formData.get('availableServices') || undefined,
    }

    // パスワード確認
    const confirmPassword = formData.get('confirmPassword')
    if (data.password !== confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/engineer/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'スタッフの登録に失敗しました')
      }

      // 登録成功後、スタッフ一覧ページにリダイレクト
      router.push('/engineer/staff?created=true')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'スタッフの登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/engineer/staff">
                <Button variant="outline" size="sm">
                  ← 戻る
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              スタッフアカウント追加
            </h1>
            <p className="text-gray-600">
              新しいスタッフアカウントを作成します
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* 基本情報 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2">
                基本情報
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
                  placeholder="staff@example.com"
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

            {/* 詳細情報 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2">
                詳細情報
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="birthDate">生年月日</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bloodType">血液型</Label>
                  <select
                    id="bloodType"
                    name="bloodType"
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
                  <Label htmlFor="gender">性別</Label>
                  <select
                    id="gender"
                    name="gender"
                    className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">選択してください</option>
                    <option value="MALE">男性</option>
                    <option value="FEMALE">女性</option>
                    <option value="OTHER">その他</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContact">緊急連絡先</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  type="tel"
                  placeholder="090-9876-5432"
                  className="mt-1"
                />
              </div>
            </div>

            {/* 業務情報 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-gray-200 pb-2">
                業務情報
              </h2>

              <div className="grid grid-cols-3 gap-4">
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

                <div>
                  <Label htmlFor="hasLicense">免許</Label>
                  <select
                    id="hasLicense"
                    name="hasLicense"
                    className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">選択してください</option>
                    <option value="true">あり</option>
                    <option value="false">なし</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="hasWorkersComp">労災保険</Label>
                  <select
                    id="hasWorkersComp"
                    name="hasWorkersComp"
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
            </div>

            <div className="flex gap-4">
              <Link href="/engineer/staff" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                >
                  キャンセル
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
                disabled={isLoading}
              >
                {isLoading ? '登録中...' : 'スタッフを追加'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
