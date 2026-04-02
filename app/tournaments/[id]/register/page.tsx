"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import { getCategory } from "@/utils/category" // ✅ NEW
import { useRouter } from "next/navigation"
import { beltOptions } from "@/utils/beltOptions"

export default function RegisterPlayer() {

const params = useParams<{ id: string }>()
const tournamentId = params.id

  const [tournament, setTournament] = useState<any>(null)

  const [name, setName] = useState("")
  const [userEmail, setUserEmail] = useState("")
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

  // ADDRESS
  const [address1, setAddress1] = useState("")
  const [address2, setAddress2] = useState("")
  const [city, setCity] = useState("")
  const [stateName, setStateName] = useState("")
  const [pincode, setPincode] = useState("")

  // FILES
  const [birthCert, setBirthCert] = useState<File | null>(null)
  const [aadhar, setAadhar] = useState<File | null>(null)
  const [beltCert, setBeltCert] = useState<File | null>(null)
  const [schoolProof, setSchoolProof] = useState<File | null>(null)
  const [collegeProof, setCollegeProof] = useState<File | null>(null)

  // DYNAMIC PARTICIPATIONS
  const [participations, setParticipations] = useState([
    { level: "", file: null as File | null }
  ])

  // ACHIEVEMENT FILES
  const [achievementFiles, setAchievementFiles] = useState<File[]>([])

  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Logout error:", error)
    } else {
      router.replace("/") // go back to home
    }
}

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email) {
        setUserEmail(user.email)
      }
    }

    getUser()
  }, [])

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

  const uploadFile = async (file: File, folder: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "bracketly_upload")

    // 🔥 IMPORTANT: folder structure
    formData.append("folder", folder)

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/djtxsrxve/upload",
      {
        method: "POST",
        body: formData,
      }
    )

    const data = await res.json()
    return data.secure_url
  }

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()
    if (loading) return
    setLoading(true)

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user || !user.email) {
      alert("User not logged in")
      setLoading(false)
      return
    }

    const email = user.email

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

      // ✅ STEP 1: Create player WITHOUT file URLs
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

          address_line1: address1,
          address_line2: address2,
          city,
          state: stateName,
          pincode,

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

      if (error || !newPlayer) {
        console.error("Insert error:", error)
        alert("Error creating player")
        setLoading(false)
        return
      }

      playerId = newPlayer.id

      // ✅ STEP 2: Upload files AFTER getting playerId
      const baseFolder = `bracketly/tournaments/${tournamentId}/players/${playerId}/documents`

      const birthUrl = birthCert
        ? await uploadFile(birthCert, `${baseFolder}/birth_certificate`)
        : null

      const aadharUrl = aadhar
        ? await uploadFile(aadhar, `${baseFolder}/aadhar`)
        : null

      const beltUrl = beltCert
        ? await uploadFile(beltCert, `${baseFolder}/belt`)
        : null

      const schoolUrl = schoolProof
        ? await uploadFile(schoolProof, `${baseFolder}/school`)
        : null

      const collegeUrl = collegeProof
        ? await uploadFile(collegeProof, `${baseFolder}/college`)
        : null

      // ✅ STEP 3: Update player with ALL file URLs
      const { error: updateError } = await supabase
        .from("players")
        .update({
          birth_certificate_url: birthUrl,
          aadhar_card_url: aadharUrl,
          belt_certificate_url: beltUrl,
          school_bonafide_url: schoolUrl,
          college_proof_url: collegeUrl
        })
        .eq("id", playerId)

      if (updateError) {
        console.error("Update error:", updateError)
        alert("File upload failed")
        setLoading(false)
        return
      }
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

      const achievementRows = await Promise.all(
        achievements.map(async (a, i) => ({
          player_id: playerId,
          level: a.level,
          medal_type: a.medal_type,
          year: a.year,
          certificate_url: achievementFiles[i]
            ? await uploadFile(
                achievementFiles[i],
                `bracketly/tournaments/${tournamentId}/players/${playerId}/achievements`
              )
            : null
        }))
)

await supabase.from("player_achievements").insert(achievementRows)
    }

    // NEW PARTICIPATION LOGIC (WITH CERTIFICATES)

    const participationRowsNew = await Promise.all(
      participations.map(async (p) => ({
        player_id: playerId,
        level: p.level,
        year: new Date().getFullYear(),
        certificate_url: p.file
          ? await uploadFile(
              p.file,
              `bracketly/tournaments/${tournamentId}/players/${playerId}/participations`
            )
          : null
      }))
    )

    if (participationRowsNew.length > 0) {
      const { error } = await supabase
        .from("player_participations")
        .insert(participationRowsNew)

      if (error) {
        alert("Participation insert failed")
      }
    } else {
      console.warn("No participation rows to insert ❗")
    }

    alert("Registration successful")

    // RESET
    setName("")
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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      
      {/* ✅ HEADER WITH LOGOUT */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Player Registration
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {tournament && (
        <p className="mb-4 text-gray-600">
          {tournament.name} ({tournament.level} Level)
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          value={userEmail}
          disabled
          className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-medium mb-1">Age</label>
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
      </div>

      {/* Weight */}
      <div>
        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        {/* Belt */}
        <div>
          <label className="block text-sm font-medium mb-1">Belt</label>
          <select
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            value={beltRank}
            onChange={(e) => setBeltRank(e.target.value)}
          >
            <option value="">Select Belt</option>
            {beltOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white shadow rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Address</h2>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium mb-1">Address Line 1</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium mb-1">Address Line 2</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* District (reuse existing state) */}
          <div>
            <label className="block text-sm font-medium mb-1">District</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
            />
          </div>

          {/* Pincode */}
          <div>
            <label className="block text-sm font-medium mb-1">Pincode</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>
        </div>

        <h2 className="font-semibold">Documents</h2>

        {/* Birth Certificate */}
        <div>
          <label className="block text-sm font-medium mb-1">Birth Certificate</label>

          <label className="flex items-center gap-3 border p-2 rounded cursor-pointer">
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              Upload File
            </span>

            <span className="text-sm text-gray-600">
              {birthCert ? birthCert.name : "No file selected"}
            </span>

            <input
              type="file"
              className="hidden"
              onChange={(e) => setBirthCert(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {/* Aadhar */}
        <div>
          <label className="block text-sm font-medium mb-1">Aadhar Card</label>

          <label className="flex items-center gap-3 border p-2 rounded cursor-pointer">
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              Upload File
            </span>

            <span className="text-sm text-gray-600">
              {aadhar ? aadhar.name : "No file selected"}
            </span>

            <input
              type="file"
              className="hidden"
              onChange={(e) => setAadhar(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {/* Belt Certificate */}
        <div>
          <label className="block text-sm font-medium mb-1">Belt Certificate</label>

          <label className="flex items-center gap-3 border p-2 rounded cursor-pointer">
            <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              Upload File
            </span>

            <span className="text-sm text-gray-600">
              {beltCert ? beltCert.name : "No file selected"}
            </span>

            <input
              type="file"
              className="hidden"
              onChange={(e) => setBeltCert(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {studentType === "school" && (
          <input type="file" onChange={(e) => setSchoolProof(e.target.files?.[0] || null)} />
        )}

        {studentType === "college" && (
          <input type="file" onChange={(e) => setCollegeProof(e.target.files?.[0] || null)} />
        )}

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

        <div className="space-y-2">
          {achievements.map((a, i) => (
            <div key={i} className="bg-gray-100 px-3 py-2 rounded">
              {a.level} • {a.medal_type} • {a.year}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>

      </form>
    </div>
  )
}