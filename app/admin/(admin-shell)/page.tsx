"use client"

import Link from "next/link"
import { PlusCircle, List, ChevronRight } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl">
      {/* --- PAGE TITLE --- */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          Quick access to your tournament management tools.
        </p>
      </div>

      {/* --- QUICK ACTION CARDS --- */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Create Tournament */}
        <Link 
          href="/admin/create-tournament"
          className="group bg-white border border-slate-200 p-8 rounded-[1.5rem] hover:border-[#4169E1] hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col"
        >
          <div className="w-12 h-12 bg-blue-50 text-[#4169E1] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#4169E1] group-hover:text-white transition-colors duration-300">
            <PlusCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Create Tournament</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Setup weight categories, dates, and locations for a new event.
          </p>
          <div className="mt-auto flex items-center text-[#4169E1] text-xs font-bold uppercase tracking-wider gap-1">
            Launch Wizard 
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* View Tournaments */}
        <Link 
          href="/admin/tournaments"
          className="group bg-white border border-slate-200 p-8 rounded-[1.5rem] hover:border-[#4169E1] hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col"
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#4169E1] group-hover:text-white transition-colors duration-300">
            <List size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">View Tournaments</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Manage registrations, approve players, and generate brackets.
          </p>
          <div className="mt-auto flex items-center text-[#4169E1] text-xs font-bold uppercase tracking-wider gap-1">
            Open Manager 
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>
    </div>
  )
}