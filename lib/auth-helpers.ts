import { auth } from '@/auth'
import { redirect } from 'next/navigation'

/**
 * 認証が必要なページで使用するヘルパー関数
 * @param requiredType - 必要なユーザータイプ ('engineer' | 'vaxal')
 * @returns セッション情報
 */
export async function requireAuth(requiredType?: 'engineer' | 'vaxal') {
  const session = await auth()

  // 未ログインの場合
  if (!session) {
    redirect('/login')
  }

  // ユーザータイプのチェック
  if (requiredType && session.user.userType !== requiredType) {
    // 適切なダッシュボードにリダイレクト
    const redirectPath = session.user.userType === 'engineer' ? '/engineer' : '/vaxal'
    redirect(redirectPath)
  }

  return session
}

/**
 * エンジニア専用ページで使用するヘルパー関数
 * @returns セッション情報
 */
export async function requireEngineerAuth() {
  return requireAuth('engineer')
}

/**
 * VAXAL社員専用ページで使用するヘルパー関数
 * @returns セッション情報
 */
export async function requireVaxalAuth() {
  return requireAuth('vaxal')
}

/**
 * VAXAL管理者権限が必要なページで使用するヘルパー関数
 * @returns セッション情報
 */
export async function requireVaxalAdminAuth() {
  const session = await requireAuth('vaxal')

  if (session.user.role !== 'VAXAL_ADMIN') {
    redirect('/vaxal')
  }

  return session
}

/**
 * エンジニアマスター権限が必要なページで使用するヘルパー関数
 * @returns セッション情報
 */
export async function requireEngineerMasterAuth() {
  const session = await requireAuth('engineer')

  if (session.user.role !== 'ENGINEER_MASTER') {
    redirect('/engineer')
  }

  return session
}
