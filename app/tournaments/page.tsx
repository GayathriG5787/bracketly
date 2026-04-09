"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { syncUser } from "@/lib/syncUser"

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

  const router = useRouter()

  useEffect(() => {
    fetchTournaments()
  }, [])

useEffect(() => {
  const run = async () => {
    await syncUser("player")
  }

  run()
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
    return <div className="py-8">Loading tournaments...</div>
  }

  return (
    <div className="p-8">

      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Browse Tournaments</h1>
        <p className="text-xl text-muted">
          Find and register for upcoming tournaments in your area.
        </p>
      </div>

      {tournaments.length === 0 ? (
        <p>No tournaments available</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          
        {tournaments.map((tournament) => (
        <div
          key={tournament.id}
          className="border border-border rounded-xl p-6 shadow-card hover:shadow-lg transition bg-white"
        >
          
          {/* Top Row */}
          <div className="flex justify-between items-center mb-4">
            
            {/* Level Badge */}
            <span className="text-xs px-3 py-1 rounded-full bg-background text-primary font-medium">
              {tournament.level || "Open"}
            </span>

            {/* Status */}
            <span className="text-success text-sm font-medium">
              ● Registration Open
            </span>

          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold mb-3">
            {tournament.name}
          </h2>

          {/* Location */}
          <p className="text-sm text-muted mb-1">
            📍 {tournament.location}
          </p>

          {/* Date */}
          <p className="text-sm text-muted mb-5">
            📅 {new Date(tournament.tournament_date).toDateString()}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            
            <Link
              href={`/tournaments/${tournament.id}`}
              className="flex-1 border border-border rounded-lg px-4 py-2 text-sm text-center hover:bg-background transition"
            >
              View Details
            </Link>

            <Link
              href={`/player/tournaments/${tournament.id}/register`}
              className="flex-1 bg-primary text-white rounded-lg px-4 py-2 text-sm text-center hover:bg-primary-dark transition"
            >
              Register
            </Link>

          </div>
        </div>
        ))}

        </div>
      )}

    </div>
  )
}