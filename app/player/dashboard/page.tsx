"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trophy, ShieldCheck, Clock, List } from "lucide-react"
import { syncUser } from "@/lib/syncUser"

export default function PlayerDashboard() {
  const [player, setPlayer] = useState<any>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

useEffect(() => {
  const loadDashboard = async () => {
    try {
      // ✅ 1. Use getSession (more reliable)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push("/")
        return
      }

      const user = session.user

      // ✅ 2. Sync user FIRST
      await syncUser("player")

      // ✅ 3. Fetch player safely
      let { data: playerData } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      // ✅ 4. Use UPSERT instead of insert (fixes 409 permanently)
      if (!playerData) {
        const { data, error } = await supabase
          .from("players")
          .upsert({
            user_id: user.id,
            name: user.user_metadata?.full_name || "Player",
            email: user.email,
          }, { onConflict: "email" }) // 🔥 IMPORTANT
          .select()
          .single()

        if (error) throw error

        playerData = data
      }

      // ✅ 5. Hard safety check
      if (!playerData) throw new Error("Player not found")

      setPlayer(playerData)

      // ✅ 6. Fetch registrations
      const { data: regData } = await supabase
        .from("registrations")
        .select("id, approved")
        .eq("player_id", playerData.id)

      setRegistrations(regData ?? [])

    } catch (err) {
      console.error("Dashboard error:", err)
    } finally {
      setLoading(false)
    }
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

      {/* Quick Access Card */}
      <div className="bg-[#4169E1]/5 border border-[#4169E1]/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tournament Management</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Check your registration status and access live match brackets.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => router.push('/player/my-tournaments')}
            className="flex-1 md:flex-none px-8 py-3 bg-[#4169E1] text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <List size={16} /> My Tournaments
          </button>
          <button 
            onClick={() => router.push('/tournaments')}
            className="flex-1 md:flex-none px-8 py-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            Find Events
          </button>
        </div>
      </div>
    </div>
  )
}