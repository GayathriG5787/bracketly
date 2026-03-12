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
  }, [])

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">        Admin Dashboard
      </h1>

      <div className="grid gap-4 max-w-md">

        <Link href="/admin/create-tournament" className="border p-3 rounded block">
          Create Tournament
        </Link>

        <Link href="/admin/registrations" className="border p-3 rounded block">
          View Registrations
        </Link>

        <Link href="/admin/approve-players" className="border p-3 rounded block">
          Approve Players
        </Link>

        <Link href="/admin/generate-bracket" className="border p-3 rounded block">
          Generate Bracket
        </Link>

        <Link href="/admin/matches" className="border p-3 rounded block">
          Manage Matches
        </Link>

      </div>

    </div>
  )
}