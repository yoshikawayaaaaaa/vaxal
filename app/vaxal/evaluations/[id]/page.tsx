'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type EvaluationGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | null

interface EvaluationFormData {
  // To VAXAL
  responseToVaxal: EvaluationGrade
  checkinDelay: EvaluationGrade
  flexibility: EvaluationGrade
  friendliness: EvaluationGrade
  attitudeToVaxal: EvaluationGrade
  languageUse: EvaluationGrade
  reportCooperation: EvaluationGrade
  surveyCooperation: EvaluationGrade
  documentSubmission: EvaluationGrade
  instructionComprehension: EvaluationGrade
  busySeasonResponse: EvaluationGrade
  ruleCompliance: EvaluationGrade
  understandingOfVaxal: EvaluationGrade
  improvementProposals: EvaluationGrade
  longTermCooperation: EvaluationGrade
  educationAttitude: EvaluationGrade
  staffingStability: EvaluationGrade
  toVaxalNotes: string
  
  // 現場・品質
  constructionQuality: EvaluationGrade
  photoAccuracy: EvaluationGrade
  photoQuality: EvaluationGrade
  constructionSpeed: EvaluationGrade
  problemReporting: EvaluationGrade
  siteCleanness: EvaluationGrade
  correctionFrequency: EvaluationGrade
  correctionSpeed: EvaluationGrade
  complaintFrequency: EvaluationGrade
  unauthorizedDecisions: EvaluationGrade
  scheduleCompliance: EvaluationGrade
  technicalKnowledge: EvaluationGrade
  preparation: EvaluationGrade
  safetyManagement: EvaluationGrade
  siteQualityNotes: string
  
  // To Customer
  customerSurveyRating: EvaluationGrade
  attitudeToCustomer: EvaluationGrade
  appearance: EvaluationGrade
  vehicleCleanness: EvaluationGrade
  customerFriendliness: EvaluationGrade
  greetingAndLanguage: EvaluationGrade
  ownerResponse: EvaluationGrade
  protectionAndCleaning: EvaluationGrade
  neighborConsideration: EvaluationGrade
  toCustomerNotes: string
  
  generalNotes: string
}

const GRADES: EvaluationGrade[] = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G']

const GRADE_COLORS = {
  S: 'bg-purple-600 text-white',
  A: 'bg-blue-600 text-white',
  B: 'bg-green-600 text-white',
  C: 'bg-yellow-500 text-white',
  D: 'bg-orange-500 text-white',
  E: 'bg-red-500 text-white',
  F: 'bg-red-700 text-white',
  G: 'bg-gray-800 text-white',
}

export default function EngineerEvaluationPage() {
  const params = useParams()
  const router = useRouter()
  const engineerId = params.id as string

  const [engineer, setEngineer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [evaluationId, setEvaluationId] = useState<number | null>(null)
  const [formData, setFormData] = useState<EvaluationFormData>({
    responseToVaxal: null,
    checkinDelay: null,
    flexibility: null,
    friendliness: null,
    attitudeToVaxal: null,
    languageUse: null,
    reportCooperation: null,
    surveyCooperation: null,
    documentSubmission: null,
    instructionComprehension: null,
    busySeasonResponse: null,
    ruleCompliance: null,
    understandingOfVaxal: null,
    improvementProposals: null,
    longTermCooperation: null,
    educationAttitude: null,
    staffingStability: null,
    toVaxalNotes: '',
    constructionQuality: null,
    photoAccuracy: null,
    photoQuality: null,
    constructionSpeed: null,
    problemReporting: null,
    siteCleanness: null,
    correctionFrequency: null,
    correctionSpeed: null,
    complaintFrequency: null,
    unauthorizedDecisions: null,
    scheduleCompliance: null,
    technicalKnowledge: null,
    preparation: null,
    safetyManagement: null,
    siteQualityNotes: '',
    customerSurveyRating: null,
    attitudeToCustomer: null,
    appearance: null,
    vehicleCleanness: null,
    customerFriendliness: null,
    greetingAndLanguage: null,
    ownerResponse: null,
    protectionAndCleaning: null,
    neighborConsideration: null,
    toCustomerNotes: '',
    generalNotes: '',
  })

  useEffect(() => {
    fetchEngineer()
    fetchLatestEvaluation()
  }, [engineerId])

  const fetchEngineer = async () => {
    try {
      const response = await fetch(`/api/vaxal/engineers/${engineerId}`)
      if (response.ok) {
        const data = await response.json()
        setEngineer(data)
      }
    } catch (error) {
      console.error('エンジニア取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLatestEvaluation = async () => {
    try {
      const response = await fetch(`/api/vaxal/evaluations?engineerUserId=${engineerId}`)
      if (response.ok) {
        const evaluations = await response.json()
        if (evaluations.length > 0) {
          // 最新の評価をフォームに反映
          const latest = evaluations[0]
          setEvaluationId(latest.id) // 評価IDを保存
          setFormData({
            responseToVaxal: latest.responseToVaxal,
            checkinDelay: latest.checkinDelay,
            flexibility: latest.flexibility,
            friendliness: latest.friendliness,
            attitudeToVaxal: latest.attitudeToVaxal,
            languageUse: latest.languageUse,
            reportCooperation: latest.reportCooperation,
            surveyCooperation: latest.surveyCooperation,
            documentSubmission: latest.documentSubmission,
            instructionComprehension: latest.instructionComprehension,
            busySeasonResponse: latest.busySeasonResponse,
            ruleCompliance: latest.ruleCompliance,
            understandingOfVaxal: latest.understandingOfVaxal,
            improvementProposals: latest.improvementProposals,
            longTermCooperation: latest.longTermCooperation,
            educationAttitude: latest.educationAttitude,
            staffingStability: latest.staffingStability,
            toVaxalNotes: latest.toVaxalNotes || '',
            constructionQuality: latest.constructionQuality,
            photoAccuracy: latest.photoAccuracy,
            photoQuality: latest.photoQuality,
            constructionSpeed: latest.constructionSpeed,
            problemReporting: latest.problemReporting,
            siteCleanness: latest.siteCleanness,
            correctionFrequency: latest.correctionFrequency,
            correctionSpeed: latest.correctionSpeed,
            complaintFrequency: latest.complaintFrequency,
            unauthorizedDecisions: latest.unauthorizedDecisions,
            scheduleCompliance: latest.scheduleCompliance,
            technicalKnowledge: latest.technicalKnowledge,
            preparation: latest.preparation,
            safetyManagement: latest.safetyManagement,
            siteQualityNotes: latest.siteQualityNotes || '',
            customerSurveyRating: latest.customerSurveyRating,
            attitudeToCustomer: latest.attitudeToCustomer,
            appearance: latest.appearance,
            vehicleCleanness: latest.vehicleCleanness,
            customerFriendliness: latest.customerFriendliness,
            greetingAndLanguage: latest.greetingAndLanguage,
            ownerResponse: latest.ownerResponse,
            protectionAndCleaning: latest.protectionAndCleaning,
            neighborConsideration: latest.neighborConsideration,
            toCustomerNotes: latest.toCustomerNotes || '',
            generalNotes: latest.generalNotes || '',
          })
        }
      }
    } catch (error) {
      console.error('評価取得エラー:', error)
    }
  }

  const handleGradeChange = (field: keyof EvaluationFormData, grade: EvaluationGrade) => {
    setFormData(prev => ({ ...prev, [field]: grade }))
  }

  const handleNotesChange = (field: keyof EvaluationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let response
      
      if (evaluationId) {
        // 既存の評価を更新
        response = await fetch(`/api/vaxal/evaluations/${evaluationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        // 新規評価を作成
        response = await fetch('/api/vaxal/evaluations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engineerUserId: engineerId,
            ...formData,
          }),
        })
      }

      if (response.ok) {
        alert('評価を保存しました')
        router.push('/vaxal/evaluations')
      } else {
        alert('評価の保存に失敗しました')
      }
    } catch (error) {
      console.error('評価保存エラー:', error)
      alert('評価の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const renderGradeSelector = (label: string, field: keyof EvaluationFormData) => (
    <div className="mb-4">
      <Label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </Label>
      <div className="flex gap-2 flex-wrap">
        {GRADES.map((grade) => (
          <button
            key={grade}
            type="button"
            onClick={() => handleGradeChange(field, grade)}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              formData[field] === grade
                ? GRADE_COLORS[grade as keyof typeof GRADE_COLORS]
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {grade}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleGradeChange(field, null)}
          className={`px-4 py-2 rounded font-semibold transition-all ${
            formData[field] === null
              ? 'bg-gray-400 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          未評価
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl">読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!engineer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl">エンジニアが見つかりません</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            ← 戻る
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {engineer.name} の評価
          </h1>
          <p className="text-gray-600 mt-2">{engineer.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* To VAXAL */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">To VAXAL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderGradeSelector('VAXALへのレスポンス', 'responseToVaxal')}
              {renderGradeSelector('チェックイン遅延状況', 'checkinDelay')}
              {renderGradeSelector('急な変更・要求の柔軟性', 'flexibility')}
              {renderGradeSelector('愛想', 'friendliness')}
              {renderGradeSelector('VAXALへの態度', 'attitudeToVaxal')}
              {renderGradeSelector('言葉遣い', 'languageUse')}
              {renderGradeSelector('報告セクションへの協力状況', 'reportCooperation')}
              {renderGradeSelector('アンケート協力状況', 'surveyCooperation')}
              {renderGradeSelector('毎月の提出書類等の不備・スピード', 'documentSubmission')}
              {renderGradeSelector('指示理解力', 'instructionComprehension')}
              {renderGradeSelector('繁忙期対応力', 'busySeasonResponse')}
              {renderGradeSelector('社内ルール遵守', 'ruleCompliance')}
              {renderGradeSelector('VAXALへの理解', 'understandingOfVaxal')}
              {renderGradeSelector('改善提案の有無', 'improvementProposals')}
              {renderGradeSelector('長期的な協力意欲', 'longTermCooperation')}
              {renderGradeSelector('教育・指導への姿勢', 'educationAttitude')}
              {renderGradeSelector('人員確保の安定性', 'staffingStability')}
              
              <div>
                <Label htmlFor="toVaxalNotes">メモ</Label>
                <textarea
                  id="toVaxalNotes"
                  value={formData.toVaxalNotes}
                  onChange={(e) => handleNotesChange('toVaxalNotes', e.target.value)}
                  className="w-full mt-2 p-2 border rounded"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* 現場・品質 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">現場・品質</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderGradeSelector('施工品質', 'constructionQuality')}
              {renderGradeSelector('報告写真の正確さ', 'photoAccuracy')}
              {renderGradeSelector('写真の綺麗さ', 'photoQuality')}
              {renderGradeSelector('施工スピード', 'constructionSpeed')}
              {renderGradeSelector('問題が発生した際の報告頻度', 'problemReporting')}
              {renderGradeSelector('現場の綺麗さ', 'siteCleanness')}
              {renderGradeSelector('是正の有無', 'correctionFrequency')}
              {renderGradeSelector('是正対応の速さ', 'correctionSpeed')}
              {renderGradeSelector('クレームの有無', 'complaintFrequency')}
              {renderGradeSelector('勝手判断の有無', 'unauthorizedDecisions')}
              {renderGradeSelector('工期遵守', 'scheduleCompliance')}
              {renderGradeSelector('専門知識力', 'technicalKnowledge')}
              {renderGradeSelector('段取りの良さ', 'preparation')}
              {renderGradeSelector('安全管理の徹底性', 'safetyManagement')}
              
              <div>
                <Label htmlFor="siteQualityNotes">メモ</Label>
                <textarea
                  id="siteQualityNotes"
                  value={formData.siteQualityNotes}
                  onChange={(e) => handleNotesChange('siteQualityNotes', e.target.value)}
                  className="w-full mt-2 p-2 border rounded"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* To Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">To Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderGradeSelector('アンケートでのお客様からの評価・印象', 'customerSurveyRating')}
              {renderGradeSelector('お客様への態度', 'attitudeToCustomer')}
              {renderGradeSelector('身だしなみ', 'appearance')}
              {renderGradeSelector('車両の綺麗さ', 'vehicleCleanness')}
              {renderGradeSelector('愛想', 'customerFriendliness')}
              {renderGradeSelector('挨拶・言葉遣い', 'greetingAndLanguage')}
              {renderGradeSelector('施主対応の丁寧さ', 'ownerResponse')}
              {renderGradeSelector('養生・清掃', 'protectionAndCleaning')}
              {renderGradeSelector('近隣配慮', 'neighborConsideration')}
              
              <div>
                <Label htmlFor="toCustomerNotes">メモ</Label>
                <textarea
                  id="toCustomerNotes"
                  value={formData.toCustomerNotes}
                  onChange={(e) => handleNotesChange('toCustomerNotes', e.target.value)}
                  className="w-full mt-2 p-2 border rounded"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* 総合メモ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">総合メモ</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.generalNotes}
                onChange={(e) => handleNotesChange('generalNotes', e.target.value)}
                className="w-full p-2 border rounded"
                rows={6}
                placeholder="総合的なコメントや特記事項を記入してください"
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? '保存中...' : '評価を保存'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
