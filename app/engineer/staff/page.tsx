'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Staff {
  id: number
  name: string
  email: string
  phoneNumber: string
  address: string
  birthDate: string | null
  bloodType: string | null
  gender: string | null
  emergencyContact: string | null
  hasQualification: boolean
  hasLicense: boolean
  hasWorkersComp: boolean
  availableServices: string | null
  createdAt: string
  updatedAt: string
}

export default function StaffListPage() {
  const router = useRouter()
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStaffList()
  }, [])

  const fetchStaffList = async () => {
    try {
      const response = await fetch('/api/engineer/staff')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'スタッフ一覧の取得に失敗しました')
      }

      const data = await response.json()
      setStaffList(data.staffList || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const getBloodTypeLabel = (bloodType: string | null) => {
    if (!bloodType) return '未登録'
    switch (bloodType) {
      case 'A': return 'A型'
      case 'B': return 'B型'
      case 'O': return 'O型'
      case 'AB': return 'AB型'
      case 'UNKNOWN': return '不明'
      default: return bloodType
    }
  }

  const getGenderLabel = (gender: string | null) => {
    if (!gender) return '未登録'
    switch (gender) {
      case 'MALE': return '男性'
      case 'FEMALE': return '女性'
      case 'OTHER': return 'その他'
      default: return gender
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">スタッフ管理</h1>
            <p className="text-gray-600 mt-2">
              自社のスタッフアカウントを管理できます
            </p>
          </div>
          <Link href="/engineer/staff/new">
            <Button className="bg-green-600 hover:bg-green-700">
              + スタッフを追加
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* スタッフ一覧 */}
        {staffList.length > 0 ? (
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                登録スタッフ数: <span className="font-semibold text-gray-900">{staffList.length}名</span>
              </p>
            </div>

            {staffList.map((staff) => (
              <Card key={staff.id} className="p-6">
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {staff.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        登録日: {new Date(staff.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      スタッフ
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">メールアドレス:</span>
                    <span className="ml-2 text-gray-900 break-all">{staff.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">電話番号:</span>
                    <span className="ml-2 text-gray-900">{staff.phoneNumber}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-600">住所:</span>
                    <span className="ml-2 text-gray-900">{staff.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">生年月日:</span>
                    <span className="ml-2 text-gray-900">
                      {staff.birthDate 
                        ? new Date(staff.birthDate).toLocaleDateString('ja-JP')
                        : '未登録'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">血液型:</span>
                    <span className="ml-2 text-gray-900">{getBloodTypeLabel(staff.bloodType)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">性別:</span>
                    <span className="ml-2 text-gray-900">{getGenderLabel(staff.gender)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">緊急連絡先:</span>
                    <span className="ml-2 text-gray-900">{staff.emergencyContact || '未登録'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">資格:</span>
                    <span className="ml-2 text-gray-900">{staff.hasQualification ? 'あり' : 'なし'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">免許:</span>
                    <span className="ml-2 text-gray-900">{staff.hasLicense ? 'あり' : 'なし'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">労災保険:</span>
                    <span className="ml-2 text-gray-900">{staff.hasWorkersComp ? 'あり' : 'なし'}</span>
                  </div>
                  {staff.availableServices && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">対応可能業種:</span>
                      <span className="ml-2 text-gray-900">{staff.availableServices}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">スタッフが登録されていません</p>
            <Link href="/engineer/staff/new">
              <Button className="bg-green-600 hover:bg-green-700">
                最初のスタッフを追加
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}
