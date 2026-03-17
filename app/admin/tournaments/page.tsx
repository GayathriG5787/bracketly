"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function AdminTournamentsPage() {

  const [tournaments, setTournaments] = useState<any[]>([])

  const fetchTournaments = async () => {

    const { data } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false })

    setTournaments(data || [])
  }

  useEffect(() => {
    fetchTournaments()
  }, [])

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Tournaments
      </h1>

      <div className="space-y-4">

        {tournaments.map((t) => (

          <Link
            key={t.id}
            href={`/admin/tournaments/${t.id}`}
            className="border p-4 rounded block hover:bg-gray-100"
          >
            {t.name}
          </Link>

        ))}

      </div>

    </div>
  )
}