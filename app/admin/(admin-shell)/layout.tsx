// app/admin/(admin-shell)/layout.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Trophy, PlusCircle, List, LogOut, LayoutDashboard, Users, Bell } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.role !== "admin") {
        router.push("/admin/login")
        return
      }
      setUserName(user.email ?? null)
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
          <div className="w-8 h-8 bg-[#4169E1] rounded-lg flex items-center justify-center">
            <Trophy className="text-white" size={18} />
          </div>
          <span className="font-bold text-white">Bracketly Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 text-sm font-medium">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/tournaments" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
            <List size={18} /> Tournaments
          </Link>
          <Link href="/admin/create-tournament" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
            <PlusCircle size={18} /> Create
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:text-red-400 transition-colors">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Console</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500">{userName}</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200" />
            </div>
        </header>
        <div className="p-10">{children}</div>
      </main>
    </div>
  )
}