'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { WORK_CONTENT_LABELS } from '@/lib/constants'

interface Project {
  id: string
  projectNumber: string
  siteName: string
  siteAddress: string
  customerName: string
  customerAddress: string
  customerPhone: string
  workContent: string
  workDate: string
  status: string
  createdAt: string
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'name' | 'address' | 'phone'>('name')
  const [results, setResults] = useState<Project[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('検索キーワードを入力してください')
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams({
        type: searchType,
        query: searchQuery,
      })

      const response = await fetch(`/api/vaxal/customers/search?${params}`)
      if (!response.ok) throw new Error('検索に失敗しました')

      const data = await response.json()
      setResults(data.projects || [])
    } catch (error) {
      console.error('検索エラー:', error)
      alert('検索に失敗しました')
    } finally {
      setIsSearching(false)
    }
  }


  const statusLabels: Record<string, string> = {
    PENDING: '保留中',
    IN_PROGRESS: '作業中',
    COMPLETED: '完了',
    CANCELLED: 'キャンセル',
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">顧客検索</h1>
          <p className="text-gray-600 mt-2">お客様の過去の案件を検索できます</p>
        </div>

        {/* 検索フォーム */}
        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="searchType">検索項目</Label>
              <select
                id="searchType"
                className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'name' | 'address' | 'phone')}
              >
                <option value="name">お客様の名前</option>
                <option value="address">住所</option>
                <option value="phone">電話番号</option>
              </select>
            </div>

            <div>
              <Label htmlFor="searchQuery">
                {searchType === 'name' && 'お客様の名前'}
                {searchType === 'address' && '住所'}
                {searchType === 'phone' && '電話番号'}
              </Label>
              <Input
                id="searchQuery"
                type="text"
                placeholder={
                  searchType === 'name'
                    ? '例: 山田太郎'
                    : searchType === 'address'
                    ? '例: 東京都渋谷区'
                    : '例: 090-1234-5678'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? '検索中...' : '検索'}
            </Button>
          </div>
        </Card>

        {/* 検索結果 */}
        {hasSearched && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                検索結果: {results.length}件
              </h2>
            </div>

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((project) => (
                  <Link
                    key={project.id}
                    href={`/vaxal/project/${project.id}`}
                    className="block"
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {project.siteName}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                statusColors[project.status]
                              }`}
                            >
                              {statusLabels[project.status]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            案件番号: {project.projectNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(project.workDate).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                          <span className="text-gray-600">お客様:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {project.customerName}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">工事内容:</span>
                          <span className="ml-2 text-gray-900">
                            {WORK_CONTENT_LABELS[project.workContent]}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">現場住所:</span>
                          <span className="ml-2 text-gray-900">
                            {project.siteAddress}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">お客様住所:</span>
                          <span className="ml-2 text-gray-900">
                            {project.customerAddress}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">電話番号:</span>
                          <span className="ml-2 text-gray-900">
                            {project.customerPhone}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-gray-500 text-lg">検索結果がありません</p>
                <p className="text-gray-400 text-sm mt-2">
                  別のキーワードで検索してください
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
