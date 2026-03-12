"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function CreateTournament() {

  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase
      .from("tournaments")
      .insert({
        name,
        location,
        tournament_date: date
      })

    if (error) {
      alert("Error creating tournament")
      console.log(error)
    } else {
      alert("Tournament created successfully")
      setName("")
      setLocation("")
      setDate("")
    }
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

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Tournament
        </button>

      </form>

    </div>
  )
}