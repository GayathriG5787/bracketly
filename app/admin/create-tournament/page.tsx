"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function CreateTournament() {

  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [level, setLevel] = useState("") // ✅ NEW
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return

    // ✅ Basic validation
    if (!level) {
      alert("Please select tournament level")
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from("tournaments")
      .insert({
        name,
        location,
        tournament_date: date,
        level // ✅ NEW
      })

    if (error) {

      if (error.code === "23505") {
        alert("Tournament already created")
      } else {
        alert("Error creating tournament")
      }

      console.log(error)

    } else {

      alert("Tournament created successfully")

      setName("")
      setLocation("")
      setDate("")
      setLevel("") // ✅ RESET
    }

    setLoading(false)
  }

  return (
    <div className="p-8 max-w-md">

      <h1 className="text-2xl font-bold mb-6">
        Create Tournament
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Tournament Name"
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          className="border p-2 w-full"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* ✅ NEW: Tournament Level */}
        <select
          className="border p-2 w-full"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">Select Tournament Level</option>
          <option value="District">District</option>
          <option value="State">State</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create Tournament"}
        </button>

      </form>

    </div>
  )
}