"use client"

import { use, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { generateBracket } from "@/lib/generateBracket"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, GitBranch, Loader2, CheckCircle2, Users, Eye } from "lucide-react"

export default function BracketsPage({ params }: any) {
  const { id: tournamentId } = use(params) as { id: string }
  const [registrations, setRegistrations] = useState<any[]>([])
  const [openAge, setOpenAge] = useState<string | null>(null)
  const [openWeight, setOpenWeight] = useState<string | null>(null)
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null)
  const [generatedCategories, setGeneratedCategories] = useState<Set<string>>(new Set())

  const router = useRouter()

  const AGE_ORDER = ["Infant", "Sub-Junior", "Cadet", "Junior", "Senior"]

  const WEIGHT_ORDER: any = {
    Infant: ["Under 17kg", "Under 19kg", "Under 21kg", "Under 23kg", "Over 23kg"],
    "Sub-Junior": {
      Male: ["Under 16kg", "Under 18kg", "Under 21kg", "Under 23kg", "Under 25kg", "Under 27kg", "Under 29kg", "Under 32kg", "Under 35kg", "Under 38kg", "Under 41kg", "Under 44kg", "Under 50kg", "Over 50kg"],
      Female: ["Under 14kg", "Under 16kg", "Under 18kg", "Under 20kg", "Under 22kg", "Under 24kg", "Under 26kg", "Under 29kg", "Under 32kg", "Under 35kg", "Under 38kg", "Under 41kg", "Under 47kg", "Over 47kg"]
    },
    Cadet: {
      Male: ["Under 33kg", "Under 37kg", "Under 41kg", "Under 45kg", "Under 49kg", "Under 53kg", "Under 57kg", "Under 61kg", "Under 65kg", "Over 65kg"],
      Female: ["Under 29kg", "Under 33kg", "Under 37kg", "Under 41kg", "Under 44kg", "Under 47kg", "Under 51kg", "Under 55kg", "Under 59kg", "Over 59kg"]
    },
    Junior: {
      Male: ["Under 45kg", "Under 48kg", "Under 51kg", "Under 55kg", "Under 59kg", "Under 63kg", "Under 68kg", "Under 73kg", "Under 78kg", "Over 78kg"],
      Female: ["Under 42kg", "Under 44kg", "Under 46kg", "Under 49kg", "Under 52kg", "Under 55kg", "Under 59kg", "Under 63kg", "Under 68kg", "Over 68kg"]
    },
    Senior: {
      Male: ["Under 54kg", "Under 58kg", "Under 63kg", "Under 68kg", "Under 74kg", "Under 80kg", "Under 87kg", "Over 87kg"],
      Female: ["Under 46kg", "Under 49kg", "Under 53kg", "Under 57kg", "Under 62kg", "Under 67kg", "Under 73kg", "Over 73kg"]
    }
  }

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select(`id, approved, category_key, gender, age_category, weight_category, players ( id, name )`)
      .eq("tournament_id", tournamentId)

    if (!error) setRegistrations(data || [])
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

  const grouped: any = {}
  registrations.forEach((reg) => {
    if (!reg.approved) return
    const categoryKey = reg.category_key
    if (!categoryKey) return
    const { gender, age_category: age, weight_category: weight } = reg

    if (!grouped[gender]) grouped[gender] = {}
    if (!grouped[gender][age]) grouped[gender][age] = {}
    if (!grouped[gender][age][weight]) grouped[gender][age][weight] = []

    grouped[gender][age][weight].push({ ...reg.players, category_key: categoryKey })
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
    <div className="max-w-5xl">
      {/* --- PAGE HEADER --- */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tournament Brackets</h1>
        <p className="text-slate-500 text-sm mt-1">
          Generate and manage competition brackets for each division.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {["Male", "Female"].map((gender) => (
          <div key={gender} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-1 h-6 rounded-full ${gender === 'Male' ? 'bg-[#4169E1]' : 'bg-pink-500'}`} />
              <h2 className="text-xl font-bold text-slate-900">{gender} Division</h2>
            </div>

            {AGE_ORDER.map((age) => {
              const ageGroups = grouped[gender]?.[age] || {}
              const ageKey = `${gender}-${age}`
              const isAgeOpen = openAge === ageKey
              const totalApproved = Object.values(ageGroups).reduce((acc: number, curr: any) => acc + curr.length, 0)

              return (
                <div key={ageKey} className="border border-slate-200 rounded-[1.25rem] bg-white overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenAge(isAgeOpen ? null : ageKey)}
                    className={`w-full flex items-center justify-between p-5 transition-colors ${isAgeOpen ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-slate-900">{age}</span>
                      <span className="text-xs text-slate-500">{totalApproved} Approved Players</span>
                    </div>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isAgeOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isAgeOpen && (
                    <div className="p-3 space-y-2 bg-white border-t border-slate-100">
                      {(Array.isArray(WEIGHT_ORDER[age]) ? WEIGHT_ORDER[age] : WEIGHT_ORDER[age][gender]).map((weight: string) => {
                        const players = ageGroups?.[weight] || []
                        const weightKey = `${ageKey}-${weight}`
                        const categoryKey = players[0]?.category_key
                        const isWeightOpen = openWeight === weightKey
                        const isLoading = loadingCategory === categoryKey
                        const isGenerated = generatedCategories.has(categoryKey)
                        const canGenerate = players.length >= 2

                        return (
                          <div key={weightKey} className={`rounded-xl border border-slate-100 ${players.length === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
                            <div 
                              onClick={() => setOpenWeight(isWeightOpen ? null : weightKey)}
                              className="cursor-pointer flex items-center justify-between p-3 hover:bg-slate-50 transition-colors rounded-xl"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isGenerated ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-[#4169E1]'}`}>
                                  {players.length}
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{weight}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* VIEW PLAYERS BUTTON */}
                                {players.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Added the ?filter=approved query parameter to the route
                                      router.push(`/admin/tournaments/${tournamentId}/registrations/${categoryKey}?filter=approved`)
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-sm"
                                  >
                                    <Eye size={14} />
                                    Players
                                  </button>
                                )}

                                {canGenerate && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleGenerate(players)
                                    }}
                                    disabled={isLoading}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                      isLoading ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                                      isGenerated ? "bg-green-600 text-white hover:bg-green-700" : "bg-[#4169E1] text-white hover:bg-[#3252b0]"
                                    }`}
                                  >
                                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : isGenerated ? <CheckCircle2 size={14} /> : <GitBranch size={14} />}
                                    {isLoading ? "Wait..." : isGenerated ? "View" : "Generate"}
                                  </button>
                                )}
                                <ChevronRight size={16} className={`text-slate-300 transition-transform ${isWeightOpen ? 'rotate-90' : ''}`} />
                              </div>
                            </div>

                            {isWeightOpen && players.length > 0 && (
                              <div className="px-3 pb-3 pt-1 space-y-1">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 ml-1">Roster</div>
                                {players.map((p: any) => (
                                  <div key={p.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100/50 text-sm text-slate-600">
                                    <Users size={12} className="text-slate-400" />
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