"use client"

import { useState, useEffect } from "react"
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
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // participation counts
  const [districtParticipations, setDistrictParticipations] = useState("")
  const [stateParticipations, setStateParticipations] = useState("")
  const [nationalParticipations, setNationalParticipations] = useState("")

  // achievements list
  const [achievements, setAchievements] = useState<any[]>([])

  const [level, setLevel] = useState("")
  const [medalType, setMedalType] = useState("")
  const [year, setYear] = useState("")

  useEffect(() => {

    const fetchTournaments = async () => {

      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("tournament_date", { ascending: true })

      if (!error) setTournaments(data)

    }

    fetchTournaments()

  }, [])

  const addAchievement = () => {

    if (!level || !medalType || !year) {
      alert("Please fill achievement fields")
      return
    }

    setAchievements([
      ...achievements,
      { level, medal_type: medalType, year: Number(year) }
    ])

    setLevel("")
    setMedalType("")
    setYear("")
  }

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    if (loading) return
    setLoading(true)

    const { data: existingPlayer } = await supabase
      .from("players")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    let playerId

    if (existingPlayer) {

      playerId = existingPlayer.id

    } else {

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
        alert("Error creating player")
        console.error(playerError)
        setLoading(false)
        return
      }

      playerId = newPlayer.id
    }

    const { error: registrationError } = await supabase
      .from("registrations")
      .insert({
        player_id: playerId,
        tournament_id: tournamentId
      })

    if (registrationError) {
      alert("Registration failed")
      console.error(registrationError)
      setLoading(false)
      return
    }

    // Insert achievements
    if (achievements.length > 0) {

      const achievementRows = achievements.map((a) => ({
        player_id: playerId,
        level: a.level,
        medal_type: a.medal_type,
        year: a.year
      }))

      await supabase
        .from("player_achievements")
        .insert(achievementRows)

    }

    // Insert participations

    const participationRows = []

    for (let i = 0; i < Number(districtParticipations || 0); i++) {
      participationRows.push({
        player_id: playerId,
        level: "district",
        year: new Date().getFullYear()
      })
    }

    for (let i = 0; i < Number(stateParticipations || 0); i++) {
      participationRows.push({
        player_id: playerId,
        level: "state",
        year: new Date().getFullYear()
      })
    }

    for (let i = 0; i < Number(nationalParticipations || 0); i++) {
      participationRows.push({
        player_id: playerId,
        level: "national",
        year: new Date().getFullYear()
      })
    }

    if (participationRows.length > 0) {

      await supabase
        .from("player_participations")
        .insert(participationRows)

    }

    alert("Registration successful")

    setName("")
    setEmail("")
    setPhone("")
    setAge("")
    setWeight("")
    setGender("")
    setBeltRank("")
    setTournamentId("")
    setAchievements([])
    setDistrictParticipations("")
    setStateParticipations("")
    setNationalParticipations("")

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

        <select
          className="border p-2 w-full"
          value={tournamentId}
          onChange={(e) => setTournamentId(e.target.value)}
        >
          <option value="">Select Tournament</option>

          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}

        </select>

        {/* PARTICIPATIONS */}

        <h2 className="font-semibold mt-4">Participations</h2>

        <input
          type="number"
          placeholder="District Participations"
          className="border p-2 w-full"
          value={districtParticipations}
          onChange={(e) => setDistrictParticipations(e.target.value)}
        />

        <input
          type="number"
          placeholder="State Participations"
          className="border p-2 w-full"
          value={stateParticipations}
          onChange={(e) => setStateParticipations(e.target.value)}
        />

        <input
          type="number"
          placeholder="National Participations"
          className="border p-2 w-full"
          value={nationalParticipations}
          onChange={(e) => setNationalParticipations(e.target.value)}
        />

        {/* ACHIEVEMENTS */}

        <h2 className="font-semibold mt-4">Achievements</h2>

        <select
          className="border p-2 w-full"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">Level</option>
          <option value="district">District</option>
          <option value="state">State</option>
          <option value="national">National</option>
        </select>

        <select
          className="border p-2 w-full"
          value={medalType}
          onChange={(e) => setMedalType(e.target.value)}
        >
          <option value="">Medal</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>

        <input
          type="number"
          placeholder="Year"
          className="border p-2 w-full"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />

        <button
          type="button"
          onClick={addAchievement}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Add Achievement
        </button>

        {achievements.map((a, index) => (
          <div key={index} className="text-sm">
            {a.level} {a.medal_type} ({a.year})
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Registering..." : "Register Player"}
        </button>

      </form>

    </div>
  )
}