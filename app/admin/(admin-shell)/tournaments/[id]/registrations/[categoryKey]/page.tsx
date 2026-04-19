"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ChevronLeft, User, MapPin, Award, ChevronRight, CheckCircle, Clock, Filter } from "lucide-react"

export default function PlayersListPage() {
  const { id, categoryKey } = useParams()
  const router = useRouter()

  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all")

  const fetchPlayers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("registrations")
      .select(`
        id,
        district,
        approved,
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

  const filteredPlayers = players.filter((reg) => {
    if (filter === "approved") return reg.approved === true
    if (filter === "pending") return reg.approved === false
    return true
  })

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

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4169E1] text-xs font-bold uppercase tracking-wider mb-3">
            <Award size={14} />
            {displayCategory}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Registered Athletes</h1>
          <p className="text-slate-500 text-sm mt-1">
            {filteredPlayers.length} {filteredPlayers.length === 1 ? 'competitor' : 'competitors'} showing.
          </p>
        </div>

        {/* --- FILTER BUTTONS --- */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === "approved" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              filter === "pending" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* --- PLAYERS LIST --- */}
      <div className="grid gap-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 animate-pulse">Loading roster...</div>
        ) : filteredPlayers.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-[1.5rem] py-20 text-center">
            <User size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No players found matching this filter.</p>
          </div>
        ) : (
          filteredPlayers.map((reg: any) => (
            <div
              key={reg.id}
              onClick={() =>
                router.push(`/admin/tournaments/${id}/registrations/${categoryKey}/${reg.players.id}`)
              }
              className="group bg-white border border-slate-200 p-5 rounded-[1.5rem] hover:border-[#4169E1] hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer grid grid-cols-2 md:grid-cols-3 items-center"
            >
              {/* LEFT: Name & Avatar */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-blue-50 group-hover:text-[#4169E1] transition-colors shrink-0">
                  <User size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 group-hover:text-[#4169E1] transition-colors truncate">
                    {reg.players?.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{reg.players?.email}</p>
                </div>
              </div>

              {/* CENTER: District (Visually Clear Pill) */}
              <div className="hidden md:flex justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 text-[#4169E1]">
                  <MapPin size={13} />
                  <span className="text-[11px] font-bold tracking-wide uppercase">{reg.district}</span>
                </div>
              </div>

              {/* RIGHT: Status & Action */}
              <div className="flex items-center justify-end gap-6">
                <div>
                  {reg.approved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircle size={12} /> Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                      <Clock size={12} /> Pending
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-slate-300 group-hover:text-[#4169E1] transition-colors">
                    Details
                  </span>
                  <div className="text-slate-300 group-hover:text-[#4169E1] transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}