"use client"

import { use, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCategory } from "@/utils/category" // ✅ NEW

export default function RegistrationsPage({ params }: any) {

  const { id: tournamentId } = use(params) as { id: string }

  const [registrations, setRegistrations] = useState<any[]>([])
  const [openCategory, setOpenCategory] = useState<string | null>(null)

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
          age_category,
          weight_category,
          category_key,
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
      .eq("tournament_id", tournamentId)

    if (error) {
      console.error(error)
    } else {
      setRegistrations(data || [])
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  // ✅ UPDATED APPROVE LOGIC (STEP 3 IMPLEMENTED)
  const approvePlayer = async (regId: string, player: any) => {

    // 🔹 1. Generate category
    const { age_category, weight_category, category_key } = getCategory(player)

    // 🔹 2. Update PLAYER table (IMPORTANT)
    const { error: playerError } = await supabase
      .from("players")
      .update({
        age_category,
        weight_category,
        category_key
      })
      .eq("id", player.id)

    if (playerError) {
      console.error(playerError)
      return
    }

    // 🔹 3. Mark registration as approved
    const { error: regError } = await supabase
      .from("registrations")
      .update({ approved: true })
      .eq("id", regId)

    if (regError) {
      console.error(regError)
    } else {
      fetchRegistrations()
    }
  }

// Temporary thing, remove it later

const backfillCategories = async () => {
  const { data: players, error } = await supabase
    .from("players")
    .select("*")

  if (error) {
    console.error(error)
    return
  }

  const updates = players.map((player) => {
    const { age_category, weight_category, category_key } = getCategory(player)

    return supabase
      .from("players")
      .update({
        age_category,
        weight_category,
        category_key
      })
      .eq("id", player.id)
  })

  const results = await Promise.all(updates)

  results.forEach((res, index) => {
    if (res.error) {
      console.error(`Error updating player ${players[index].id}`, res.error)
    }
  })

  console.log("✅ Backfill completed")
}

const grouped: any = {}

registrations.forEach((reg) => {
  const p = reg.players

  if (!p?.category_key) return

  if (!grouped[p.category_key]) {
    grouped[p.category_key] = {
      category: {
        age: p.age_category,
        gender: p.gender,
        weight: p.weight_category
      },
      players: []
    }
  }

  grouped[p.category_key].players.push(reg)
})

const groupedArray = Object.entries(grouped)

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Player Registrations
      </h1>

      <button
        onClick={backfillCategories}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Run Category Backfill
      </button>

      <div className="space-y-6">

{groupedArray.map(([key, group]: any) => {

  return (

    <div key={key} className="border p-4 rounded">

    <div
      onClick={() => setOpenCategory(openCategory === key ? null : key)}
      className="cursor-pointer bg-gray-100 p-3 rounded flex justify-between items-center"
    >
      <span>
        {group.category.age} - {group.category.gender} - {group.category.weight}
        ({group.players.length})
      </span>

      <span>
        {openCategory === key ? "▲" : "▼"}
      </span>
    </div>

      {openCategory === key && (
        <div className="mt-4 space-y-4">
          {group.players.map((reg: any) => {

        const participations = reg.players.player_participations || []

        const districtCount = participations.filter((p:any) => p.level === "district").length
        const stateCount = participations.filter((p:any) => p.level === "state").length
        const nationalCount = participations.filter((p:any) => p.level === "national").length

        return (

          <div key={reg.id} className="border p-4 rounded mb-4">

            <h3 className="text-md font-semibold mb-2">
              Player Details
            </h3>

            <p><strong>Name:</strong> {reg.players.name}</p>
            <p><strong>Email:</strong> {reg.players.email}</p>
            <p><strong>Phone:</strong> {reg.players.phone}</p>
            <p><strong>Age:</strong> {reg.players.age}</p>
            <p><strong>Weight:</strong> {reg.players.weight}</p>
            <p><strong>Gender:</strong> {reg.players.gender}</p>
            <p><strong>Belt Rank:</strong> {reg.players.belt_rank}</p>

            <h4 className="font-semibold mt-4">
              Participations
            </h4>

            <p>District: {districtCount}</p>
            <p>State: {stateCount}</p>
            <p>National: {nationalCount}</p>

            <h4 className="font-semibold mt-4">
              Achievements
            </h4>

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
                onClick={() => approvePlayer(reg.id, reg.players)}
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
)}

    </div>

  )
})}

      </div>

    </div>
  )
}