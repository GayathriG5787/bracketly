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

  // 🔒 Protect admin routes (AUTH)
  if (pathname.startsWith("/admin") && !session) {
    const loginUrl = new URL("/admin/login", req.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 🔒 Protect register page (AUTH)
  if (pathname.includes("/register") && !session) {
    const homeUrl = new URL("/", req.url)
    homeUrl.searchParams.set("login", "true")
    return NextResponse.redirect(homeUrl)
  }

  // ================================
  // 🆕 ROLE-BASED AUTHORIZATION
  // ================================
  if (session) {
    const {
      data: userData,
    } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    const role = userData?.role

    // 🚫 Block ADMIN from player register page
    if (pathname.includes("/register") && role !== "player") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }

    // 🚫 Block non-admins from admin routes
    if (pathname.startsWith("/admin") && role !== "admin") {
      const loginUrl = new URL("/admin/login", req.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return res
}

// ✅ matcher (unchanged)
export const config = {
  matcher: [
    "/admin/:path*",
    "/tournaments/:path*/register",
  ],
}