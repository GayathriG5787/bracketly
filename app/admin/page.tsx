"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {

  const router = useRouter()

  useEffect(() => {

    const loggedIn = localStorage.getItem("adminLoggedIn")

    if (!loggedIn) {
      router.push("/admin/login")
    }

  }, [router])

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

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