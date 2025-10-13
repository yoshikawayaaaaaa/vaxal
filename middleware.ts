import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userType = req.auth?.user?.userType

  const isAuthPage = nextUrl.pathname.startsWith('/login') || 
                     nextUrl.pathname.startsWith('/register')
  const isPublicPage = nextUrl.pathname === '/'

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

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
