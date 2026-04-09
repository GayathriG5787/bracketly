"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { 
  Trophy, 
  PlusCircle, 
  List, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  Users,
  ChevronRight,
  Bell
} from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/admin/login")
        return
      }

      // Consistent with your logic: check role
      if (user.user_metadata?.role !== "admin") {
        await supabase.auth.signOut()
        router.push("/admin/login")
        return
      }
      
      setUserName(user.email ?? null);
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4169E1] rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
            <Trophy className="text-white" size={18} />
          </div>
          <span className="font-bold text-white tracking-tight">Bracketly Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Main Menu
          </div>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800 text-white font-medium text-sm transition-all">
            <LayoutDashboard size={18} className="text-[#4169E1]" /> Dashboard
          </Link>
          <Link href="/admin/tournaments" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-sm font-medium group">
            <List size={18} className="group-hover:text-[#4169E1]" /> View Tournaments
          </Link>
          <Link href="/admin/create-tournament" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-sm font-medium group">
            <PlusCircle size={18} className="group-hover:text-[#4169E1]" /> Create Tournament
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-sm font-medium group">
            <Users size={18} className="group-hover:text-[#4169E1]" /> Manage Players
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 ml-64 min-h-screen">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Overview</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
            </button>
            <div className="h-8 w-px bg-slate-100 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-none">Admin Account</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-[120px]">{userName}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-10">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Quick access to your tournament management tools.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            
            {/* Quick Action Card 1 */}
            <Link 
              href="/admin/create-tournament"
              className="group bg-white border border-slate-200 p-8 rounded-[1.5rem] hover:border-[#4169E1] hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#4169E1] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#4169E1] group-hover:text-white transition-colors">
                <PlusCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Create Tournament</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">Setup weight categories, dates, and locations for a new event.</p>
              <div className="mt-auto flex items-center text-[#4169E1] text-xs font-bold uppercase tracking-wider gap-1">
                Launch Wizard <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Quick Action Card 2 */}
            <Link 
              href="/admin/tournaments"
              className="group bg-white border border-slate-200 p-8 rounded-[1.5rem] hover:border-[#4169E1] hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col"
            >
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#4169E1] group-hover:text-white transition-colors">
                <List size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">View Tournaments</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">Manage registrations, approve players, and generate brackets.</p>
              <div className="mt-auto flex items-center text-[#4169E1] text-xs font-bold uppercase tracking-wider gap-1">
                Open Manager <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </div>
      </main>
    </div>
  )
}