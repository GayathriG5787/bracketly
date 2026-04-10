"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ChevronLeft, User, MapPin, Award, School, ChevronRight } from "lucide-react"

export default function PlayersListPage() {
  const { id, categoryKey } = useParams()
  const router = useRouter()

  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlayers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("registrations")
      .select(`
        id,
        category_key,
        district,
        belt_rank,
        academy,
        school_name,
        college_name,
        players (
          id,
          name,
          email
        )
      `)
      .eq("tournament_id", id)
      .eq("category_key", categoryKey)

    if (!error) setPlayers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  // Parse categoryKey for a cleaner title (e.g., Male-Senior-Under 54kg)
  const displayCategory = String(categoryKey).replace(/-/g, " • ")

  return (
    <div className="max-w-5xl">
      {/* --- BACK BUTTON & HEADER --- */}
      <button 
        onClick={() => router.back()}
        className="flex items-center text-slate-500 hover:text-[#4169E1] transition-colors mb-6 text-sm font-medium gap-1"
      >
        <ChevronLeft size={16} />
        Back to Divisions
      </button>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4169E1] text-xs font-bold uppercase tracking-wider mb-3">
          <Award size={14} />
          {displayCategory}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Registered Athletes</h1>
        <p className="text-slate-500 text-sm mt-1">
          {players.length} {players.length === 1 ? 'competitor' : 'competitors'} found for this weight class.
        </p>
      </div>

      {/* --- PLAYERS LIST --- */}
      <div className="grid gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 animate-pulse">Loading roster...</div>
        ) : players.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-[1.5rem] py-20 text-center">
            <User size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No players registered in this category yet.</p>
          </div>
        ) : (
          players.map((reg: any) => (
            <div
              key={reg.id}
              onClick={() =>
                router.push(`/admin/tournaments/${id}/registrations/${categoryKey}/${reg.players.id}`)
              }
              className="group bg-white border border-slate-200 p-5 rounded-[1.5rem] hover:border-[#4169E1] hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-[#4169E1] transition-colors">
                  <User size={24} />
                </div>

                <div className="grid md:grid-cols-3 gap-4 md:gap-12">
                  {/* Name & Contact */}
                  <div className="min-w-[180px]">
                    <h3 className="font-bold text-slate-900 group-hover:text-[#4169E1] transition-colors">
                      {reg.players?.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{reg.players?.email}</p>
                  </div>

                  {/* Belt & District */}
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      {reg.belt_rank} Belt
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <MapPin size={12} />
                      {reg.district}
                    </div>
                  </div>

                  {/* Affiliation */}
                  <div className="hidden md:flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <School size={14} className="text-slate-400" />
                      <span className="truncate max-w-[150px]">
                        {reg.academy || reg.school_name || reg.college_name || "Independent"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-tighter text-slate-300 group-hover:text-[#4169E1] transition-colors">
                  View Profile
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-white group-hover:bg-[#4169E1] transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}