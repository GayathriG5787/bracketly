"use client"

import { use, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { generateBracket } from "@/lib/generateBracket"
import { useRouter } from "next/navigation"

export default function BracketsPage({ params }: any) {

  const { id: tournamentId } = use(params) as { id: string }

  const [registrations, setRegistrations] = useState<any[]>([])
  const [openAge, setOpenAge] = useState<string | null>(null)
  const [openWeight, setOpenWeight] = useState<string | null>(null)

  const [loadingCategory, setLoadingCategory] = useState<string | null>(null)
  const [generatedCategories, setGeneratedCategories] = useState<Set<string>>(new Set())

  const router = useRouter()

  // ✅ ORDER DEFINITIONS
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
            gender,
            age_category,
            weight_category
          )
        `)
        .eq("tournament_id", tournamentId)

      if (error) {
        console.error("Fetch error:", error)
        return
      }
      
      setRegistrations(data || [])
    }

  const fetchGeneratedCategories = async () => {
  const { data } = await supabase
    .from("matches")
    .select("category_key")
    .eq("tournament_id", tournamentId)

  setGeneratedCategories(new Set(data?.map((m: any) => m.category_key)))
}

useEffect(() => {
  fetchRegistrations()
  fetchGeneratedCategories()
}, [])

  // ✅ GROUPING
  const grouped: any = {}

  registrations.forEach((reg) => {
    if (!reg.approved) return

    const p = reg.players
    const categoryKey = reg.category_key

    if (!categoryKey) return

    const { gender, age_category: age, weight_category: weight } = p

    if (!grouped[gender]) grouped[gender] = {}
    if (!grouped[gender][age]) grouped[gender][age] = {}
    if (!grouped[gender][age][weight]) grouped[gender][age][weight] = []

    grouped[gender][age][weight].push({
      ...p,
      category_key: categoryKey   // ✅ attach manually
    })
  })

  const handleGenerate = async (players: any[]) => {
    const categoryKey = players[0].category_key

    if (loadingCategory === categoryKey) return

    if (generatedCategories.has(categoryKey)) {
      router.push(`/admin/tournaments/${tournamentId}/brackets/${categoryKey}`)
      return
    }

    setLoadingCategory(categoryKey)

    const res = await generateBracket(tournamentId, categoryKey)

    setLoadingCategory(null)

    if (!res.success) {
      alert(res.message)
      return
    }

    setGeneratedCategories(prev => new Set(prev).add(categoryKey))

    router.push(`/admin/tournaments/${tournamentId}/brackets/${categoryKey}`)
  }

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">Manage Brackets</h1>

      {["Male", "Female"].map((gender) => (

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
                      const categoryKey = players[0]?.category_key

                      const isLoading = loadingCategory === categoryKey
                      const isGenerated = generatedCategories.has(categoryKey)

                      return (
                        <div key={weightKey}>

                          <div
                            onClick={() => setOpenWeight(openWeight === weightKey ? null : weightKey)}
                            className="cursor-pointer bg-gray-100 p-2 rounded flex justify-between items-center"
                          >
                            <span>{weight} ({players.length})</span>

                            {players.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleGenerate(players)
                                }}
                                disabled={isLoading}
                                className={`px-3 py-1 rounded text-white ${
                                  isLoading
                                    ? "bg-gray-400"
                                    : isGenerated
                                    ? "bg-green-600"
                                    : "bg-blue-600"
                                }`}
                              >
                                {isLoading
                                  ? "Generating..."
                                  : isGenerated
                                  ? "View Bracket"
                                  : "Generate Bracket"}
                              </button>
                            )}

                          </div>

                          {openWeight === weightKey && players.length > 0 && (
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
  )
}