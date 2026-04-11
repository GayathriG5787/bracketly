"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { syncUser } from "@/lib/syncUser"
import { 
  MapPin, 
  Calendar, 
  Trophy, 
  ChevronRight, 
  Search, 
  ArrowUpRight, 
  Filter 
} from "lucide-react"

type Tournament = {
  id: string
  name: string
  location: string
  tournament_date: string
  level: string
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchTournaments()
  }, [])

  useEffect(() => {
    const run = async () => {
      await syncUser("player")
    }
    run()
  }, [])

  const fetchTournaments = async () => {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("tournament_date", { ascending: true })

    if (error) {
      console.error(error)
    } else {
      setTournaments(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[#4169E1] rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Syncing Events</p>
      </div>
    )
  }

  // Inside TournamentsPage component

  const handleRegisterClick = async (e: React.MouseEvent, tournamentId: string) => {
    e.preventDefault() // Stop the Link from navigating immediately
    
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // User is NOT logged in: Redirect to Google
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { 
          // After login, send them back to this specific tournament's registration
          redirectTo: `${window.location.origin}/player/tournaments/${tournamentId}/register` 
        },
      })
      if (error) console.error(error)
    } else {
      // User IS logged in: Proceed to registration
      router.push(`/player/tournaments/${tournamentId}/register`)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      
      {/* --- PAGE HEADER --- */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 text-[#4169E1] text-[11px] font-bold tracking-[0.2em] uppercase mb-4">
          <Trophy size={14} /> Official Tournament Feed
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter text-slate-900 leading-none">
            Upcoming <br /> <span className="text-slate-400">Championships.</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
            Select a tournament to view division details, weight classes, and real-time bracket generation status.
          </p>
        </div>
      </div>

      {/* --- SEARCH & FILTERS --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#4169E1] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by city, name, or level..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#4169E1] transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-colors">
          <Filter size={14} /> Filter Results
        </button>
      </div>

      {/* --- TOURNAMENT CARDS GRID --- */}
      {tournaments.length === 0 ? (
        <div className="py-32 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active tournaments found</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <div 
              key={tournament.id}
              className="group relative flex flex-col bg-white border border-slate-100 rounded-[2.5rem] p-8 transition-all duration-500 hover:border-[#4169E1]/30 hover:bg-slate-50/30"
            >
              {/* Header: Level & Visual Icon */}
              <div className="flex justify-between items-start mb-8">
                <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-bold uppercase tracking-[0.15em] rounded-lg">
                  {tournament.level || "Open"}
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#4169E1] transition-transform group-hover:scale-110 group-hover:rotate-12">
                  <ArrowUpRight size={20} />
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-tight group-hover:text-[#4169E1] transition-colors">
                  {tournament.name}
                </h3>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <MapPin size={16} className="text-slate-400" />
                    </div>
                    {tournament.location}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Calendar size={16} className="text-slate-400" />
                    </div>
                    {new Date(tournament.tournament_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex flex-col gap-3">
              {/* Replace the existing Register Now Link with this: */}
              <button 
                onClick={(e) => handleRegisterClick(e, tournament.id)}
                className="w-full py-4 bg-[#4169E1] text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2"
              >
                Register Now <ChevronRight size={14} />
              </button>
                <Link 
                  href={`/tournaments/${tournament.id}`}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] text-center hover:bg-slate-50 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- FOOTER DECORATION --- */}
      <div className="mt-24 pt-12 border-t border-slate-100 flex justify-between items-center text-slate-400">
          <p className="text-[10px] font-bold uppercase tracking-widest italic">Precision Scheduling Engine</p>
          <p className="text-[10px] font-bold uppercase tracking-widest">© {new Date().getFullYear()} Bracketly</p>
      </div>
    </div>
  )
}