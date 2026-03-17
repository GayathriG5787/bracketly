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

        <Link
          href={`/admin/tournaments/${tournamentId}/registrations`}
          className="border p-3 rounded block"
        >
          View Registrations
        </Link>

        <Link
          href={`/admin/tournaments/${tournamentId}/approve-players`}
          className="border p-3 rounded block"
        >
          Approve Players
        </Link>

        <Link
          href={`/admin/tournaments/${tournamentId}/generate-bracket`}
          className="border p-3 rounded block"
        >
          Generate Bracket
        </Link>

        <Link
          href={`/admin/tournaments/${tournamentId}/matches`}
          className="border p-3 rounded block"
        >
          Manage Matches
        </Link>

        <Link
          href={`/tournaments/${tournamentId}/bracket`}
          className="border p-3 rounded block"
        >
          View Bracket
        </Link>

      </div>

    </div>
  )
}