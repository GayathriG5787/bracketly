"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useParams, useRouter } from "next/navigation"
import { getCategory } from "@/utils/category"
import { beltOptions } from "@/utils/beltOptions"
import { 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  Trophy, 
  Medal, 
  ChevronLeft, 
  Upload,
  CheckCircle2,
  Award
} from "lucide-react"

export default function RegisterPlayer() {
  const params = useParams<{ id: string }>()
  const tournamentId = params.id
  const router = useRouter()

  const [tournament, setTournament] = useState<any>(null)
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)

  // Form States
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
  
  // Address States
  const [address1, setAddress1] = useState("")
  const [address2, setAddress2] = useState("")
  const [city, setCity] = useState("")
  const [stateName, setStateName] = useState("")
  const [pincode, setPincode] = useState("")

  // Participations Logic
  const [districtParticipations, setDistrictParticipations] = useState("")
  const [stateParticipations, setStateParticipations] = useState("")
  const [nationalParticipations, setNationalParticipations] = useState("")
  const [participations, setParticipations] = useState<any[]>([])

  useEffect(() => {
    const totalNeeded = Number(districtParticipations || 0) + 
                        Number(stateParticipations || 0) + 
                        Number(nationalParticipations || 0);
    
    setParticipations(prev => {
      if (prev.length === totalNeeded) return prev;
      if (prev.length > totalNeeded) return prev.slice(0, totalNeeded);
      const extra = Array(totalNeeded - prev.length).fill({ level: "", file: null });
      return [...prev, ...extra];
    });
  }, [districtParticipations, stateParticipations, nationalParticipations]);

  // Achievements Logic
  const [achievements, setAchievements] = useState<any[]>([])
  const [level, setLevel] = useState("")
  const [medalType, setMedalType] = useState("")
  const [year, setYear] = useState("")
  const [achievementFile, setAchievementFile] = useState<File | null>(null)

  // Standard Documents
  const [birthCert, setBirthCert] = useState<File | null>(null)
  const [aadhar, setAadhar] = useState<File | null>(null)
  const [beltCert, setBeltCert] = useState<File | null>(null)
  const [schoolProof, setSchoolProof] = useState<File | null>(null)
  const [collegeProof, setCollegeProof] = useState<File | null>(null)

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/"); return; }
      setUserEmail(user.email || "")

      const [{ data: tournData }, { data: playerData }] = await Promise.all([
        supabase.from("tournaments").select("*").eq("id", tournamentId).single(),
        supabase.from("players").select("*").eq("user_id", user.id).single()
      ])

      setTournament(tournData)
      if (playerData) {
        setPlayer(playerData)
        setName(playerData.name || "")
        setPhone(playerData.phone || "")
      }
    }
    initData()
  }, [tournamentId, router])

  const uploadFile = async (file: File, folder: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "bracketly_upload")
    formData.append("folder", folder)
    const res = await fetch("https://api.cloudinary.com/v1_1/djtxsrxve/upload", { method: "POST", body: formData })
    const data = await res.json()
    return data.secure_url
  }

  const addAchievement = () => {
    if (!level || !medalType || !year || !achievementFile) {
      alert("Fill all achievement fields + upload certificate")
      return
    }
    setAchievements([...achievements, { level, medal_type: medalType, year: Number(year), file: achievementFile }])
    setLevel(""); setMedalType(""); setYear(""); setAchievementFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (
      !name || !phone || !age || !weight || !gender || !beltRank || 
      !address1 || !address2 || !city || !district || !stateName || !pincode ||
      !birthCert || !aadhar || !beltCert || !studentType
    ) {
      alert("Please fill all mandatory fields and upload required documents (Birth Certificate, Aadhar, and Belt Certificate).")
      return
    }

    if (studentType === "school" && (!schoolName || !schoolProof)) {
      alert("As a school student, School Name and School Bonafide are mandatory.")
      return
    }

    if (studentType === "college" && (!collegeName || !collegeProof)) {
      alert("As a college student, College Name and College Proof are mandatory.")
      return
    }

    const totalP = Number(districtParticipations || 0) + Number(stateParticipations || 0) + Number(nationalParticipations || 0)
    const uploadedParticipations = participations.filter(p => p.file).length
    if (totalP > 0 && uploadedParticipations !== totalP) {
        alert("Please upload certificates for all specified participation counts.")
        return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !player) throw new Error("User data missing")

      if (isEditingPhone) {
        await supabase.from("players").update({ phone }).eq("id", player.id)
      }

      const { category_key, age_category, weight_category } = getCategory({ age: Number(age), weight: Number(weight), gender })

      const baseFolder = `bracketly/tournaments/${tournamentId}/players/${player.id}/documents`
      
      const [birthUrl, aadharUrl, beltUrl, schoolUrl, collegeUrl] = await Promise.all([
        uploadFile(birthCert!, `${baseFolder}/birth_certificate`),
        uploadFile(aadhar!, `${baseFolder}/aadhar`),
        uploadFile(beltCert!, `${baseFolder}/belt`),
        schoolProof ? uploadFile(schoolProof, `${baseFolder}/school`) : null,
        collegeProof ? uploadFile(collegeProof, `${baseFolder}/college`) : null,
      ])

      await supabase.from("registrations").insert({
        player_id: player.id,
        tournament_id: tournamentId,
        age: Number(age), weight: Number(weight), gender, belt_rank: beltRank,
        district, academy, student_type: studentType,
        school_name: studentType === "school" ? schoolName : null,
        college_name: studentType === "college" ? collegeName : null,
        age_category, weight_category, category_key,
        address_line1: address1, address_line2: address2, city, state: stateName, pincode,
        birth_certificate_url: birthUrl, aadhar_card_url: aadharUrl, belt_certificate_url: beltUrl,
        school_bonafide_url: schoolUrl, college_proof_url: collegeUrl, approved: false
      })

      if (achievements.length > 0) {
        const achievementRows = await Promise.all(achievements.map(async (a) => ({
            player_id: player.id,
            level: a.level,
            medal_type: a.medal_type,
            year: a.year,
            certificate_url: await uploadFile(a.file, `bracketly/tournaments/${tournamentId}/players/${player.id}/achievements`)
        })))
        await supabase.from("player_achievements").insert(achievementRows)
      }

      if (totalP > 0) {
        const finalParticipations = participations.slice(0, totalP);
        const participationRows = await Promise.all(finalParticipations.map(async (p) => {
            if (!p.file) return null;
            return {
                player_id: player.id,
                level: p.level,
                year: new Date().getFullYear(),
                certificate_url: await uploadFile(p.file, `bracketly/tournaments/${tournamentId}/players/${player.id}/participations`)
            }
        }))
        const validRows = participationRows.filter(r => r !== null);
        if (validRows.length > 0) {
            await supabase.from("player_participations").insert(validRows)
        }
      }

      alert("Registration successful")
      router.push('/player/dashboard')
    } catch (err) {
      console.error(err)
      alert("Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10 max-w-4xl mx-auto pb-20 p-4">
      <div className="border-l-4 border-[#4169E1] pl-6">
        <button onClick={() => router.back()} className="text-[10px] font-bold text-[#4169E1] uppercase tracking-widest flex items-center gap-1 mb-2 hover:opacity-70">
          <ChevronLeft size={12} /> Back
        </button>
        <h1 className="text-3xl font-bold tracking-tighter text-slate-900">Tournament Registration</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><User size={20} /></div>
            <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" value={name} onChange={setName} required />
            <InputField label="Email Address" value={userEmail} disabled />
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="flex gap-2">
                <input required className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" value={phone} disabled={!isEditingPhone && !!player?.phone} onChange={(e) => setPhone(e.target.value)} />
                {player?.phone && !isEditingPhone && (
                  <button type="button" onClick={() => setIsEditingPhone(true)} className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">Edit</button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Age" type="number" min="0" value={age} onChange={setAge} required />
              <InputField label="Weight (kg)" type="number" min="0" value={weight} onChange={setWeight} required />
            </div>
            <SelectField label="Gender" value={gender} onChange={setGender} options={["Male", "Female"]} required />
            <SelectField label="Belt Rank" value={beltRank} onChange={setBeltRank} options={beltOptions.map(b => b.value)} required />
          </div>
        </div>

        {/* ... (Address and Documents sections remain unchanged) ... */}
        
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><MapPin size={20} /></div>
            <h2 className="text-xl font-bold text-slate-900">Address Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2"><InputField label="Address Line 1" value={address1} onChange={setAddress1} required /></div>
            <InputField label="Address Line 2" value={address2} onChange={setAddress2} required />
            <InputField label="City" value={city} onChange={setCity} required />
            <InputField label="District" value={district} onChange={setDistrict} required />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="State" value={stateName} onChange={setStateName} required />
              <InputField label="Pincode" value={pincode} onChange={setPincode} required />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><FileText size={20} /></div>
            <h2 className="text-xl font-bold text-slate-900">Required Documents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploader label="Birth Certificate" file={birthCert} onChange={setBirthCert} />
            <FileUploader label="Aadhar Card" file={aadhar} onChange={setAadhar} />
            <FileUploader label="Belt Certificate" file={beltCert} onChange={setBeltCert} />
            <SelectField label="Student Status" value={studentType} onChange={setStudentType} options={["school", "college", "none"]} required />
            
            {studentType === "school" && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <InputField label="School Name" value={schoolName} onChange={setSchoolName} required />
                <FileUploader label="School Bonafide" file={schoolProof} onChange={setSchoolProof} />
              </div>
            )}
            {studentType === "college" && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <InputField label="College Name" value={collegeName} onChange={setCollegeName} required />
                <FileUploader label="College Proof" file={collegeProof} onChange={setCollegeProof} />
              </div>
            )}
            <div className="md:col-span-2">
              <InputField label="Academy (Optional)" value={academy} onChange={setAcademy} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Award size={20} /></div>
            <h2 className="text-xl font-bold text-slate-900">Past Participations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <InputField label="District Count" type="number" min="0" value={districtParticipations} onChange={setDistrictParticipations} />
            <InputField label="State Count" type="number" min="0" value={stateParticipations} onChange={setStateParticipations} />
            <InputField label="National Count" type="number" min="0" value={nationalParticipations} onChange={setNationalParticipations} />
          </div>
          {/* ... (Participation certificate rendering remains unchanged) ... */}
          <div className="space-y-4">
            {[...Array(Number(districtParticipations || 0))].map((_, i) => (
              <FileUploader key={`dist-${i}`} label={`District Certificate ${i + 1}`} file={participations[i]?.file} onChange={(f: File) => {
                const up = [...participations]; up[i] = { level: "district", file: f }; setParticipations(up);
              }} />
            ))}
            {[...Array(Number(stateParticipations || 0))].map((_, i) => {
              const idx = Number(districtParticipations) + i;
              return <FileUploader key={`state-${i}`} label={`State Certificate ${i + 1}`} file={participations[idx]?.file} onChange={(f: File) => {
                const up = [...participations]; up[idx] = { level: "state", file: f }; setParticipations(up);
              }} />
            })}
             {[...Array(Number(nationalParticipations || 0))].map((_, i) => {
              const idx = Number(districtParticipations) + Number(stateParticipations) + i;
              return <FileUploader key={`nat-${i}`} label={`National Certificate ${i + 1}`} file={participations[idx]?.file} onChange={(f: File) => {
                const up = [...participations]; up[idx] = { level: "national", file: f }; setParticipations(up);
              }} />
            })}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-lg text-white"><Trophy size={20} /></div>
            <h2 className="text-xl font-bold">Notable Achievements</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <SelectField label="Level" value={level} onChange={setLevel} options={["district", "state", "national"]} dark />
            <SelectField label="Medal" value={medalType} onChange={setMedalType} options={["gold", "silver", "bronze"]} dark />
            <InputField label="Year" type="number" min="1900" value={year} onChange={setYear} placeholder="YYYY" dark />
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Certificate</label>
               <input type="file" className="hidden" id="ach-file" onChange={e => setAchievementFile(e.target.files?.[0] || null)} />
               <label htmlFor="ach-file" className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold cursor-pointer hover:bg-white/10 truncate transition-all">
                <Upload size={14} /> {achievementFile ? achievementFile.name : "Upload File"}
               </label>
            </div>
          </div>
          <div className="flex justify-end pt-6">
            <button type="button" onClick={addAchievement} className="w-full md:w-auto md:px-12 py-3 bg-[#4169E1] rounded-xl text-xs font-bold">Add Entry</button>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {achievements.map((a, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-xs border border-white/5">
                <Medal size={14} className="text-amber-400" /> <span className="capitalize">{a.level}</span> • <span className="capitalize">{a.medal_type}</span> ({a.year})
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className={`w-full py-5 rounded-[1.5rem] font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all ${loading ? 'bg-slate-200 text-slate-400' : 'bg-[#4169E1] text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}>
          {loading ? "Registering..." : <><CheckCircle2 size={18} /> Complete Registration</>}
        </button>
      </form>
    </div>
  )
}

/**
 * Updated InputField to block negative inputs
 */
function InputField({ label, dark, type, ...props }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // If it's a number field, prevent negative values
    if (type === "number" && val !== "" && Number(val) < 0) {
      return; 
    }
    
    props.onChange(val);
  };

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        type={type}
        className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-[#4169E1] outline-none transition-all ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
        {...props} 
        onChange={handleChange} 
      />
    </div>
  )
}

function SelectField({ label, options, dark, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <select className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all capitalize ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} {...props} onChange={e => props.onChange(e.target.value)}>
        <option value="" className="text-slate-900">Select {label}</option>
        {options.map((opt: string) => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
      </select>
    </div>
  )
}

function FileUploader({ label, file, onChange }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <label className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100">
        <span className="text-xs font-bold text-[#4169E1] flex items-center gap-2"><Upload size={14} /> {file ? "Change" : "Upload"}</span>
        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{file ? file.name : "Certificate Required"}</span>
        <input type="file" className="hidden" onChange={e => onChange(e.target.files?.[0] || null)} />
      </label>
    </div>
  )
}