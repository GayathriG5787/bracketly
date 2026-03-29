"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { getCategory } from "@/utils/category" // ✅ NEW

export default function RegisterPlayer() {

const params = useParams<{ id: string }>()
const tournamentId = params.id

  const [tournament, setTournament] = useState<any>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [district, setDistrict] = useState("")
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [gender, setGender] = useState("")
  const [beltRank, setBeltRank] = useState("")

  const [studentType, setStudentType] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [collegeName, setCollegeName] = useState("")
  const [academy, setAcademy] = useState("")

  const [districtParticipations, setDistrictParticipations] = useState("")
  const [stateParticipations, setStateParticipations] = useState("")
  const [nationalParticipations, setNationalParticipations] = useState("")

  const [achievements, setAchievements] = useState<any[]>([])
  const [level, setLevel] = useState("")
  const [medalType, setMedalType] = useState("")
  const [year, setYear] = useState("")

  const [loading, setLoading] = useState(false)

  useEffect(() => {

    const fetchTournament = async () => {
      const { data } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", tournamentId)
        .single()

      setTournament(data)
    }

    if (tournamentId) fetchTournament()

  }, [tournamentId])

  const addAchievement = () => {

    if (!level || !medalType || !year) {
      alert("Fill achievement fields")
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

    // ✅ USE CENTRALIZED CATEGORY LOGIC
    const { age_category, weight_category, category_key } = getCategory({
      age: Number(age),
      weight: Number(weight),
      gender
    })

    if (existingPlayer) {

      playerId = existingPlayer.id

      await supabase
        .from("players")
        .update({
          age: Number(age),
          weight: Number(weight),
          age_category,
          weight_category
        })
        .eq("id", playerId)
    } else {

      const { data: newPlayer, error } = await supabase
        .from("players")
        .insert({
          name,
          email,
          phone,
          district: district,
          age: Number(age),
          weight: Number(weight),
          gender,
          belt_rank: beltRank,

          // ✅ CATEGORY FROM UTILS
          age_category,
          weight_category,

          student_type: studentType,
          school_name: studentType === "school" ? schoolName : null,
          college_name: studentType === "college" ? collegeName : null,
          academy: academy || null
        })
        .select()
        .single()

      if (error) {
        alert("Error creating player")
        setLoading(false)
        return
      }

      playerId = newPlayer.id
    }

    const { data: existingRegistration } = await supabase
      .from("registrations")
      .select("*")
      .eq("player_id", playerId)
      .eq("tournament_id", tournamentId)
      .maybeSingle()

    if (existingRegistration) {
      alert("You have already registered")
      setLoading(false)
      return
    }

    // ✅ USE category_key FROM UTILS
    await supabase.from("registrations").insert({
      player_id: playerId,
      tournament_id: tournamentId,
      category_key, // ✅ FIXED
      approved: false
    })

    if (achievements.length > 0) {
      const rows = achievements.map(a => ({
        player_id: playerId,
        level: a.level,
        medal_type: a.medal_type,
        year: a.year
      }))

      await supabase.from("player_achievements").insert(rows)
    }

    const participationRows: any[] = []
    const currentYear = new Date().getFullYear()

    const levels = [
      { count: districtParticipations, level: "district" },
      { count: stateParticipations, level: "state" },
      { count: nationalParticipations, level: "national" }
    ]

    // 🔍 DEBUG: raw input values
    // console.log("Raw Inputs:", {
    //   districtParticipations,
    //   stateParticipations,
    //   nationalParticipations
    // })

    levels.forEach(({ count, level }) => {
      const parsedCount = parseInt(count) || 0

      // 🔍 DEBUG: parsed values
      // console.log(`Parsed count for ${level}:`, parsedCount)

      for (let i = 0; i < parsedCount; i++) {
        participationRows.push({
          player_id: playerId,
          level,
          year: currentYear
        })
      }
    })

    // 🔍 DEBUG: final rows
    // console.log("FINAL participationRows:", participationRows)

    if (participationRows.length > 0) {
      const { data, error } = await supabase
        .from("player_participations")
        .insert(participationRows)
        .select()

      // 🔍 DEBUG: DB response
      // console.log("Insert Data:", data)
      // console.log("Insert Error (raw):", error)
      // console.log("Insert Error (stringified):", JSON.stringify(error, null, 2))

      if (error) {
        alert("Participation insert failed")
      }
    } else {
      console.warn("No participation rows to insert ❗")
    }

    alert("Registration successful")

    // RESET
    setName("")
    setEmail("")
    setPhone("")
    setDistrict("")
    setAge("")
    setWeight("")
    setGender("")
    setBeltRank("")
    setStudentType("")
    setSchoolName("")
    setCollegeName("")
    setAcademy("")
    setDistrictParticipations("")
    setStateParticipations("")
    setNationalParticipations("")
    setAchievements([])

    setLoading(false)
  }

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-2">
        Player Registration
      </h1>

      {tournament && (
        <p className="mb-4 text-gray-600">
          {tournament.name} ({tournament.level} Level)
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <input placeholder="Name" className="border p-2 w-full"
          value={name} onChange={(e) => setName(e.target.value)} />

        <input placeholder="Email" className="border p-2 w-full"
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <input placeholder="Phone" className="border p-2 w-full"
          value={phone} onChange={(e) => setPhone(e.target.value)} />

        <input
          placeholder="District"
          className="border p-2 w-full"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        />

        <input type="number" placeholder="Age" className="border p-2 w-full"
          value={age} onChange={(e) => setAge(e.target.value)} />

        <input type="number" placeholder="Weight" className="border p-2 w-full"
          value={weight} onChange={(e) => setWeight(e.target.value)} />

        <select className="border p-2 w-full"
          value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input placeholder="Belt Rank" className="border p-2 w-full"
          value={beltRank} onChange={(e) => setBeltRank(e.target.value)} />

        {/* STUDENT */}
        <select className="border p-2 w-full"
          value={studentType}
          onChange={(e) => setStudentType(e.target.value)}>
          <option value="">Student Type</option>
          <option value="school">School</option>
          <option value="college">College</option>
          <option value="none">Not a Student</option>
        </select>

        {studentType === "school" && (
          <input placeholder="School Name" className="border p-2 w-full"
            value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
        )}

        {studentType === "college" && (
          <input placeholder="College Name" className="border p-2 w-full"
            value={collegeName} onChange={(e) => setCollegeName(e.target.value)} />
        )}

        <input placeholder="Academy (optional)" className="border p-2 w-full"
          value={academy} onChange={(e) => setAcademy(e.target.value)} />

        {/* PARTICIPATIONS */}
        <h2 className="font-semibold">Participations</h2>

        <input type="number" placeholder="District"
          className="border p-2 w-full"
          value={districtParticipations}
          onChange={(e) => setDistrictParticipations(e.target.value)} />

        <input type="number" placeholder="State"
          className="border p-2 w-full"
          value={stateParticipations}
          onChange={(e) => setStateParticipations(e.target.value)} />

        <input type="number" placeholder="National"
          className="border p-2 w-full"
          value={nationalParticipations}
          onChange={(e) => setNationalParticipations(e.target.value)} />

        {/* ACHIEVEMENTS */}
        <h2 className="font-semibold">Achievements</h2>

        <select className="border p-2 w-full"
          value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Level</option>
          <option value="district">District</option>
          <option value="state">State</option>
          <option value="national">National</option>
        </select>

        <select className="border p-2 w-full"
          value={medalType} onChange={(e) => setMedalType(e.target.value)}>
          <option value="">Medal</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>

        <input type="number" placeholder="Year"
          className="border p-2 w-full"
          value={year} onChange={(e) => setYear(e.target.value)} />

        <button type="button"
          onClick={addAchievement}
          className="bg-gray-500 text-white px-3 py-1 rounded">
          Add Achievement
        </button>

        {achievements.map((a, i) => (
          <div key={i} className="text-sm">
            {a.level} {a.medal_type} ({a.year})
          </div>
        ))}

        <button type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "Registering..." : "Register"}
        </button>

      </form>
    </div>
  )
}