"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { 
  Trophy, 
  Menu, 
  X,
  ArrowUpRight
} from "lucide-react"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/player/dashboard` },
    })
    if (error) console.error(error)
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-200 ${
      isScrolled ? "bg-white/95 backdrop-blur-sm border-b border-slate-100 py-3" : "bg-transparent py-6"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#4169E1] rounded flex items-center justify-center">
            <Trophy className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Bracketly</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
          <Link href="/tournaments" className="hover:text-slate-900 transition-colors">
            Tournaments
          </Link>
          <button 
            onClick={handleGoogleLogin} 
            className="hover:text-slate-900 transition-colors"
          >
            Player Login
          </button>
          <Link 
            href="/admin/login" 
            className="bg-[#4169E1] text-white px-5 py-2 rounded shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            Admin Access <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-slate-900" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl">
          <Link 
            href="/tournaments" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-bold text-slate-600 uppercase tracking-widest"
          >
            Tournaments
          </Link>
          <button 
            onClick={handleGoogleLogin}
            className="text-left text-sm font-bold text-slate-600 uppercase tracking-widest"
          >
            Player Login
          </button>
          <Link 
            href="/admin/login" 
            className="bg-[#4169E1] text-white px-5 py-3 rounded font-bold text-center flex items-center justify-center gap-2"
          >
            Admin Access <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
    </nav>
  )
}