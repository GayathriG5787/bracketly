"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function BracketViewPage() {
  const params = useParams()

  const tournamentId = params.id as string
  const categoryKey = params.category_key as string

  const [rounds, setRounds] = useState<Record<number, any[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        round,
        position,
        player1_id,
        player2_id,
        winner_id,
        next_match_id,
        next_match_slot,
        walkover,
        player1:player1_id ( name ),
        player2:player2_id ( name )
      `)
      .eq("tournament_id", tournamentId)
      .eq("category_key", categoryKey)
      .order("round", { ascending: true })
      .order("position", { ascending: true })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const grouped: Record<number, any[]> = {}

    data.forEach((match: any) => {
      if (!grouped[match.round]) {
        grouped[match.round] = []
      }
      grouped[match.round].push(match)
    })

    setRounds(grouped)
    setLoading(false)
  }

  // ✅ Select Winner
  const handleSelectWinner = async (match: any, playerId: string) => {
    if (match.winner_id) return

    if (!confirm("Confirm winner?")) return

    try {
      // 1. Update winner
      await supabase
        .from("matches")
        .update({ winner_id: playerId, walkover: false })
        .eq("id", match.id)

      // 2. Move to next match
      if (match.next_match_id) {
        const field =
          match.next_match_slot === 1 ? "player1_id" : "player2_id"

        await supabase
          .from("matches")
          .update({ [field]: playerId })
          .eq("id", match.next_match_id)
      }

      fetchMatches()
    } catch (err) {
      console.error(err)
      alert("Error updating winner")
    }
  }

  if (loading) {
    return <div className="p-8">Loading bracket...</div>
  }

  return (
    <div className="p-8 overflow-x-auto">

      <h1 className="text-2xl font-bold mb-6">
        Bracket - {categoryKey}
      </h1>

      <div className="flex gap-10">

        {Object.entries(rounds).map(([round, matches]) => {

          const roundNumber = Number(round)

          return (
            <div key={round} className="flex flex-col gap-6">

              <h2 className="text-center font-semibold">
                Round {roundNumber}
              </h2>

              {matches.map((match: any) => {

                const isP1Winner = match.winner_id === match.player1_id
                const isP2Winner = match.winner_id === match.player2_id

                return (
                  <div
                    key={match.id}
                    className="bg-white shadow-md rounded-lg p-3 w-52"
                  >

                    {/* PLAYER 1 */}
                    <div
                    onClick={() => {
                        if (!match.player1_id || !match.player2_id) return
                        handleSelectWinner(match, match.player1_id)
                    }}
                    className={`p-1 border-b ${
                        !match.player1_id || !match.player2_id
                        ? "text-gray-400 cursor-not-allowed"
                        : isP1Winner
                        ? "font-bold text-green-600"
                        : "cursor-pointer hover:bg-gray-100"
                    }`}
                    >
                      {match.player1
                        ? match.player1.name
                        : match.round === 1
                        ? "BYE"
                        : "TBD"}
                    </div>

                    {/* PLAYER 2 */}
                    <div
                    onClick={() => {
                        if (!match.player1_id || !match.player2_id) return
                        handleSelectWinner(match, match.player2_id)
                    }}
                    className={`p-1 ${
                        !match.player1_id || !match.player2_id
                        ? "text-gray-400 cursor-not-allowed"
                        : isP2Winner
                        ? "font-bold text-green-600"
                        : "cursor-pointer hover:bg-gray-100"
                    }`}
                    >
                      {match.player2
                        ? match.player2.name
                        : match.round === 1
                        ? "BYE"
                        : "TBD"}
                    </div>

                  </div>
                )
              })}

            </div>
          )
        })}

      </div>

    </div>
  )
}