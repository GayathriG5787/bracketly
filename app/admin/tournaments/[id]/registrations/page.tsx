"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCategory } from "@/utils/category"

export default function RegistrationsPage({ params }: any) {

  const { id: tournamentId } = use(params) as { id: string }
  const router = useRouter()

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

                          <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
                            <span>{weight} ({players.length})</span>

                            {players.length > 0 && (
                              <button
                                onClick={() => {
                                  const categoryKey = players[0]?.category_key

                                  if (!categoryKey) return

                                  router.push(
                                    `/admin/tournaments/${tournamentId}/registrations/${categoryKey}`
                                  )
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                              >
                                View Players
                              </button>
                            )}
                          </div>

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