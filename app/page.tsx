import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            VAXAL
          </h1>
          <p className="text-gray-600">
            統合管理システム
          </p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-center text-gray-700 mb-6">
            アカウントタイプを選択してください
          </p>

          {/* VAXAL社員ログイン */}
          <Link href="/login?type=vaxal" className="block mb-4">
            <Button 
              className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              VAXAL社員ログイン
            </Button>
          </Link>

          {/* エンジニアログイン */}
          <Link href="/login?type=engineer" className="block mb-6">
            <Button 
              className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 text-white"
            >
              エンジニアログイン
            </Button>
          </Link>

          {/* 区切り線 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          {/* 新規登録リンク */}
          <Link href="/register?type=vaxal" className="block mb-2">
            <Button 
              variant="outline" 
              className="w-full h-10 text-sm text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              VAXAL社員新規登録
            </Button>
          </Link>

          <Link href="/register?type=engineer" className="block">
            <Button 
              variant="outline" 
              className="w-full h-10 text-sm text-green-600 border-green-600 hover:bg-green-50"
            >
              エンジニア新規登録
            </Button>
          </Link>
        </div>

        {/* フッター */}
        <p className="text-center text-sm text-gray-500 mt-8">
          現場作業者向け統合管理システム
        </p>
      </div>
    </div>
  )
}
