"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function PlayerBracketPage() {
  const params = useParams()

  const tournamentId = params.tournamentId as string
  const categoryKey = params.categoryKey as string

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
  
const getStyle = (name: string, isWinner: boolean) => {
if (name === "TBD" || name === "BYE") return "text-gray-400"
if (isWinner) return "font-bold text-green-600"
return ""
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

                    const p1Name = match.player1
                        ? match.player1.name
                        : match.round === 1
                        ? "BYE"
                        : "TBD"

                    const p2Name = match.player2
                        ? match.player2.name
                        : match.round === 1
                        ? "BYE"
                        : "TBD"

                return (
                  <div
                    key={match.id}
                    className="bg-white shadow-md rounded-lg p-3 w-52"
                  >

                    {/* PLAYER 1 */}
                    <div className={`p-1 border-b ${getStyle(p1Name, isP1Winner)}`}>
                        {p1Name}
                    </div>

                    {/* PLAYER 2 */}
                    <div className={`p-1 ${getStyle(p2Name, isP2Winner)}`}>
                        {p2Name}
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