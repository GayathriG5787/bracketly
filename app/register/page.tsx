"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function RegisterPlayer() {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [gender, setGender] = useState("")
  const [beltRank, setBeltRank] = useState("")
  const [tournamentId, setTournamentId] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return
    setLoading(true)

    // STEP 1: Check if player already exists using email
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    let playerId

    if (existingPlayer) {
      playerId = existingPlayer.id
    } else {

      // STEP 2: Create new player
      const { data: newPlayer, error: playerError } = await supabase
        .from("players")
        .insert({
          name,
          email,
          phone,
          age: Number(age),
          weight: Number(weight),
          gender,
          belt_rank: beltRank
        })
        .select()
        .single()

      if (playerError) {

        if (playerError.code === "23505") {
          alert("A player with this email already exists")
        } else {
          alert("Error creating player")
        }

        console.error(playerError)
        setLoading(false)
        return
      }

      playerId = newPlayer.id
    }

    // STEP 3: Insert registration
    const { error: registrationError } = await supabase
      .from("registrations")
      .insert({
        player_id: playerId,
        tournament_id: tournamentId
      })

      if (registrationError) {

        if (registrationError.code === "23505") {
          alert("You have already registered to this tournament")
        } else {
          alert("Error registering player")
          console.error(registrationError)
        }

      } else {

      alert("Registration successful")

      setName("")
      setEmail("")
      setPhone("")
      setAge("")
      setWeight("")
      setGender("")
      setBeltRank("")
      setTournamentId("")
    }

    setLoading(false)
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
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="border p-2 w-full"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Player"}
        </button>

      </form>

    </div>
  )
}