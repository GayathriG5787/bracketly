"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { Trophy, CheckCircle2, Loader2, Activity } from "lucide-react"

export default function PlayerBracketPage() {
  const params = useParams()
  const tournamentId = params.tournamentId as string
  const categoryKey = params.categoryKey as string

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

  const finalRoundNum = useMemo(() => {
    const keys = Object.keys(rounds).map(Number)
    return keys.length > 0 ? Math.max(...keys) : 0
  }, [rounds])

  const champion = useMemo(() => {
    const finalMatch = rounds[finalRoundNum]?.[0]
    if (!finalMatch || !finalMatch.winner_id) return null
    return finalMatch.winner_id === finalMatch.player1_id ? finalMatch.player1?.name : finalMatch.player2?.name
  }, [rounds, finalRoundNum])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="animate-spin text-[#4169E1]" size={32} />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Loading Live Bracket</p>
    </div>
  )

  const CONNECTOR_WIDTH = 40; // px

  return (
    <div className="space-y-10 pb-20">
      {/* Header Area */}
      <div className="border-l-4 border-[#4169E1] pl-6 flex justify-between items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[#4169E1] text-[11px] font-bold tracking-[0.2em] uppercase mb-2">
            <Activity size={14} /> Live Tournament Progress
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 capitalize leading-none">
            {categoryKey.replace(/-/g, ' ')}
          </h1>
        </div>
      </div>

      {/* Bracket Scroll Container */}
      <div className="overflow-x-auto bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm min-h-[800px]">
        <div className="flex gap-0 min-w-max items-start">
          {Object.entries(rounds).map(([round, matches]) => {
            const rNum = Number(round)
            // Geometric height calculation for tree alignment
            const slotHeight = Math.pow(2, rNum - 1) * 130 

            return (
              <div key={round} className="flex flex-col w-64">
                {/* Round Header */}
                <div className="text-center mb-10 h-12">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Stage {rNum}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 uppercase tracking-wider">
                    {rNum === finalRoundNum ? "Finals" : `Round ${rNum}`}
                  </h3>
                </div>

                <div className="flex flex-col items-center">
                  {matches.map((match, idx) => {
                    const isP1Winner = match.winner_id === match.player1_id
                    const isP2Winner = match.winner_id === match.player2_id

                    return (
                      <div 
                        key={match.id} 
                        className="relative flex items-center justify-center w-full"
                        style={{ height: `${slotHeight}px` }}
                      >
                        {/* EXIT CONNECTORS (Towards Next Round) */}
                        {rNum < finalRoundNum && (
                          <>
                            {/* Horizontal part */}
                            <div 
                              className="absolute bg-slate-200" 
                              style={{ right: 0, top: '50%', width: `${CONNECTOR_WIDTH}px`, height: '2px' }} 
                            />
                            {/* Vertical part (L-bridge) */}
                            <div 
                              className="absolute bg-slate-200" 
                              style={{ 
                                right: 0, 
                                width: '2px', 
                                height: `${slotHeight / 2}px`,
                                top: idx % 2 === 0 ? '50%' : 'auto',
                                bottom: idx % 2 !== 0 ? '50%' : 'auto'
                              }}
                            />
                          </>
                        )}

                        {/* ENTRY CONNECTORS (From Previous Round) */}
                        {rNum > 1 && (
                          <div 
                            className="absolute bg-slate-200" 
                            style={{ left: 0, top: '50%', width: `${CONNECTOR_WIDTH}px`, height: '2px' }} 
                          />
                        )}

                        {/* Match Card (Static View Only) */}
                        <div className="w-52 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative z-10">
                          {/* Player 1 Slot */}
                          <div className={`p-4 flex items-center justify-between border-b border-slate-50 ${isP1Winner ? 'bg-emerald-50/60' : ''}`}>
                            <span className={`text-[11px] font-bold truncate max-w-[140px] ${isP1Winner ? 'text-emerald-700' : !match.player1_id ? 'text-slate-300 italic' : 'text-slate-600'}`}>
                              {match.player1?.name || (rNum === 1 ? "BYE" : "TBD")}
                            </span>
                            {isP1Winner && <CheckCircle2 size={14} className="text-emerald-500" />}
                          </div>

                          {/* Player 2 Slot */}
                          <div className={`p-4 flex items-center justify-between ${isP2Winner ? 'bg-emerald-50/60' : ''}`}>
                            <span className={`text-[11px] font-bold truncate max-w-[140px] ${isP2Winner ? 'text-emerald-700' : !match.player2_id ? 'text-slate-300 italic' : 'text-slate-600'}`}>
                              {match.player2?.name || (rNum === 1 ? "BYE" : "TBD")}
                            </span>
                            {isP2Winner && <CheckCircle2 size={14} className="text-emerald-500" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* --- CHAMPION PODIUM --- */}
          <div className="flex flex-col w-48 h-full">
            <div className="h-12 mb-10" /> 
            <div 
              className="relative flex items-center" 
              style={{ height: `${Math.pow(2, finalRoundNum - 1) * 130}px` }}
            >
              <div className="w-10 h-0.5 bg-slate-200" />
              
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col items-center text-center shadow-inner w-full">
                <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-[#4169E1] mb-4">
                  <Trophy size={28} />
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Championship Winner</p>
                <p className={`text-sm font-black tracking-tight ${champion ? 'text-slate-900' : 'text-slate-300 italic'}`}>
                  {champion || "Tournament In Progress"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}