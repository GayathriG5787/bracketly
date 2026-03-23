"use client"

import { use, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { generateBracket } from "@/lib/generateBracket"

export default function BracketsPage({ params }: any) {

  const { id: tournamentId } = use(params) as { id: string }

  const [registrations, setRegistrations] = useState<any[]>([])
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
          gender,
          age_category,
          weight_category,
          category_key
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

  // ✅ GROUP DATA (same as registrations page)
  const grouped: any = {}

  registrations.forEach((reg) => {

    if (!reg.approved) return // ✅ ONLY approved players

    const p = reg.players
    if (!p?.category_key) return

    const gender = p.gender
    const age = p.age_category
    const weight = p.weight_category

    if (!grouped[gender]) grouped[gender] = {}
    if (!grouped[gender][age]) grouped[gender][age] = {}
    if (!grouped[gender][age][weight]) grouped[gender][age][weight] = []

    grouped[gender][age][weight].push(p)
  })

  // ✅ GENERATE BRACKET HANDLER
  const handleGenerate = async (
    gender: string,
    age: string,
    weight: string
  ) => {

    const categoryKey = `${gender}-${age}-${weight}`

    const res = await generateBracket(tournamentId, categoryKey)

    alert(res.message)
  }

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Manage Brackets
      </h1>

      <div className="space-y-6">

        {Object.entries(grouped).map(([gender, ageGroups]: any) => (

          <div key={gender} className="mb-6">

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

                  {openAge === ageKey && (
                    <div className="ml-4 mt-2 space-y-2">

                      {Object.entries(weightGroups).map(([weight, players]: any) => {

                        const weightKey = `${ageKey}-${weight}`

                        return (
                          <div key={weightKey}>

                            {/* WEIGHT HEADER + BUTTON */}
                            <div
                              onClick={() => setOpenWeight(openWeight === weightKey ? null : weightKey)}
                              className="cursor-pointer bg-gray-100 p-2 rounded flex justify-between items-center"
                            >
                              <span>
                                {weight} ({players.length})
                              </span>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation() // 🔥 prevent accordion toggle
                                  handleGenerate(gender, age, weight)
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                              >
                                Generate Bracket
                              </button>
                            </div>

                            {/* PLAYERS */}
                            {openWeight === weightKey && (
                              <div className="ml-4 mt-2 space-y-1">

                                {players.map((p: any) => (
                                  <div key={p.id} className="border p-2 rounded">
                                    {p.name}
                                  </div>
                                ))}

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