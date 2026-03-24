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

    // ✅ Group matches by round
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

              {/* ROUND TITLE */}
              <h2 className="text-center font-semibold">
                Round {roundNumber}
              </h2>

              {/* MATCHES */}
              {matches.map((match: any) => {

                const isP1Winner = match.winner_id === match.player1_id
                const isP2Winner = match.winner_id === match.player2_id

                return (
                  <div
                    key={match.id}
                    className="bg-white shadow-md rounded-lg p-3 w-52"
                  >

                    {/* PLAYER 1 */}
                    <div className={`p-1 border-b ${
                      isP1Winner ? "font-bold text-green-600" : ""
                    }`}>
                      {match.player1?.name || "TBD"}
                    </div>

                    {/* PLAYER 2 */}
                    <div className={`p-1 ${
                      isP2Winner ? "font-bold text-green-600" : ""
                    }`}>
                      {match.player2?.name || "TBD"}
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