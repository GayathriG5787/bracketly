"use client"

import { use } from "react"
import Link from "next/link"

export default function TournamentAdminPage({ params }: any) {

  const { id: tournamentId } = use(params) as { id: string }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Tournament Management
      </h1>

      <div className="grid gap-4 max-w-md">

        {/* ✅ View Registrations (with approve inside) */}
        <Link
          href={`/admin/tournaments/${tournamentId}/registrations`}
          className="border p-3 rounded block hover:bg-gray-100"
        >
          View Registrations
        </Link>

        {/* ✅ Combined Bracket Control Panel */}
        <Link
          href={`/admin/tournaments/${tournamentId}/brackets`}
          className="border p-3 rounded block hover:bg-gray-100"
        >
          Manage Brackets
        </Link>

      </div>

    </div>
  )
}