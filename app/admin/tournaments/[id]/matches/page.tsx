"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function MatchesPage() {

  const params = useParams()
  const tournamentId = params.id as string

  const [matches, setMatches] = useState<any[]>([])

  const fetchMatches = async () => {

    const { data } = await supabase
      .from("matches")
      .select(`
        *,
        player1:player1_id(name),
        player2:player2_id(name)
      `)
      .eq("tournament_id", tournamentId)
      .order("round")
      .order("position")

    setMatches(data || [])
  }

  useEffect(() => {
    if (tournamentId) {
      fetchMatches()
    }
  }, [tournamentId])

  const rounds = [...new Set(matches.map(m => m.round))]

  const getPlayerName = (player: any, round: number) => {
  if (player?.name) return player.name

  // Round 1 → missing player = BYE
  if (round === 1) return "BYE"

  // Future rounds → still unknown
  return "TBD"
}

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Manage Matches
      </h1>

      {rounds.map(round => (

        <div key={round} className="mb-6">

          <h2 className="font-semibold mb-2">
            Round {round}
          </h2>

          {matches
            .filter(m => m.round === round)
            .map(match => (

              <div key={match.id} className="border p-3 mb-2 rounded">

                {getPlayerName(match.player1, match.round)} vs {getPlayerName(match.player2, match.round)}

              </div>

            ))}

        </div>

      ))}

    </div>
  )
}