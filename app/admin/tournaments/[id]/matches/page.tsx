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

  // ✅ Show BYE or TBD properly
  const getPlayerName = (player: any, round: number) => {
    if (player?.name) return player.name
    if (round === 1) return "BYE"
    return "TBD"
  }

  // ✅ Handle winner selection
  const handleWinner = async (match: any, winnerId: string) => {

    // 1. Update current match
    await supabase
      .from("matches")
      .update({
        winner_id: winnerId,
        walkover: false
      })
      .eq("id", match.id)

    // 2. Move winner to next match
    if (match.next_match_id) {

      const updateField =
        match.next_match_slot === 1 ? "player1_id" : "player2_id"

      await supabase
        .from("matches")
        .update({
          [updateField]: winnerId
        })
        .eq("id", match.next_match_id)
    }

    fetchMatches()
  }

  // ✅ Handle walkover (BYE)
  const handleWalkover = async (match: any, winnerId: string) => {

    await supabase
      .from("matches")
      .update({
        winner_id: winnerId,
        walkover: true
      })
      .eq("id", match.id)

    if (match.next_match_id) {

      const updateField =
        match.next_match_slot === 1 ? "player1_id" : "player2_id"

      await supabase
        .from("matches")
        .update({
          [updateField]: winnerId
        })
        .eq("id", match.next_match_id)
    }

    fetchMatches()
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

                {/* Match Display */}
                <div className="mb-2">
                  {getPlayerName(match.player1, match.round)} vs {getPlayerName(match.player2, match.round)}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">

                  {match.player1 && (
                    <button
                      onClick={() => handleWinner(match, match.player1_id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      {match.player1.name} Wins
                    </button>
                  )}

                  {match.player2 && (
                    <button
                      onClick={() => handleWinner(match, match.player2_id)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      {match.player2.name} Wins
                    </button>
                  )}

                  {/* Walkover (only when opponent missing) */}
                  {(match.player1 && !match.player2) && (
                    <button
                      onClick={() => handleWalkover(match, match.player1_id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Walkover
                    </button>
                  )}

                </div>

              </div>

            ))}

        </div>

      ))}

    </div>
  )
}