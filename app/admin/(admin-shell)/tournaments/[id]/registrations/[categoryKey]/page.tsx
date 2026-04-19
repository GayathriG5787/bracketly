"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ChevronLeft, User, MapPin, Award, ChevronRight, CheckCircle, Clock } from "lucide-react"

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

              {/* CENTER: District (Hidden on mobile, centered on desktop) */}
              <div className="hidden md:flex justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-xs font-semibold tracking-wide uppercase">{reg.district}</span>
                </div>
              </div>

              {/* RIGHT: Status & Chevron */}
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