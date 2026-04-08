import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const session = req.cookies.get('admin_session')
  const isLoginPage = req.nextUrl.pathname === '/dashboard/login'

  // Kalau belum login dan bukan halaman login → redirect ke login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard/login', req.url))
  }

  // Kalau sudah login dan buka halaman login → redirect ke dashboard
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}