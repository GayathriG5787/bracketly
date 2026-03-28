"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase" // make sure this path is correct

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

    // console.log("LOGIN DATA:", data)

    // 🧠 Step 2: Wait for session to be ready (🔥 IMPORTANT FIX)
    const { data: sessionData } = await supabase.auth.getSession()
    // console.log("SESSION AFTER LOGIN:", sessionData)

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

    // ✅ ADD IT HERE 👇
    // console.log("USER:", user)

    // 🛑 Step 4: Check admin role
    if (user.user_metadata?.role !== "admin") {
      setError("Access denied. Not an admin.")
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    setLoading(false)

    router.replace("/admin")
  }

  return (
    <div className="flex h-screen items-center justify-center">

      <form onSubmit={handleLogin} className="p-6 border rounded w-80">

        <h2 className="text-xl mb-4 font-semibold">
          Admin Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-500 text-sm mb-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

    </div>
  )
}