"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trophy, ChevronRight, MapPin } from "lucide-react"

export default function MyTournaments() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadTournaments = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/"); return; }

      const { data: playerData } = await supabase
        .from("players")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (playerData) {
        const { data: regData } = await supabase
          .from("registrations")
          .select(`id, approved, category_key, tournament:tournaments(id, name, location)`)
          .eq("player_id", playerData.id)

        const tournaments = (regData ?? []) as any[]
        const tournamentIds = tournaments.map((r) => r.tournament?.id).filter(Boolean)

        const { data: matches } = await supabase
          .from("matches")
          .select("tournament_id, category_key")
          .in("tournament_id", tournamentIds)

        const registrationsWithMatches = tournaments.map((reg) => ({
          ...reg,
          hasBracket: matches?.some((m) => m.tournament_id === reg.tournament?.id && m.category_key === reg.category_key)
        }))

        setRegistrations(registrationsWithMatches)
      }
      setLoading(false)
    }

    loadTournaments()
  }, [router])

  if (loading) return <div className="animate-pulse text-slate-400 text-xs font-bold uppercase tracking-widest p-10">Loading Tournaments...</div>

  return (
    <div className="space-y-10">
      {/* Header - Back button removed for Sidebar Layout compatibility */}
      <div className="border-l-4 border-[#4169E1] pl-6">
        <h1 className="text-3xl font-bold tracking-tighter text-slate-900">My Tournaments</h1>
        <p className="text-slate-500 font-medium mt-1">View status and live brackets for all your registered events.</p>
      </div>

      <section>
        {registrations.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-[2rem] py-16 text-center">
            <p className="text-slate-400 font-medium text-sm">You haven&apos;t joined any championships yet.</p>
            <button onClick={() => router.push('/tournaments')} className="mt-4 text-[#4169E1] font-bold text-xs uppercase tracking-widest hover:underline">Browse Tournaments</button>
          </div>
        ) : (
          <div className="grid gap-4">
            {registrations.map((reg) => (
              <div key={reg.id} className="group bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between transition-all hover:border-[#4169E1]">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${reg.approved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {reg.approved ? "Approved" : "Verification Pending"}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={10} /> {reg.tournament?.location || "TBD"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#4169E1] transition-colors">{reg.tournament?.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Division: {reg.category_key}</p>
                </div>

                <div className="mt-6 md:mt-0 flex items-center gap-4">
                  {reg.hasBracket ? (
                    <button
                      onClick={() => router.push(`/player/bracket/${reg.tournament.id}/${reg.category_key}`)}
                      className="px-6 py-2.5 bg-[#4169E1] text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      Live Bracket <ChevronRight size={14} />
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 italic">
                      Brackets Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}