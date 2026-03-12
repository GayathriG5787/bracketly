"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function RegisterPlayer() {

  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [gender, setGender] = useState("")
  const [beltRank, setBeltRank] = useState("")
  const [tournamentId, setTournamentId] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        name,
        age: Number(age),
        weight: Number(weight),
        gender,
        belt_rank: beltRank
      })
      .select()
      .single()

    if (playerError) {
      alert("Error creating player")
      console.error(playerError)
      return
    }

    const { error: registrationError } = await supabase
      .from("registrations")
      .insert({
        player_id: player.id,
        tournament_id: tournamentId
      })

    if (registrationError) {
      alert("Error registering player")
      console.error(registrationError)
    } else {
      alert("Registration successful")
    }
  }

  return (
    <div className="p-8 max-w-md">

      <h1 className="text-2xl font-bold mb-6">
        Player Registration
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Name"
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Age"
          className="border p-2 w-full"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <input
          type="number"
          placeholder="Weight"
          className="border p-2 w-full"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />

        <select
          className="border p-2 w-full"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input
          type="text"
          placeholder="Belt Rank"
          className="border p-2 w-full"
          value={beltRank}
          onChange={(e) => setBeltRank(e.target.value)}
        />

        <input
          type="text"
          placeholder="Tournament ID"
          className="border p-2 w-full"
          value={tournamentId}
          onChange={(e) => setTournamentId(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Register Player
        </button>

      </form>

    </div>
  )
}