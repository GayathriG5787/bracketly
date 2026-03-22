"use client"

import { use, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCategory } from "@/utils/category" // ✅ NEW

export default function RegistrationsPage({ params }: any) {

  const { id: tournamentId } = use(params) as { id: string }

  const [registrations, setRegistrations] = useState<any[]>([])
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [openAge, setOpenAge] = useState<string | null>(null)
  const [openWeight, setOpenWeight] = useState<string | null>(null)

  const fetchRegistrations = async () => {

    const { data, error } = await supabase
      .from("registrations")
      .select(`
        id,
        approved,
        players (
          id,
          name,
          email,
          phone,
          district,
          age,
          weight,
          gender,
          belt_rank,

          student_type,
          school_name,
          college_name,
          academy,

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

  const gender = p.gender
  const age = p.age_category
  const weight = p.weight_category

  if (!grouped[gender]) grouped[gender] = {}
  if (!grouped[gender][age]) grouped[gender][age] = {}
  if (!grouped[gender][age][weight]) grouped[gender][age][weight] = []

  grouped[gender][age][weight].push(reg)
})

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

      {Object.entries(grouped).map(([gender, ageGroups]: any) => (

        <div key={gender} className="mb-6">

          {/* GENDER HEADER */}
          <h2 className="text-xl font-bold mb-2">{gender}</h2>

          {Object.entries(ageGroups).map(([age, weightGroups]: any) => {

            const ageKey = `${gender}-${age}`

            return (
              <div key={ageKey} className="mb-3">

                {/* AGE ACCORDION */}
                <div
                  onClick={() => setOpenAge(openAge === ageKey ? null : ageKey)}
                  className="cursor-pointer bg-gray-200 p-3 rounded flex justify-between"
                >
                  <span>{age}</span>
                  <span>{openAge === ageKey ? "▲" : "▼"}</span>
                </div>

                {/* WEIGHT LEVEL */}
                {openAge === ageKey && (
                  <div className="ml-4 mt-2 space-y-2">

                    {Object.entries(weightGroups).map(([weight, players]: any) => {

                      const weightKey = `${ageKey}-${weight}`

                      return (
                        <div key={weightKey}>

                          {/* WEIGHT ACCORDION */}
                          <div
                            onClick={() => setOpenWeight(openWeight === weightKey ? null : weightKey)}
                            className="cursor-pointer bg-gray-100 p-2 rounded flex justify-between"
                          >
                            <span>{weight} ({players.length})</span>
                            <span>{openWeight === weightKey ? "▲" : "▼"}</span>
                          </div>

                          {/* PLAYERS */}
                          {openWeight === weightKey && (
                            <div className="ml-4 mt-2 space-y-2">

                              {players.map((reg: any) => {

                                const participations = reg.players.player_participations || []

                                const districtCount = participations.filter((p:any) => p.level === "district").length
                                const stateCount = participations.filter((p:any) => p.level === "state").length
                                const nationalCount = participations.filter((p:any) => p.level === "national").length

                                return (
                                  <div key={reg.id} className="border p-4 rounded">

                                    <h3 className="font-semibold mb-2">Player Details</h3>

                                    <p><strong>Name:</strong> {reg.players.name}</p>
                                    <p><strong>Email:</strong> {reg.players.email}</p>
                                    <p><strong>Phone:</strong> {reg.players.phone}</p>
                                    <p><strong>District:</strong> {reg.players.district}</p>

                                    <p><strong>Age:</strong> {reg.players.age}</p>
                                    <p><strong>Weight:</strong> {reg.players.weight}</p>
                                    <p><strong>Gender:</strong> {reg.players.gender}</p>
                                    <p><strong>Belt Rank:</strong> {reg.players.belt_rank}</p>

                                    {/* 🎓 Background */}
                                    <h4 className="font-semibold mt-3">Background</h4>

                                    <p><strong>Student Type:</strong> {reg.players.student_type || "N/A"}</p>

                                    {reg.players.school_name && (
                                      <p><strong>School:</strong> {reg.players.school_name}</p>
                                    )}

                                    {reg.players.college_name && (
                                      <p><strong>College:</strong> {reg.players.college_name}</p>
                                    )}

                                    {reg.players.academy && (
                                      <p><strong>Academy:</strong> {reg.players.academy}</p>
                                    )}

                                    {/* 📊 Participations */}
                                    <h4 className="font-semibold mt-3">Participations</h4>

                                    <p>District: {districtCount}</p>
                                    <p>State: {stateCount}</p>
                                    <p>National: {nationalCount}</p>

                                    {/* 🏆 Achievements */}
                                    <h4 className="font-semibold mt-3">Achievements</h4>

                                    {reg.players.player_achievements.length === 0 && (
                                      <p>No achievements</p>
                                    )}

                                    {reg.players.player_achievements.map((ach:any, index:number) => (
                                      <p key={index}>
                                        {ach.level} {ach.medal_type} ({ach.year})
                                      </p>
                                    ))}

                                    {/* ✅ Approval */}
                                    {!reg.approved && (
                                      <button
                                        onClick={() => approvePlayer(reg.id, reg.players)}
                                        className="bg-green-600 text-white px-3 py-1 rounded mt-3"
                                      >
                                        Approve
                                      </button>
                                    )}

                                    {reg.approved && (
                                      <span className="text-green-600 font-semibold block mt-2">
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
                )}

              </div>
            )
          })}

        </div>
      ))}

      </div>

    </div>
  )
}