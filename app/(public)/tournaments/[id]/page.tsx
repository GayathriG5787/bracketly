"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { 
  MapPin, 
  Calendar, 
  Trophy, 
  ChevronLeft, 
  Zap, 
  Lock, 
  Unlock,
  ShieldCheck,
  ArrowRight
} from "lucide-react"

type Tournament = {
  id: string
  name: string
  location: string
  tournament_date: string
  level: string
  bracket_locked: boolean
  created_at: string
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournament()
  }, [id])

  const fetchTournament = async () => {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(error)
    } else {
      setTournament(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#4169E1] rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Loading Event Details</p>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Tournament not found.</h2>
        <Link href="/tournaments" className="text-[#4169E1] font-bold mt-4 inline-block">Return to Feed</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* --- HERO SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        <Link 
          href="/tournaments" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#4169E1] transition-colors text-[11px] font-bold uppercase tracking-widest mb-12"
        >
          <ChevronLeft size={16} /> Back to Tournaments
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-blue-50 text-[#4169E1] text-[10px] font-bold uppercase tracking-[0.15em] rounded-lg mb-6">
              <ShieldCheck size={14} /> {tournament.level} Level Competition
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-slate-900 leading-[1.1] mb-8">
              {tournament.name.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? "text-slate-400" : ""}>
                  {word}{" "}
                </span>
              ))}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <MapPin size={20} className="text-[#4169E1]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="text-lg font-bold text-slate-900">{tournament.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Calendar size={20} className="text-[#4169E1]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Date</p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(tournament.tournament_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href={`/player/tournaments/${tournament.id}/register`}
                className="px-10 py-5 bg-[#4169E1] text-white rounded-[1.5rem] text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200/50 flex items-center justify-center gap-3"
              >
                Register as Athlete <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* --- STATUS CARD (Matching landing page style) --- */}
          <div className="relative pt-10 lg:pt-20">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
              {/* Decorative Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-12">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                    <Trophy size={28} />
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    tournament.bracket_locked 
                    ? "bg-amber-50 text-amber-600 border border-amber-100" 
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  }`}>
                    {tournament.bracket_locked ? <Lock size={12} /> : <Unlock size={12} />}
                    {tournament.bracket_locked ? "Brackets Locked" : "Registration Open"}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4">Bracket Status</h3>
                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          {tournament.bracket_locked ? "Manual Review" : "Auto-Gen Active"}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">Precision Scheduling Engine</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#4169E1] animate-pulse">
                        <Zap size={20} fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                      Bracketly infrastructure ensures real-time athlete verification and automated seed placement for all {tournament.level} level events.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM DECORATION --- */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="pt-12 border-t border-slate-100 flex justify-between items-center text-slate-300">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]">System ID: {tournament.id.slice(0,8)}</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em]">Precision in Competition</p>
        </div>
      </div>
    </div>
  )
}