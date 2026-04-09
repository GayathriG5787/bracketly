"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Trophy, Lock, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AdminLogin() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // 🔐 Step 1: Login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Invalid email or password")
      setLoading(false)
      return
    }

    // 🧠 Step 2: Wait for session to be ready
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      setError("Session not ready. Try again.")
      setLoading(false)
      return
    }

    // 🧠 Step 3: Get logged-in user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData?.user) {
      setError("Something went wrong. Try again.")
      setLoading(false)
      return
    }

    const user = userData.user

    // ✅ Step 4: Check role
    const { data: dbUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!dbUser || dbUser.role !== "admin") {
      setError("Access denied. Not an admin.")
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    setLoading(false)
    router.replace("/admin")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-blue-50">
      
      {/* Back to Site Link */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
      >
        <ArrowLeft size={16} /> Back to site
      </Link>

      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-[#4169E1] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
            <Trophy className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Console</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Authorized personnel only</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@bracketly.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:border-[#4169E1] focus:bg-white transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">
                Security Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:border-[#4169E1] focus:bg-white transition-all outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] font-bold p-3 rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-xl py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Secure Login <Lock size={14} className="group-hover:translate-y-[-1px] transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            Bracketly Infrastructure Security
          </p>
        </div>
      </div>
    </div>
  )
}