import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // ✅ Allow admin login page
  if (pathname === "/admin/login") return res

  // 🔒 Protect admin routes
  if (pathname.startsWith("/admin") && !session) {
    const loginUrl = new URL("/admin/login", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 🔒 Protect register page (PLAYER AUTH)
  if (pathname.includes("/register") && !session) {
    const homeUrl = new URL("/", req.url)
    homeUrl.searchParams.set("login", "true") // optional UX
    return NextResponse.redirect(homeUrl)
  }

  return res
}

// ✅ IMPORTANT: update matcher
export const config = {
  matcher: [
    "/admin/:path*",
    "/tournaments/:path*/register",
  ],
}