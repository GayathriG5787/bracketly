"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { Trophy, CheckCircle2, Loader2, X } from "lucide-react"

export default function BracketViewPage() {
  const params = useParams()
  const tournamentId = params.id as string
  const categoryKey = params.category_key as string

  const [rounds, setRounds] = useState<Record<number, any[]>>({})
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    match: any;
    playerId: string;
    playerName: string;
  }>({
    isOpen: false,
    match: null,
    playerId: "",
    playerName: ""
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id, round, position, player1_id, player2_id, winner_id,
        next_match_id, next_match_slot,
        player1:player1_id ( name ),
        player2:player2_id ( name )
      `)
      .eq("tournament_id", tournamentId)
      .eq("category_key", categoryKey)
      .order("round", { ascending: true })
      .order("position", { ascending: true })

    if (error) { console.error(error); setLoading(false); return; }

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

  const initiateSelectWinner = (match: any, playerId: string) => {
    if (match.winner_id || !playerId) return
    const playerName = playerId === match.player1_id ? match.player1?.name : match.player2?.name
    setConfirmModal({
      isOpen: true,
      match,
      playerId,
      playerName: playerName || "Unknown Player"
    })
  }

  const handleConfirmWinner = async () => {
    const { match, playerId } = confirmModal
    setIsUpdating(true)
    try {
      await supabase.from("matches").update({ winner_id: playerId }).eq("id", match.id)
      if (match.next_match_id) {
        const field = match.next_match_slot === 1 ? "player1_id" : "player2_id"
        await supabase.from("matches").update({ [field]: playerId }).eq("id", match.next_match_id)
      }
      await fetchMatches()
      setConfirmModal({ ...confirmModal, isOpen: false })
    } catch (err) { 
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-[#4169E1]" size={32} />
    </div>
  )

  const CONNECTOR_WIDTH = 40;

  return (
    <div className="relative z-0 space-y-10 pb-20">
      
      {/* SaaS MODAL - Centered specifically in the workspace area */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 backdrop-blur-[1px] p-4 ml-64 transition-all">
          <div className="bg-white w-full max-w-[400px] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Confirm Result</h3>
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-5">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Declare Winner?</h4>
              <p className="text-sm text-slate-500 leading-relaxed px-2">
                Advance <span className="font-bold text-slate-900">{confirmModal.playerName}</span> to the next stage of the tournament.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50/80 flex items-center gap-3 border-t border-slate-100">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                disabled={isUpdating}
                className="flex-1 py-3 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg transition-all duration-150 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 active:bg-slate-100 active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button 
                onClick={handleConfirmWinner}
                disabled={isUpdating}
                className="flex-1 py-3 bg-[#1e293b] text-white rounded-lg text-xs font-bold transition-all duration-150 hover:bg-slate-800 active:bg-slate-900 active:scale-[0.98] disabled:bg-slate-400 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isUpdating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  "Confirm Selection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border-l-4 border-[#4169E1] pl-6">
        <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 capitalize">
          {categoryKey.replace(/-/g, ' ')}
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-wider">Tournament Management • Bracket Control</p>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm min-h-[800px] relative z-0">
        <div className="flex gap-0 min-w-max items-start">
          {Object.entries(rounds).map(([round, matches]) => {
            const rNum = Number(round)
            const slotHeight = Math.pow(2, rNum - 1) * 130 

            return (
              <div key={round} className="flex flex-col w-80">
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
                    const canSelect = match.player1_id && match.player2_id && !match.winner_id

                    return (
                      <div 
                        key={match.id} 
                        className="relative flex items-center justify-center w-full"
                        style={{ height: `${slotHeight}px` }}
                      >
                        {/* EXIT CONNECTORS */}
                        {rNum < finalRoundNum && (
                          <>
                            <div className="absolute bg-slate-200" style={{ right: 0, top: '50%', width: `${CONNECTOR_WIDTH}px`, height: '2px' }} />
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

                        {/* ENTRY CONNECTORS */}
                        {rNum > 1 && (
                          <div className="absolute bg-slate-200" style={{ left: 0, top: '50%', width: `${CONNECTOR_WIDTH}px`, height: '2px' }} />
                        )}

                        <div className="w-64 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm relative z-1 transition-all hover:border-[#4169E1]/30">
                          <button
                            disabled={!canSelect}
                            onClick={() => initiateSelectWinner(match, match.player1_id)}
                            className={`w-full p-3 text-left flex items-center justify-between border-b border-slate-50 transition-colors ${isP1Winner ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50 disabled:hover:bg-white'}`}
                          >
                            <span className="text-[11px] whitespace-nowrap pr-2">
                              {match.player1?.name || "TBD"}
                            </span>
                            {isP1Winner && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                          </button>

                          <button
                            disabled={!canSelect}
                            onClick={() => initiateSelectWinner(match, match.player2_id)}
                            className={`w-full p-3 text-left flex items-center justify-between transition-colors ${isP2Winner ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50 disabled:hover:bg-white'}`}
                          >
                            <span className="text-[11px] whitespace-nowrap pr-2">
                              {match.player2?.name || "TBD"}
                            </span>
                            {isP2Winner && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* --- CHAMPION PODIUM --- */}
          <div className="flex flex-col w-56 h-full">
            <div className="h-12 mb-10" />
            <div 
              className="relative flex items-center" 
              style={{ height: `${Math.pow(2, finalRoundNum - 1) * 130}px` }}
            >
              <div className="w-10 h-0.5 bg-slate-200" />
              
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 flex flex-col items-center text-center shadow-inner w-full">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-[#4169E1] mb-4">
                  <Trophy size={24} />
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Champion</p>
                <p className={`text-xs font-black tracking-tight ${champion ? 'text-slate-900' : 'text-slate-300 italic'}`}>
                  {champion || "TBD"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}