"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AdminDashboard() {

  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      // ❌ Not logged in
      if (!user) {
        router.push("/admin/login")
        return
      }

      // ❌ Not admin
      if (user.user_metadata?.role !== "admin") {
        await supabase.auth.signOut()
        router.push("/admin/login")
        return
      }
    }

    checkUser()
  }, [router])

  // 🔓 Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Admin Dashboard
        </h1>

        {/* 🔴 Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-4 max-w-md">

        <Link
          href="/admin/create-tournament"
          className="border p-3 rounded block hover:bg-gray-100"
        >
          Create Tournament
        </Link>

        <Link
          href="/admin/tournaments"
          className="border p-3 rounded block hover:bg-gray-100"
        >
          View Tournaments
        </Link>

      </div>

    </div>
  )
}