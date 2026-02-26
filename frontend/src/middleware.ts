import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/login',
  '/cadastro',
  '/confirmar-email',
  '/esqueci-senha',
  '/redefinir-senha',
  '/convite',
]

const authPaths = [
  '/login',
  '/cadastro',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('session')
  const isAuthenticated = !!session?.value

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && isAuthPath) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
