'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Engineer {
  id: string
  name: string
  email: string
  address: string
  phoneNumber: string
  companyName: string
  monthlyStats: {
    month: string
    projectCount: number
  }[]
  totalProjects: number
}

interface Company {
  id: string
  companyName: string
}

export default function EngineersPage() {
  const [searchType, setSearchType] = useState<'keyword' | 'company'>('keyword')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchField, setSearchField] = useState<'name' | 'email' | 'address'>('name')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [results, setResults] = useState<Engineer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // 会社一覧を取得
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/vaxal/engineers/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error('会社一覧取得エラー:', error)
    }
  }

  const handleSearch = async () => {
    if (searchType === 'keyword' && !searchQuery.trim()) {
      alert('検索キーワードを入力してください')
      return
    }

    if (searchType === 'company' && !selectedCompany) {
      alert('会社を選択してください')
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      let url = '/api/vaxal/engineers/search?'
      
      if (searchType === 'keyword') {
        url += `type=keyword&field=${searchField}&query=${encodeURIComponent(searchQuery)}`
      } else {
        url += `type=company&companyId=${selectedCompany}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('検索に失敗しました')

      const data = await response.json()
      setResults(data.engineers || [])
    } catch (error) {
      console.error('検索エラー:', error)
      alert('検索に失敗しました')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">エンジニア検索</h1>
          <p className="text-gray-600 mt-2">エンジニアの情報と稼働状況を確認できます</p>
        </div>

        {/* 検索タイプ選択 */}
        <div className="mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setSearchType('keyword')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                searchType === 'keyword'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              キーワード検索
            </button>
            <button
              onClick={() => setSearchType('company')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                searchType === 'company'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              会社別検索
            </button>
          </div>
        </div>

        {/* 検索フォーム */}
        <Card className="p-6 mb-8">
          {searchType === 'keyword' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="searchField">検索項目</Label>
                <select
                  id="searchField"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300"
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value as any)}
                >
                  <option value="name">氏名</option>
                  <option value="email">メールアドレス</option>
                  <option value="address">住所</option>
                </select>
              </div>

              <div>
                <Label htmlFor="searchQuery">
                  {searchField === 'name' && '氏名'}
                  {searchField === 'email' && 'メールアドレス'}
                  {searchField === 'address' && '住所'}
                </Label>
                <Input
                  id="searchQuery"
                  type="text"
                  placeholder={
                    searchField === 'name'
                      ? '例: 山田太郎'
                      : searchField === 'email'
                      ? '例: engineer@example.com'
                      : '例: 東京都渋谷区'
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
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="selectedCompany">会社名</Label>
                <select
                  id="selectedCompany"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-gray-300"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                >
                  <option value="">選択してください</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? '検索中...' : '検索'}
          </Button>
        </Card>

        {/* 検索結果 */}
        {hasSearched && (
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                検索結果: {results.length}名
              </h2>
            </div>

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((engineer) => (
                  <Card key={engineer.id} className="p-6">
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {engineer.name}
                          </h3>
                          <p className="text-sm text-gray-600">{engineer.companyName}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {engineer.totalProjects}件
                          </div>
                          <p className="text-xs text-gray-600">総案件数</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">メールアドレス:</span>
                        <span className="ml-2 text-gray-900 break-all">{engineer.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">電話番号:</span>
                        <span className="ml-2 text-gray-900">{engineer.phoneNumber}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600">住所:</span>
                        <span className="ml-2 text-gray-900">{engineer.address}</span>
                      </div>
                    </div>

                    {/* 月別稼働状況 */}
                    {engineer.monthlyStats.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          月別稼働状況
                        </h4>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                          {engineer.monthlyStats.map((stat) => (
                            <div
                              key={stat.month}
                              className="bg-gray-50 p-2 md:p-3 rounded-lg text-center"
                            >
                              <div className="text-[10px] md:text-xs text-gray-600 mb-1 whitespace-nowrap">
                                {stat.month}
                              </div>
                              <div className="text-base md:text-lg font-bold text-gray-900">
                                {stat.projectCount}件
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
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
