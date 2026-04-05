"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PlayersListPage() {
  const { id, categoryKey } = useParams()
  const router = useRouter()

  const [players, setPlayers] = useState<any[]>([])

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select(`
        id,
        category_key,
        players (
          id,
          name,
          district,
          belt_rank
        )
      `)
      .eq("tournament_id", id)
      .eq("category_key", categoryKey)

    if (!error) setPlayers(data || [])
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-4">
        Players - {categoryKey}
      </h1>

      <div className="space-y-3">

        {players.length === 0 && (
          <p>No players in this category</p>
        )}

        {players.map((reg: any) => (
          <div
            key={reg.players.id}
            onClick={() =>
              router.push(
                `/admin/tournaments/${id}/registrations/${categoryKey}/${reg.players.id}`
              )
            }
            className="border p-3 rounded cursor-pointer hover:bg-gray-100"
          >
            <p><strong>Name:</strong> {reg.players.name}</p>
            <p><strong>District:</strong> {reg.players.district}</p>
            <p><strong>Belt:</strong> {reg.players.belt_rank}</p>
          </div>
        ))}

      </div>

    </div>
  )
}