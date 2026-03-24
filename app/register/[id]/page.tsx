"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { getCategoryKey } from "@/lib/categoryKey"

export default function RegisterPlayer() {

  const params = useParams()
  const tournamentId = params.id as string

  const [tournament, setTournament] = useState<any>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [district, setDistrict] = useState("")
  const [age, setAge] = useState("")
  const [weight, setWeight] = useState("")
  const [gender, setGender] = useState("")
  const [beltRank, setBeltRank] = useState("")

  // ✅ NEW CONTEXT FIELDS
  const [studentType, setStudentType] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [collegeName, setCollegeName] = useState("")
  const [academy, setAcademy] = useState("")

  // ✅ PARTICIPATIONS
  const [districtParticipations, setDistrictParticipations] = useState("")
  const [stateParticipations, setStateParticipations] = useState("")
  const [nationalParticipations, setNationalParticipations] = useState("")

  // ✅ ACHIEVEMENTS
  const [achievements, setAchievements] = useState<any[]>([])
  const [level, setLevel] = useState("")
  const [medalType, setMedalType] = useState("")
  const [year, setYear] = useState("")

  const [loading, setLoading] = useState(false)

  function getCategory(age: number, weight: number, gender: string) {

  let ageCategory = ""
  let weightCategory = ""

  if (age <= 7) {
    ageCategory = "Infant"

    if (weight <= 17) weightCategory = "Under 17"
    else if (weight <= 19) weightCategory = "Under 19"
    else if (weight <= 21) weightCategory = "Under 21"
    else if (weight <= 23) weightCategory = "Under 23"
    else weightCategory = "Over 23"
  }

  else if (age <= 11) {
    ageCategory = "Sub-Junior"

    if (gender === "Male") {
      if (weight <= 16) weightCategory = "Under 16"
      else if (weight <= 18) weightCategory = "Under 18"
      else if (weight <= 21) weightCategory = "Under 21"
      else if (weight <= 23) weightCategory = "Under 23"
      else if (weight <= 25) weightCategory = "Under 25"
      else if (weight <= 27) weightCategory = "Under 27"
      else if (weight <= 29) weightCategory = "Under 29"
      else if (weight <= 32) weightCategory = "Under 32"
      else if (weight <= 35) weightCategory = "Under 35"
      else if (weight <= 38) weightCategory = "Under 38"
      else if (weight <= 41) weightCategory = "Under 41"
      else if (weight <= 44) weightCategory = "Under 44"
      else if (weight <= 50) weightCategory = "Under 50"
      else weightCategory = "Over 50"
    } else {
      if (weight <= 14) weightCategory = "Under 14"
      else if (weight <= 16) weightCategory = "Under 16"
      else if (weight <= 18) weightCategory = "Under 18"
      else if (weight <= 20) weightCategory = "Under 20"
      else if (weight <= 22) weightCategory = "Under 22"
      else if (weight <= 24) weightCategory = "Under 24"
      else if (weight <= 26) weightCategory = "Under 26"
      else if (weight <= 29) weightCategory = "Under 29"
      else if (weight <= 32) weightCategory = "Under 32"
      else if (weight <= 35) weightCategory = "Under 35"
      else if (weight <= 38) weightCategory = "Under 38"
      else if (weight <= 41) weightCategory = "Under 41"
      else if (weight <= 47) weightCategory = "Under 47"
      else weightCategory = "Over 47"
    }
  }

  else if (age <= 14) {
    ageCategory = "Cadet"

    if (gender === "Male") {
      if (weight <= 33) weightCategory = "Under 33"
      else if (weight <= 37) weightCategory = "Under 37"
      else if (weight <= 41) weightCategory = "Under 41"
      else if (weight <= 45) weightCategory = "Under 45"
      else if (weight <= 49) weightCategory = "Under 49"
      else if (weight <= 53) weightCategory = "Under 53"
      else if (weight <= 57) weightCategory = "Under 57"
      else if (weight <= 61) weightCategory = "Under 61"
      else if (weight <= 65) weightCategory = "Under 65"
      else weightCategory = "Over 65"
    } else {
      if (weight <= 29) weightCategory = "Under 29"
      else if (weight <= 33) weightCategory = "Under 33"
      else if (weight <= 37) weightCategory = "Under 37"
      else if (weight <= 41) weightCategory = "Under 41"
      else if (weight <= 44) weightCategory = "Under 44"
      else if (weight <= 47) weightCategory = "Under 47"
      else if (weight <= 51) weightCategory = "Under 51"
      else if (weight <= 55) weightCategory = "Under 55"
      else if (weight <= 59) weightCategory = "Under 59"
      else weightCategory = "Over 59"
    }
  }

  else if (age <= 17) {
    ageCategory = "Junior"

    if (gender === "Male") {
      if (weight <= 45) weightCategory = "Under 45"
      else if (weight <= 48) weightCategory = "Under 48"
      else if (weight <= 51) weightCategory = "Under 51"
      else if (weight <= 55) weightCategory = "Under 55"
      else if (weight <= 59) weightCategory = "Under 59"
      else if (weight <= 63) weightCategory = "Under 63"
      else if (weight <= 68) weightCategory = "Under 68"
      else if (weight <= 73) weightCategory = "Under 73"
      else if (weight <= 78) weightCategory = "Under 78"
      else weightCategory = "Over 78"
    } else {
      if (weight <= 42) weightCategory = "Under 42"
      else if (weight <= 44) weightCategory = "Under 44"
      else if (weight <= 46) weightCategory = "Under 46"
      else if (weight <= 49) weightCategory = "Under 49"
      else if (weight <= 52) weightCategory = "Under 52"
      else if (weight <= 55) weightCategory = "Under 55"
      else if (weight <= 59) weightCategory = "Under 59"
      else if (weight <= 63) weightCategory = "Under 63"
      else if (weight <= 68) weightCategory = "Under 68"
      else weightCategory = "Over 68"
    }
  }

  else {
    ageCategory = "Senior"

    if (gender === "Male") {
      if (weight <= 54) weightCategory = "Under 54"
      else if (weight <= 58) weightCategory = "Under 58"
      else if (weight <= 63) weightCategory = "Under 63"
      else if (weight <= 68) weightCategory = "Under 68"
      else if (weight <= 74) weightCategory = "Under 74"
      else if (weight <= 80) weightCategory = "Under 80"
      else if (weight <= 87) weightCategory = "Under 87"
      else weightCategory = "Over 87"
    } else {
      if (weight <= 46) weightCategory = "Under 46"
      else if (weight <= 49) weightCategory = "Under 49"
      else if (weight <= 53) weightCategory = "Under 53"
      else if (weight <= 57) weightCategory = "Under 57"
      else if (weight <= 62) weightCategory = "Under 62"
      else if (weight <= 67) weightCategory = "Under 67"
      else if (weight <= 73) weightCategory = "Under 73"
      else weightCategory = "Over 73"
    }
  }

  return { ageCategory, weightCategory }
}

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

    const { ageCategory, weightCategory } = getCategory(
      Number(age),
      Number(weight),
      gender
    )

    if (existingPlayer) {

      playerId = existingPlayer.id

      await supabase
        .from("players")
        .update({
          age: Number(age),
          weight: Number(weight),
          age_category: ageCategory,
          weight_category: weightCategory
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

          // ✅ ADD HERE
          age_category: ageCategory,
          weight_category: weightCategory,

          // ✅ CONTEXT DATA
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

    // ✅ CHECK DUPLICATE REGISTRATION
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

    // ✅ REGISTER
    await supabase.from("registrations").insert({
      player_id: playerId,
      tournament_id: tournamentId,
      category_key: getCategoryKey(ageCategory, gender, weightCategory), // ✅ MUST
      approved: false
    })

    // ✅ ACHIEVEMENTS INSERT
    if (achievements.length > 0) {
      const rows = achievements.map(a => ({
        player_id: playerId,
        level: a.level,
        medal_type: a.medal_type,
        year: a.year
      }))

      await supabase.from("player_achievements").insert(rows)
    }

    // ✅ PARTICIPATIONS INSERT
    const participationRows: any[] = []

    for (let i = 0; i < Number(districtParticipations || 0); i++) {
      participationRows.push({ player_id: playerId, level: "district" })
    }

    for (let i = 0; i < Number(stateParticipations || 0); i++) {
      participationRows.push({ player_id: playerId, level: "state" })
    }

    for (let i = 0; i < Number(nationalParticipations || 0); i++) {
      participationRows.push({ player_id: playerId, level: "national" })
    }

    if (participationRows.length > 0) {
      await supabase.from("player_participations").insert(participationRows)
    }

    alert("Registration successful")

    // ✅ RESET FORM
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