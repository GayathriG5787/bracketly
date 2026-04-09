"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Trophy, ShieldCheck, Clock, ChevronRight, MapPin } from "lucide-react"

export default function PlayerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [player, setPlayer] = useState<any>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/"); return; }
      setUser(user)

      let { data: playerData } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (!playerData) {
        const { data: newPlayer } = await supabase
          .from("players")
          .insert({
            user_id: user.id,
            name: user.user_metadata?.full_name || "Player",
            email: user.email,
          })
          .select().single()
        playerData = newPlayer
      }
      setPlayer(playerData)

      const { data } = await supabase
        .from("registrations")
        .select(`id, approved, category_key, tournament:tournaments(id, name, location)`)
        .eq("player_id", playerData.id)

      const regData = (data ?? []) as any[]
      const tournamentIds = regData.map((r) => r.tournament?.id).filter(Boolean)

      const { data: matches } = await supabase
        .from("matches")
        .select("tournament_id, category_key")
        .in("tournament_id", tournamentIds)

      const registrationsWithMatches = regData.map((reg) => ({
        ...reg,
        hasBracket: matches?.some((m) => m.tournament_id === reg.tournament?.id && m.category_key === reg.category_key)
      }))

      setRegistrations(registrationsWithMatches)
      setLoading(false)
    }

    loadDashboard()
  }, [router])

  if (loading) return <div className="animate-pulse text-slate-400 text-xs font-bold uppercase tracking-widest">Updating Records...</div>

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="border-l-4 border-[#4169E1] pl-6">
        <h1 className="text-3xl font-bold tracking-tighter text-slate-900">Welcome back, {player?.name?.split(' ')[0]}</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your active registrations and tournament progress.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Events", value: registrations.length, icon: Trophy, color: "text-blue-600" },
          { label: "Approved", value: registrations.filter(r => r.approved).length, icon: ShieldCheck, color: "text-emerald-600" },
          { label: "Pending", value: registrations.filter(r => !r.approved).length, icon: Clock, color: "text-amber-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-[1.5rem] p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
            <stat.icon size={32} className={`${stat.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Tournaments Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">My Tournaments</h2>
          <button onClick={() => router.push('/tournaments')} className="text-xs font-bold text-[#4169E1] uppercase tracking-wider hover:underline">Register for more</button>
        </div>

        {registrations.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-[2rem] py-16 text-center">
            <p className="text-slate-400 font-medium text-sm">You haven&apos;t joined any championships yet.</p>
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