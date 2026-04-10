"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trophy, MapPin, Calendar, Award, Loader2, PlusCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateTournament() {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [level, setLevel] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!level) {
      alert("Please select tournament level")
      return
    }

    setLoading(true)
    const { error } = await supabase
      .from("tournaments")
      .insert({
        name,
        location,
        tournament_date: date,
        level 
      })

    if (error) {
      if (error.code === "23505") {
        alert("Tournament already created")
      } else {
        alert("Error creating tournament")
      }
      console.log(error)
    } else {
      alert("Tournament created successfully")
      setName("")
      setLocation("")
      setDate("")
      setLevel("")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      {/* --- HEADER --- */}
      <div className="mb-8">
        <Link 
          href="/admin" 
          className="flex items-center text-slate-500 hover:text-[#4169E1] transition-colors mb-4 text-sm font-medium gap-1 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Tournament</h1>
        <p className="text-slate-500 text-sm mt-1">
          Enter the details to launch a new competition event.
        </p>
      </div>

      {/* --- FORM CARD --- */}
      <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tournament Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                Tournament Name
              </label>
              <div className="relative group">
                <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4169E1] transition-colors" size={20} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual District Championship 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-[#4169E1] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Location */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                  Venue Location
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4169E1] transition-colors" size={20} />
                  <input
                    type="text"
                    required
                    placeholder="City or Stadium"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-[#4169E1] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                  Event Date
                </label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4169E1] transition-colors" size={20} />
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-[#4169E1] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                Competition Level
              </label>
              <div className="relative group">
                <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4169E1] transition-colors" size={20} />
                <select
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-[#4169E1] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all appearance-none"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="" disabled>Select Tournament Level</option>
                  <option value="District">District Level</option>
                  <option value="State">State Level</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4169E1] hover:bg-[#3252b0] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <PlusCircle size={20} />
                    Launch Tournament
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}