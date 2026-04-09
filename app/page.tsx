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
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-white to-gray-50">

      <p className="text-sm font-medium text-indigo-600 bg-indigo-100 px-4 py-1 rounded-full mb-4">
        Smart Tournament Management
      </p>

      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
        Smart Tournament <br />
        Management Made{" "}
        <span className="text-indigo-600">Simple</span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-2xl">
        Smart Tournament Management System for seamless player registration,
        bracket generation, and match tracking.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">

        {/* View tournaments */}
        <Link
          href="/tournaments"
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition"
        >
          View Tournaments
        </Link>

        {/* ✅ Login as Player (Google OAuth) */}
        <button
          onClick={handleGoogleLogin}
          className="bg-white border border-gray-300 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition"
        >
          Login as Player (Google)
        </button>

        {/* ✅ Login as Admin */}
        <Link
          href="/admin/login"
          className="text-gray-500 text-sm mt-2 hover:text-gray-700 transition"
        >
          Admin Login →
        </Link>

      </div>
    </div>
    </div>
  )
}