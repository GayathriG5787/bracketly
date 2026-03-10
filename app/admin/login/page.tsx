"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogin() {

  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (username === "admin" && password === "password123") {

      localStorage.setItem("adminLoggedIn", "true")

      router.push("/admin")

    } else {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">

      <form onSubmit={handleLogin} className="p-6 border rounded w-80">

        <h2 className="text-xl mb-4 font-semibold">
          Admin Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="border p-2 w-full mb-3"
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-3"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-2">
            {error}
          </p>
        )}

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          Login
        </button>

      </form>

    </div>
  )
}