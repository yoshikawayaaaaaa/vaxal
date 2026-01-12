'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

interface Company {
  id: number
  companyName: string
}

interface Engineer {
  id: number
  name: string
  email: string
  role: string
  company?: {
    companyName: string
  }
  evaluations: Array<{
    evaluationDate: string
  }>
}

export default function EvaluationsPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/vaxal/engineers/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error('会社取得エラー:', error)
    }
  }

  const handleCompanyChange = async (companyId: string) => {
    setSelectedCompanyId(companyId)
    
    if (!companyId) {
      setEngineers([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/vaxal/engineers/search?companyId=${companyId}`)
      if (response.ok) {
        const data = await response.json()
        setEngineers(data)
      }
    } catch (error) {
      console.error('エンジニア取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            エンジニア評価
          </h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>会社で絞り込み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label htmlFor="company-select">会社を選択</Label>
              <select
                id="company-select"
                value={selectedCompanyId}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className="w-full mt-2 p-2 border rounded"
              >
                <option value="">施工会社を選択してください</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>エンジニア一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCompanyId ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏢</div>
                <p className="text-gray-600">
                  施工会社を選択してください
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="text-2xl">読み込み中...</div>
              </div>
            ) : engineers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👷</div>
                <p className="text-gray-600">
                  この会社に所属するエンジニアがいません
                </p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {engineers.map((engineer) => (
                  <Link
                    key={engineer.id}
                    href={`/vaxal/evaluations/${engineer.id}`}
                    className="block"
                  >
                    <div className="border rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-0">
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                            <h3 className="font-semibold text-base md:text-lg">
                              {engineer.name}
                            </h3>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 self-start">
                              {engineer.role === 'MASTER' ? 'マスター' : 'スタッフ'}
                            </span>
                          </div>
                          <div className="text-xs md:text-sm text-gray-600 space-y-1">
                            <p>メール: {engineer.email}</p>
                            {engineer.company && (
                              <p>会社: {engineer.company.companyName}</p>
                            )}
                            {engineer.evaluations && engineer.evaluations.length > 0 && (
                              <p className="text-green-600">
                                最終評価日:{' '}
                                {new Date(
                                  engineer.evaluations[0].evaluationDate
                                ).toLocaleDateString('ja-JP')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <div className="text-xs md:text-sm text-gray-500">
                            評価回数: {engineer.evaluations && engineer.evaluations.length > 0 ? '1+' : '0'}回
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
