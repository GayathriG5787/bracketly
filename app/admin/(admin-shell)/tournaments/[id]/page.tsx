"use client"

import { use } from "react"
import Link from "next/link"
import { Users, LayoutGrid, ChevronRight, Settings, ArrowLeft } from "lucide-react"

export default function TournamentAdminPage({ params }: any) {
  const { id: tournamentId } = use(params) as { id: string }

  return (
    <div className="max-w-5xl">
      {/* --- BREADCRUMB / BACK --- */}
      <Link 
        href="/admin/tournaments" 
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold uppercase tracking-widest mb-6"
      >
        <ArrowLeft size={14} /> Back to All Tournaments
      </Link>

      {/* --- PAGE HEADER --- */}
      <div className="border-l-4 border-[#4169E1] pl-6 mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tournament Console</h1>
        <p className="text-slate-500 font-medium mt-1">
          Manage participants, verify documents, and control live brackets.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Registration Management Card */}
        <Link
          href={`/admin/tournaments/${tournamentId}/registrations`}
          className="group bg-white border border-slate-200 p-8 rounded-[1.5rem] hover:border-[#4169E1] hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Registrations</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Review athlete applications, check payment status, and approve participants for their respective divisions.
          </p>
          <div className="mt-auto flex items-center text-[#4169E1] text-xs font-bold uppercase tracking-wider gap-1">
            Review Entries 
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Bracket Control Card */}
        <Link
          href={`/admin/tournaments/${tournamentId}/brackets`}
          className="group bg-white border border-slate-200 p-8 rounded-[1.5rem] hover:border-[#4169E1] hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col"
        >
          <div className="w-12 h-12 bg-blue-50 text-[#4169E1] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#4169E1] group-hover:text-white transition-colors duration-300">
            <LayoutGrid size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Bracket Manager</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Generate tournament trees, seed players, and update live scores for all weight categories.
          </p>
          <div className="mt-auto flex items-center text-[#4169E1] text-xs font-bold uppercase tracking-wider gap-1">
            Control Brackets 
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>

      {/* --- QUICK STATS / FOOTER ACTION --- */}
      <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-lg border border-slate-200">
            <Settings size={18} className="text-slate-400" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tournament ID: <span className="text-slate-900 ml-1">{tournamentId.slice(0,8)}...</span></p>
        </div>
        <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">
          Archive Tournament
        </button>
      </div>
    </div>
  )
}