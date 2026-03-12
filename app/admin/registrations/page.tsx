"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function RegistrationsPage() {

  const [registrations, setRegistrations] = useState<any[]>([])

  const fetchRegistrations = async () => {

    const { data, error } = await supabase
      .from("registrations")
      .select(`
        id,
        approved,
        players (
          name,
          age,
          weight,
          gender,
          belt_rank
        )
      `)

    if (error) {
      console.error(error)
    } else {
      setRegistrations(data)
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

      <div className="space-y-4">

        {registrations.map((reg) => (

          <div key={reg.id} className="border p-4 rounded">

            <p><strong>Name:</strong> {reg.players.name}</p>
            <p><strong>Age:</strong> {reg.players.age}</p>
            <p><strong>Weight:</strong> {reg.players.weight}</p>
            <p><strong>Gender:</strong> {reg.players.gender}</p>
            <p><strong>Belt Rank:</strong> {reg.players.belt_rank}</p>

            {!reg.approved && (
              <button
                onClick={() => approvePlayer(reg.id)}
                className="bg-green-600 text-white px-3 py-1 rounded mt-2"
              >
                Approve
              </button>
            )}

            {reg.approved && (
              <span className="text-green-600 font-semibold">
                Approved
              </span>
            )}

          </div>

        ))}

      </div>

    </div>
  )
}