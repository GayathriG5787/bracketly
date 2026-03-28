import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Allow login page WITHOUT checking
  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  // 👉 Protect all other /admin routes
  if (pathname.startsWith("/admin")) {

    const token = request.cookies.get("sb-access-token")

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}