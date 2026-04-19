"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Calendar, MapPin, Trophy, ChevronRight, Search } from "lucide-react"

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTournaments = async () => {
    const { data } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false })

    setTournaments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTournaments()
  }, [])

  if (loading) {
    return <div className="animate-pulse text-slate-400 text-xs font-bold uppercase tracking-widest p-8">Loading Tournament Records...</div>
  }

  return (
    <div className="max-w-6xl">
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tournaments</h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse and manage all hosted championships and weight categories.
          </p>
        </div>
        <Link 
          href="/admin/create-tournament"
          className="bg-[#4169E1] text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 w-fit"
        >
          + New Event
        </Link>
      </div>

      {/* --- TOURNAMENT LIST --- */}
      {tournaments.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-[2rem] py-20 text-center">
          <p className="text-slate-400 font-medium">No tournaments found. Create your first event to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/admin/tournaments/${t.id}`}
              className="group bg-white border border-slate-200 p-6 rounded-[1.5rem] flex flex-col md:flex-row md:items-center justify-between hover:border-[#4169E1] hover:shadow-lg hover:shadow-blue-500/5 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#4169E1] uppercase tracking-tighter">
                    {t.level || "Regional"}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={12} /> {t.tournament_date || "Date TBD"}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#4169E1] transition-colors">
                  {t.name}
                </h3>

                <div className="mt-2 flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <MapPin size={14} className="text-slate-400" />
                    {t.location || "Online / TBD"}
                  </div>
                </div>
              </div>

              <div className="mt-6 md:mt-0 flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5">Edit Details & Brackets</span>
                </div>
                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-[#4169E1] group-hover:border-[#4169E1] transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}