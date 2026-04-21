"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  LayoutDashboard, 
  Menu, 
  X,
  Plus,
  ArrowUpRight
} from "lucide-react"

export default function HomePage() {
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-50 selection:text-blue-600">

    {/* --- HERO SECTION --- */}
    <section className="relative flex flex-col border-b border-slate-50 overflow-hidden"
  style={{ height: 'calc(100vh - 64px)', marginTop: '64px' }}>
      
      {/* 1. min-h-screen makes the section exactly 100% of the viewport height.
          2. flex flex-col justify-center centers the content vertically.
          3. pt-20 (Padding Top) ensures the content doesn't start behind the fixed navbar.
      */}
      
      <div className="max-w-7xl mx-auto px-6 w-full pt-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Text Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[#4169E1] text-[12px] font-bold tracking-[0.2em] uppercase mb-6">
              <span className="w-1.5 h-1.5 bg-[#4169E1] rounded-full" />
              Built for Martial Arts
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.05] mb-8 tracking-tighter">
              Precision in <br /> 
              <span className="text-slate-400">Competition.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed">
              Bracketly is the infrastructure for modern Taekwondo tournaments. 
              Automated registration, athlete verification, and bracket logic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/tournaments" className="px-8 py-4 bg-[#4169E1] text-white rounded font-bold text-sm text-center hover:bg-blue-700 transition-all">
                View Tournaments
              </Link>
              <button onClick={handleGoogleLogin} className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded font-bold text-sm text-center hover:bg-slate-50 transition-all">
                Login as Player
              </button>
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="hidden lg:block relative">
            <div className="border border-slate-200 bg-white p-3 rounded-xl rotate-2 shadow-sm">
              <img 
                src="http://googleusercontent.com/image_collection/image_retrieval/6211987600187861773_0" 
                alt="Tournament Dashboard" 
                className="rounded-lg grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
              />
            </div>
            
            {/* Floating Bracket Status Card */}
            <div className="absolute -bottom-6 -left-10 border border-slate-200 bg-white p-3 rounded-xl -rotate-3 shadow-xl">
              <div className="bg-slate-50 p-4 rounded border border-slate-100 w-48 h-32 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Bracket Status</span>
                    <Zap size={12} className="text-yellow-400" fill="currentColor" />
                  </div>
                  <div className="text-lg font-bold">Auto-Gen Active</div>
                  <div className="w-full bg-slate-200 h-1 rounded" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

      {/* --- CORE INFRASTRUCTURE (FEATURES) --- */}
      <section id="features" className="pb-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Platform Core</h2>
              <p className="text-slate-500 font-medium">Engineered for tournament scalability.</p>
            </div>
            <div className="h-px bg-slate-100 flex-grow mx-8 hidden md:block" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 border border-slate-100">
            {[
              { 
                title: "Bracket Automation", 
                desc: "Sophisticated algorithms for single/double elimination category trees.",
                icon: <LayoutDashboard size={20} />
              },
              { 
                title: "Approval Workflow", 
                desc: "A high-density admin interface for bulk verification of athlete ranks.",
                icon: <Shield size={20} />
              },
              { 
                title: "Real-time Access", 
                desc: "Sub-second sync between admin actions and player dashboards.",
                icon: <Zap size={20} />
              },
              { 
                title: "Data Integrity", 
                desc: "Secure registration pipelines optimized for category-specific data.",
                icon: <Users size={20} />
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-10 border-r border-b last:border-r-0 border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                <div className="text-[#4169E1] mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PREVIEW SECTION --- */}
      <section className="py-24 bg-slate-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tighter mb-6">Built for the <br />Admin's Workflow.</h2>
            <div className="space-y-6">
              {[
                { t: "Dynamic Seeding", d: "Automatic placement based on category rankings." },
                { t: "Live Dashboards", d: "Instantly accessible tournament status for all players." },
                { t: "Category Management", d: "Manage weight, age, and belt ranks in one view." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 bg-blue-500/20 p-1 rounded">
                    <Plus size={14} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">{item.t}</h4>
                    <p className="text-sm text-slate-400">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img 
              src="/SaaS.png"
              alt="SaaS interface mockup" 
              className="rounded-lg border border-slate-800"
            />
          </div>
        </div>
      </section>

      {/* --- MINIMAL FOOTER --- */}
      <footer className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <Trophy className="text-white" size={12} />
            </div>
            <span className="font-bold text-xs uppercase tracking-[0.2em]">Bracketly</span>
          </div>

          <div className="flex gap-10 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Infrastructure</Link>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            © {new Date().getFullYear()} BRACKETLY SYSTEMS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  )
}