"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, ShieldCheck } from "lucide-react"

export default function PlayerProfile() {
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }

      const { data: playerData, error } = await supabase
        .from("players")
        .select("name, email, phone")
        .eq("user_id", user.id)
        .single()

      if (playerData) {
        setPlayer(playerData)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [router])

  if (loading) return <div className="animate-pulse text-slate-400 text-xs font-bold uppercase tracking-widest p-10">Fetching Profile...</div>

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-l-4 border-[#4169E1] pl-6">
        <h1 className="text-3xl font-bold tracking-tighter text-slate-900">Account Profile</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your personal information and contact details.</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          {/* Cover/Accent area */}
          <div className="h-24 bg-slate-50 border-b border-slate-100 flex items-center px-8">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
               <User className="text-[#4169E1]" size={32} />
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Info Grid */}
            <div className="grid gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
                <div className="flex items-center gap-3 text-slate-900 font-semibold">
                  <span className="text-lg">{player?.name || "Not set"}</span>
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1">
                    <Mail size={12} /> Email Address
                  </label>
                  <p className="text-slate-700 font-medium">{player?.email || "Not provided"}</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1">
                    <Phone size={12} /> Phone Number
                  </label>
                  <p className="text-slate-700 font-medium">{player?.phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <ShieldCheck className="text-emerald-600" size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Verified Athlete</p>
                <p className="text-[11px] text-emerald-700">Your account is active and eligible for tournament registrations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}