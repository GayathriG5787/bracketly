"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Tournament = {
  id: string
  name: string
  location: string
  tournament_date: string
  level: string
}

export default function TournamentsPage() {

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {

    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("tournament_date", { ascending: true })

    if (error) {
      console.error(error)
    } else {
      setTournaments(data || [])
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="p-8">Loading tournaments...</div>
  }

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Tournaments
      </h1>

      {tournaments.length === 0 ? (
        <p>No tournaments available</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-2">
                {tournament.name}
              </h2>

              <p className="text-gray-600 mb-1">
                📍 {tournament.location}
              </p>

              <p className="text-gray-600 mb-1">
                📅 {new Date(tournament.tournament_date).toDateString()}
              </p>

              {tournament.level && (
                <p className="text-sm mb-3">
                  🏆 {tournament.level} Level
                </p>
              )}

              <Link
                href={`/register/${tournament.id}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Register
              </Link>

            </div>
          ))}

        </div>
      )}

    </div>
  )
}