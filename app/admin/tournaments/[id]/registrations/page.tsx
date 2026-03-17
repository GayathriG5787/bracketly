"use client"

import { use, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function RegistrationsPage({ params }: any) {

  const { id: tournamentId } = use(params) as { id: string }

  const [registrations, setRegistrations] = useState<any[]>([])

  const fetchRegistrations = async () => {

    const { data, error } = await supabase
      .from("registrations")
      .select(`
        id,
        approved,
        players (
          id,
          name,
          age,
          weight,
          gender,
          belt_rank,
          email,
          phone,
          player_achievements (
            level,
            medal_type,
            year
          ),
          player_participations (
            level,
            year
          )
        )
      `)
      .eq("tournament_id", tournamentId) // ✅ IMPORTANT FIX

    if (error) {
      console.error(error)
    } else {
      setRegistrations(data || [])
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const approvePlayer = async (id: string) => {

    const { error } = await supabase
      .from("registrations")
      .update({ approved: true })
      .eq("id", id)

    if (error) {
      console.error(error)
    } else {
      fetchRegistrations()
    }
  }

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Player Registrations
      </h1>

      <div className="space-y-6">

        {registrations.map((reg) => {

          const participations = reg.players.player_participations || []

          const districtCount = participations.filter((p:any) => p.level === "district").length
          const stateCount = participations.filter((p:any) => p.level === "state").length
          const nationalCount = participations.filter((p:any) => p.level === "national").length

          return (

            <div key={reg.id} className="border p-4 rounded">

              <h2 className="text-lg font-semibold mb-2">
                Player Details
              </h2>

              <p><strong>Name:</strong> {reg.players.name}</p>
              <p><strong>Email:</strong> {reg.players.email}</p>
              <p><strong>Phone:</strong> {reg.players.phone}</p>
              <p><strong>Age:</strong> {reg.players.age}</p>
              <p><strong>Weight:</strong> {reg.players.weight}</p>
              <p><strong>Gender:</strong> {reg.players.gender}</p>
              <p><strong>Belt Rank:</strong> {reg.players.belt_rank}</p>

              <h3 className="font-semibold mt-4">
                Participations
              </h3>

              <p>District: {districtCount}</p>
              <p>State: {stateCount}</p>
              <p>National: {nationalCount}</p>

              <h3 className="font-semibold mt-4">
                Achievements
              </h3>

              {reg.players.player_achievements.length === 0 && (
                <p>No achievements</p>
              )}

              {reg.players.player_achievements.map((ach:any, index:number) => (
                <p key={index}>
                  {ach.level} {ach.medal_type} ({ach.year})
                </p>
              ))}

              {!reg.approved && (
                <button
                  onClick={() => approvePlayer(reg.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded mt-4"
                >
                  Approve
                </button>
              )}

              {reg.approved && (
                <span className="text-green-600 font-semibold mt-4 block">
                  Approved
                </span>
              )}

            </div>

          )

        })}

      </div>

    </div>
  )
}