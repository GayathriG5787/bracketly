"use client"

import { use, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCategory } from "@/utils/category"

export default function RegistrationsPage({ params }: any) {

  const { id: tournamentId } = use(params) as { id: string }

  const [registrations, setRegistrations] = useState<any[]>([])
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [openAge, setOpenAge] = useState<string | null>(null)
  const [openWeight, setOpenWeight] = useState<string | null>(null)

  // ✅ ORDER DEFINITIONS (NEW)
  const AGE_ORDER = ["Infant", "Sub-Junior", "Cadet", "Junior", "Senior"]

  const WEIGHT_ORDER: any = {
    Infant: ["Under 17kg","Under 19kg","Under 21kg","Under 23kg","Over 23kg"],

    "Sub-Junior": {
      Male: ["Under 16kg","Under 18kg","Under 21kg","Under 23kg","Under 25kg","Under 27kg","Under 29kg","Under 32kg","Under 35kg","Under 38kg","Under 41kg","Under 44kg","Under 50kg","Over 50kg"],
      Female: ["Under 14kg","Under 16kg","Under 18kg","Under 20kg","Under 22kg","Under 24kg","Under 26kg","Under 29kg","Under 32kg","Under 35kg","Under 38kg","Under 41kg","Under 47kg","Over 47kg"]
    },

    Cadet: {
      Male: ["Under 33kg","Under 37kg","Under 41kg","Under 45kg","Under 49kg","Under 53kg","Under 57kg","Under 61kg","Under 65kg","Over 65kg"],
      Female: ["Under 29kg","Under 33kg","Under 37kg","Under 41kg","Under 44kg","Under 47kg","Under 51kg","Under 55kg","Under 59kg","Over 59kg"]
    },

    Junior: {
      Male: ["Under 45kg","Under 48kg","Under 51kg","Under 55kg","Under 59kg","Under 63kg","Under 68kg","Under 73kg","Under 78kg","Over 78kg"],
      Female: ["Under 42kg","Under 44kg","Under 46kg","Under 49kg","Under 52kg","Under 55kg","Under 59kg","Under 63kg","Under 68kg","Over 68kg"]
    },

    Senior: {
      Male: ["Under 54kg","Under 58kg","Under 63kg","Under 68kg","Under 74kg","Under 80kg","Under 87kg","Over 87kg"],
      Female: ["Under 46kg","Under 49kg","Under 53kg","Under 57kg","Under 62kg","Under 67kg","Under 73kg","Over 73kg"]
    }
  }

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select(`
        id,
        approved,
        category_key,
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
          player_achievements (level, medal_type, year),
          player_participations (level, year)
        )
      `)
      .eq("tournament_id", tournamentId)
      

    if (!error) setRegistrations(data || [])
      
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const approvePlayer = async (regId: string, player: any) => {
    const { age_category, weight_category, category_key } = getCategory(player)

    // ✅ Update player (ONLY category details that belong to player)
    const { error: playerError } = await supabase
      .from("players")
      .update({
        age_category,
        weight_category
      })
      .eq("id", player.id)

    if (playerError) {
      console.error("Player update error:", playerError)
      return
    }

    // ✅ Update registration (category_key + approval)
    const { error: regError } = await supabase
      .from("registrations")
      .update({
        category_key,
        approved: true
      })
      .eq("id", regId)

    if (regError) {
      console.error("Registration update error:", regError)
      return
    }

    // 🔄 Refresh UI
    fetchRegistrations()
  }

  // ✅ GROUPING (UNCHANGED)
  const grouped: any = {}

  registrations.forEach((reg) => {
  const p = reg.players
  const categoryKey = reg.category_key  // ✅ FIX

  if (!categoryKey) return  

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

      <div className="space-y-6">

      {["Male","Female"].map((gender) => (

        <div key={gender} className="mb-6">

          <h2 className="text-xl font-bold mb-2">{gender}</h2>

          {AGE_ORDER.map((age) => {

            const ageGroups = grouped[gender]?.[age] || {} // ✅ FIXED
            const ageKey = `${gender}-${age}`

            return (
              <div key={ageKey} className="mb-3">

                <div
                  onClick={() => setOpenAge(openAge === ageKey ? null : ageKey)}
                  className="cursor-pointer bg-gray-200 p-3 rounded flex justify-between"
                >
                  <span>{age}</span>
                  <span>{openAge === ageKey ? "▲" : "▼"}</span>
                </div>

                {openAge === ageKey && (
                  <div className="ml-4 mt-2 space-y-2">

                    {(Array.isArray(WEIGHT_ORDER[age])
                      ? WEIGHT_ORDER[age]
                      : WEIGHT_ORDER[age][gender]
                    ).map((weight: string) => {

                      const players = ageGroups?.[weight] || [] // ✅ FIXED
                      const weightKey = `${ageKey}-${weight}`

                      return (
                        <div key={weightKey}>

                          <div
                            onClick={() => setOpenWeight(openWeight === weightKey ? null : weightKey)}
                            className="cursor-pointer bg-gray-100 p-2 rounded flex justify-between"
                          >
                            <span>{weight} ({players.length})</span>
                            <span>{openWeight === weightKey ? "▲" : "▼"}</span>
                          </div>

                          {openWeight === weightKey && players.length > 0 && (
                            <div className="ml-4 mt-2 space-y-2">

                              {players.map((reg: any) => {

                                const participations = reg.players.player_participations || []

                                const districtCount = participations.filter((p:any) => p.level === "district").length
                                const stateCount = participations.filter((p:any) => p.level === "state").length
                                const nationalCount = participations.filter((p:any) => p.level === "national").length

                                return (
                                  <div key={reg.id} className="border p-4 rounded">

                                    {/* ✅ YOUR ORIGINAL UI (UNCHANGED) */}
                                    <h3 className="font-semibold mb-2">Player Details</h3>

                                    <p><strong>Name:</strong> {reg.players.name}</p>
                                    <p><strong>Email:</strong> {reg.players.email}</p>
                                    <p><strong>Phone:</strong> {reg.players.phone}</p>
                                    <p><strong>District:</strong> {reg.players.district}</p>

                                    <p><strong>Age:</strong> {reg.players.age}</p>
                                    <p><strong>Weight:</strong> {reg.players.weight}</p>
                                    <p><strong>Gender:</strong> {reg.players.gender}</p>
                                    <p><strong>Belt Rank:</strong> {reg.players.belt_rank}</p>

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

                                    <h4 className="font-semibold mt-3">Participations</h4>

                                    <p>District: {districtCount}</p>
                                    <p>State: {stateCount}</p>
                                    <p>National: {nationalCount}</p>

                                    <h4 className="font-semibold mt-3">Achievements</h4>

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