"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Trophy, User as UserIcon, Calendar, LayoutDashboard, LogOut, Bell, Search } from "lucide-react"

export default function PlayerShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const navItems = [
    { name: "Dashboard", href: "/player/dashboard", icon: LayoutDashboard },
    { name: "My Tournaments", href: "/player/my-tournaments", icon: Calendar },
    { name: "Profile", href: "/player/profile", icon: UserIcon },
  ]

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#4169E1] rounded flex items-center justify-center">
            <Trophy className="text-white" size={16} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Bracketly</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                  ? "bg-blue-50 text-[#4169E1]" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            )
          })}
          <Link
            href="/tournaments"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <Search size={18} />
            Browse All
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Athlete Portal</div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
               <UserIcon size={16} />
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-6xl w-full">
          {children}
        </div>
      </main>
    </div>
  )
}