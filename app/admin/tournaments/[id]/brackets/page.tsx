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

  // 🔥 NEW STATES
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null)
  const [generatedCategories, setGeneratedCategories] = useState<Set<string>>(new Set())

  const router = useRouter()

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

    if (error) console.error(error)
    else setRegistrations(data || [])
  }

  // 🔥 FETCH GENERATED CATEGORIES
  const fetchGeneratedCategories = async () => {
    const { data } = await supabase
      .from("matches")
      .select("category_key")
      .eq("tournament_id", tournamentId)

    const set = new Set(data?.map((m: any) => m.category_key))
    setGeneratedCategories(set)
  }

  useEffect(() => {
    fetchRegistrations()
    fetchGeneratedCategories()
  }, [])

  // ✅ GROUP DATA
  const grouped: any = {}

  registrations.forEach((reg) => {
    if (!reg.approved) return

    const p = reg.players
    if (!p?.category_key) return

    const { gender, age_category: age, weight_category: weight } = p

    if (!grouped[gender]) grouped[gender] = {}
    if (!grouped[gender][age]) grouped[gender][age] = {}
    if (!grouped[gender][age][weight]) grouped[gender][age][weight] = []

    grouped[gender][age][weight].push(p)
  })

  // 🔥 UPDATED GENERATE HANDLER
  const handleGenerate = async (players: any[]) => {

    if (!players || players.length === 0) return

  const categoryKey = players[0].category_key

    // 🚫 Prevent multiple clicks
    if (loadingCategory === categoryKey) return

    // 🚫 Already generated → go to view
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

    // ✅ Mark as generated
    setGeneratedCategories(prev => new Set(prev).add(categoryKey))

    // 🚀 Redirect
    router.push(`/admin/tournaments/${tournamentId}/brackets/${categoryKey}`)
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
                        const categoryKey = players[0]?.category_key

                        const isLoading = loadingCategory === categoryKey
                        const isGenerated = generatedCategories.has(categoryKey)

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