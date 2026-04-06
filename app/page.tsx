"use client"

import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function HomePage() {

  // ✅ Google Login (Player)
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "${window.location.origin}/player/dashboard",
      },
    })

    if (error) console.error(error)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">

      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">
        🏆 Bracketly
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 text-lg mb-8 max-w-md">
        Smart Tournament Management System for seamless player registration,
        bracket generation, and match tracking.
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-4">

        {/* View tournaments */}
        <Link
          href="/tournaments"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
        >
          View Tournaments
        </Link>

        {/* ✅ Login as Player (Google OAuth) */}
        <button
          onClick={handleGoogleLogin}
          className="bg-red-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-red-600 transition"
        >
          Login as Player (Google)
        </button>

        {/* ✅ Login as Admin */}
        <Link
          href="/admin/login"
          className="bg-gray-800 text-white px-6 py-3 rounded-lg text-lg hover:bg-gray-900 transition"
        >
          Login as Admin
        </Link>

      </div>
    </div>
  )
}