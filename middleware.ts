import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userType = req.auth?.user?.userType
  const accountType = req.auth?.user?.accountType

  const isAuthPage = nextUrl.pathname.startsWith('/login') || 
                     nextUrl.pathname.startsWith('/register')
  const isPublicPage = nextUrl.pathname === '/'
  const isEngineerPage = nextUrl.pathname.startsWith('/engineer')
  const isVaxalPage = nextUrl.pathname.startsWith('/vaxal')
  const isOrderPage = nextUrl.pathname === '/vaxal/orders/new' || nextUrl.pathname.startsWith('/vaxal/orders/new/')

  // 認証ページへのアクセス
  if (isAuthPage) {
    if (isLoggedIn) {
      // ユーザータイプに応じて適切なダッシュボードにリダイレクト
      if (userType === 'engineer') {
        return NextResponse.redirect(new URL('/engineer', nextUrl))
      }
      return NextResponse.redirect(new URL('/vaxal', nextUrl))
    }
    return NextResponse.next()
  }

  // 未ログインユーザーのチェック
  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // ユーザータイプによるアクセス制御
  if (isLoggedIn) {
    // エンジニアがVAXALページにアクセスしようとした場合
    if (isVaxalPage && userType === 'engineer') {
      return NextResponse.redirect(new URL('/engineer', nextUrl))
    }

    // VAXAL社員がエンジニアページにアクセスしようとした場合
    if (isEngineerPage && userType === 'vaxal') {
      return NextResponse.redirect(new URL('/vaxal', nextUrl))
    }

    // コールセンターユーザーのアクセス制限
    if (userType === 'vaxal' && accountType === 'CALL_CENTER') {
      // 注文受付ページ以外へのアクセスを制限
      if (isVaxalPage && !isOrderPage) {
        return NextResponse.redirect(new URL('/vaxal/orders/new', nextUrl))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
