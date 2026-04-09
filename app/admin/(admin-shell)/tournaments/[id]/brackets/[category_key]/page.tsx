"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { Trophy, Users, ChevronRight, Info, CheckCircle2 } from "lucide-react"

export default function BracketViewPage() {
  const params = useParams()
  const tournamentId = params.id as string
  const categoryKey = params.category_key as string

  const [rounds, setRounds] = useState<Record<number, any[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id, round, position, player1_id, player2_id, winner_id,
        next_match_id, next_match_slot, walkover,
        player1:player1_id ( name ),
        player2:player2_id ( name )
      `)
      .eq("tournament_id", tournamentId)
      .eq("category_key", categoryKey)
      .order("round", { ascending: true })
      .order("position", { ascending: true })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const grouped: Record<number, any[]> = {}
    data.forEach((match: any) => {
      if (!grouped[match.round]) grouped[match.round] = []
      grouped[match.round].push(match)
    })

    setRounds(grouped)
    setLoading(false)
  }

  const handleSelectWinner = async (match: any, playerId: string) => {
    if (match.winner_id || !playerId) return
    if (!confirm("Set this player as the winner?")) return

    try {
      await supabase
        .from("matches")
        .update({ winner_id: playerId, walkover: false })
        .eq("id", match.id)

      if (match.next_match_id) {
        const field = match.next_match_slot === 1 ? "player1_id" : "player2_id"
        await supabase
          .from("matches")
          .update({ [field]: playerId })
          .eq("id", match.next_match_id)
      }
      fetchMatches()
    } catch (err) {
      console.error(err)
      alert("Error updating winner")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#4169E1] rounded-full animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rendering Tree</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Area */}
      <div className="border-l-4 border-[#4169E1] pl-6 flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-2 text-[#4169E1] text-[11px] font-bold tracking-[0.2em] uppercase mb-2">
            Tournament Tree
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-slate-900 leading-none">
            {categoryKey.replace(/-/g, ' ')}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium bg-slate-50 px-4 py-2 rounded-lg">
          <Info size={14} /> Click a player to declare winner
        </div>
      </div>

      {/* Bracket Container */}
      <div className="overflow-x-auto pb-10 bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm min-h-[600px]">
        <div className="inline-flex gap-16 min-w-max pr-10">
          {Object.entries(rounds).map(([round, matches]) => {
            const roundNum = Number(round)
            return (
              <div key={round} className="flex flex-col w-64">
                {/* Round Header */}
                <div className="text-center mb-10">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                     Round {roundNum}
                   </span>
                   <h3 className="text-sm font-bold text-slate-900 mt-1 uppercase tracking-wider">
                     {roundNum === Object.keys(rounds).length ? "Finals" : `Stage ${roundNum}`}
                   </h3>
                </div>

                {/* Matches with dynamic vertical spacing */}
                <div className="flex-1 flex flex-col justify-around">
                  {matches.map((match: any) => {
                    const isP1Winner = match.winner_id === match.player1_id
                    const isP2Winner = match.winner_id === match.player2_id
                    const canSelect = match.player1_id && match.player2_id && !match.winner_id

                    return (
                      <div key={match.id} className="relative py-4 group">
                        {/* THE CONNECTOR LINES */}
                        {roundNum < Object.keys(rounds).length && (
                           <div className="absolute top-1/2 -right-16 w-16 h-px bg-slate-200 z-0" />
                        )}

                        <div className="relative z-10 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all group-hover:border-[#4169E1]/30">
                          {/* Player 1 Slot */}
                          <button
                            disabled={!canSelect}
                            onClick={() => handleSelectWinner(match, match.player1_id)}
                            className={`w-full flex items-center justify-between p-4 text-left border-b border-slate-100 transition-colors
                              ${isP1Winner ? "bg-emerald-50" : ""}
                              ${canSelect ? "hover:bg-slate-50 cursor-pointer" : "cursor-default"}
                            `}
                          >
                            <span className={`text-xs font-bold truncate ${isP1Winner ? "text-emerald-700" : !match.player1_id ? "text-slate-300 italic" : "text-slate-600"}`}>
                              {match.player1?.name || (match.round === 1 ? "BYE" : "TBD")}
                            </span>
                            {isP1Winner && <CheckCircle2 size={14} className="text-emerald-500" />}
                          </button>

                          {/* Player 2 Slot */}
                          <button
                            disabled={!canSelect}
                            onClick={() => handleSelectWinner(match, match.player2_id)}
                            className={`w-full flex items-center justify-between p-4 text-left transition-colors
                              ${isP2Winner ? "bg-emerald-50" : ""}
                              ${canSelect ? "hover:bg-slate-50 cursor-pointer" : "cursor-default"}
                            `}
                          >
                            <span className={`text-xs font-bold truncate ${isP2Winner ? "text-emerald-700" : !match.player2_id ? "text-slate-300 italic" : "text-slate-600"}`}>
                              {match.player2?.name || (match.round === 1 ? "BYE" : "TBD")}
                            </span>
                            {isP2Winner && <CheckCircle2 size={14} className="text-emerald-500" />}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Winner Showcase Placeholder */}
          <div className="flex flex-col justify-center w-64 items-center">
             <div className="w-20 h-20 rounded-[2rem] bg-blue-50 border border-blue-100 flex items-center justify-center text-[#4169E1] mb-4">
                <Trophy size={32} />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Champion</p>
          </div>
        </div>
      </div>
    </div>
  )
}