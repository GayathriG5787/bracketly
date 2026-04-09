"use client"

import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function HomePage() {

  // ✅ Google Login (Player)
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/player/dashboard`,
      },
    })

    if (error) console.error(error)
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-white to-background">

      <p className="text-sm font-medium text-primary bg-primary-light/20 px-4 py-1 rounded-full mb-4">
        Smart Tournament Management
      </p>

      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
        Smart Tournament <br />
        Management Made{" "}
        <span className="text-primary">Simple</span>
      </h1>

      {/* Subtitle */}
      <p className="text-muted text-lg md:text-xl mb-10 max-w-2xl">
        Smart Tournament Management System for seamless player registration,
        bracket generation, and match tracking.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">

        {/* View tournaments */}
        <Link
          href="/tournaments"
          className="bg-primary text-white px-6 py-2.5 rounded-lg text-base font-medium hover:bg-primary-dark transition"
        >
          View Tournaments
        </Link>

        {/* Login as Player */}
        <button
          onClick={handleGoogleLogin}
          className="bg-white border border-border  px-6 py-2.5 rounded-lg text-base font-medium hover:bg-background transition"
        >
          Login as Player (Google)
        </button>

      </div>

      {/* Admin Login BELOW buttons */}
      <Link
        href="/admin/login"
        className="text-muted text-sm mt-4 hover:text-primary transition"
      >
        Admin Login →
      </Link>
    </div>
    </div>
  )
}