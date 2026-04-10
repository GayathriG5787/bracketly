"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCategory } from "@/utils/category"
import { Users, ChevronDown, ChevronRight, MapPin, Trophy } from "lucide-react"

export default function RegistrationsPage({ params }: any) {
  const { id: tournamentId } = use(params) as { id: string }
  const router = useRouter()

  const [registrations, setRegistrations] = useState<any[]>([])
  const [openAge, setOpenAge] = useState<string | null>(null)

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
      .select(`
        id, approved, category_key, age, weight, gender, belt_rank, district, 
        academy, student_type, school_name, college_name, age_category, weight_category,
        players ( id, name, email, phone, player_achievements (level, medal_type, year), player_participations (level, year) )
      `)
      .eq("tournament_id", tournamentId)

    if (!error) setRegistrations(data || [])
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const grouped: any = {}
  registrations.forEach((reg) => {
    const categoryKey = reg.category_key
    if (!categoryKey) return
    const gender = reg.gender
    const age = reg.age_category
    const weight = reg.weight_category

    if (!grouped[gender]) grouped[gender] = {}
    if (!grouped[gender][age]) grouped[gender][age] = {}
    if (!grouped[gender][age][weight]) grouped[gender][age][weight] = []
    grouped[gender][age][weight].push(reg)
  })

  return (
    <div className="max-w-5xl">
      {/* --- PAGE HEADER --- */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Player Registrations</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review and manage athlete brackets by age and weight category.
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
              const isOpen = openAge === ageKey
              
              // Count total players in this age category
              const totalInAge = Object.values(ageGroups).reduce((acc: number, curr: any) => acc + curr.length, 0)

              return (
                <div key={ageKey} className="overflow-hidden border border-slate-200 rounded-[1.25rem] bg-white transition-all">
                  <button
                    onClick={() => setOpenAge(isOpen ? null : ageKey)}
                    className={`w-full flex items-center justify-between p-5 transition-colors ${isOpen ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-slate-900">{age}</span>
                      <span className="text-xs text-slate-500">{totalInAge} Total Registered</span>
                    </div>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                      {(Array.isArray(WEIGHT_ORDER[age])
                        ? WEIGHT_ORDER[age]
                        : WEIGHT_ORDER[age][gender]
                      ).map((weight: string) => {
                        const players = ageGroups?.[weight] || []
                        const hasPlayers = players.length > 0

                        return (
                          <div
                            key={`${ageKey}-${weight}`}
                            className={`flex justify-between items-center p-3 rounded-xl transition-all ${
                              hasPlayers ? 'bg-white' : 'opacity-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${hasPlayers ? 'bg-blue-50 text-[#4169E1]' : 'bg-slate-50 text-slate-400'}`}>
                                {players.length}
                              </div>
                              <span className="text-sm font-medium text-slate-700">{weight}</span>
                            </div>

                            {hasPlayers && (
                              <button
                                onClick={() => {
                                  const categoryKey = players[0]?.category_key
                                  if (categoryKey) router.push(`/admin/tournaments/${tournamentId}/registrations/${categoryKey}`)
                                }}
                                className="flex items-center gap-1 text-[#4169E1] hover:bg-[#4169E1] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                              >
                                View
                                <ChevronRight size={14} />
                              </button>
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