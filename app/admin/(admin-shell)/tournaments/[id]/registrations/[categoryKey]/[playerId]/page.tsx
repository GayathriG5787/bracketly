"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { 
  ChevronLeft, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  FileText, 
  History, 
  Trophy, 
  CheckCircle,
  ExternalLink,
  Loader2,
  Building2
} from "lucide-react"

export default function PlayerDetailPage() {
  const { id, categoryKey, playerId } = useParams()
  const router = useRouter()

  const [data, setData] = useState<any>(null)
  const [approving, setApproving] = useState(false)

  const fetchPlayer = async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select(`
        id,
        approved,
        district,
        age,
        weight,
        gender,
        belt_rank,
        address_line1,
        address_line2,
        city,
        state,
        pincode,
        student_type,
        school_name,
        college_name,
        academy,
        birth_certificate_url,
        aadhar_card_url,
        belt_certificate_url,
        school_bonafide_url,
        college_proof_url,
        players (
          id,
          name,
          email,
          phone,
          player_achievements (level, medal_type, year, certificate_url),
          player_participations (level, year, certificate_url)
        )
      `)
      .eq("tournament_id", id)
      .eq("category_key", categoryKey)
      .eq("player_id", playerId)
      .single()

    if (!error) setData(data)
  }

  useEffect(() => {
    fetchPlayer()
  }, [])

  const approvePlayer = async () => {
    if (data.approved) return
    setApproving(true)

    const { error } = await supabase
      .from("registrations")
      .update({ approved: true })
      .eq("id", data.id)

    if (error) {
      alert("Approval failed")
      setApproving(false)
      return
    }

    setData({ ...data, approved: true })
    setApproving(false)
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <Loader2 className="animate-spin mb-2" size={32} />
      <p>Loading athlete profile...</p>
    </div>
  )

  const player = data.players || {}

  return (
    <div className="max-w-5xl">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center text-slate-500 hover:text-[#4169E1] transition-colors mb-4 text-sm font-medium gap-1"
          >
            <ChevronLeft size={16} />
            Back to Roster
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{player.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="bg-blue-50 text-[#4169E1] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {data.belt_rank} Belt
            </span>
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <MapPin size={14} /> {data.district}
            </span>
          </div>
        </div>

        <div>
          {!data.approved ? (
            <button
              onClick={approvePlayer}
              disabled={approving}
              className="w-full md:w-auto bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
            >
              {approving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              Approve Registration
            </button>
          ) : (
            <div className="bg-slate-100 text-slate-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed border border-slate-200">
              <CheckCircle size={18} />
              Approved
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: PRIMARY INFO */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Age", value: data.age },
              { label: "Weight", value: data.weight },
              { label: "Gender", value: data.gender },
              { label: "Division", value: categoryKey },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{stat.label}</p>
                <p className="text-lg font-bold text-slate-900 truncate">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* CONTACT & ADDRESS */}
          <div className="bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <User size={18} className="text-[#4169E1]" />
                Personal Information
              </h3>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                    <p className="text-sm font-medium text-slate-700">{player.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Phone Number</p>
                    <p className="text-sm font-medium text-slate-700">{player.phone}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest text-right">Mailing Address</p>
                <p className="text-sm text-slate-600 text-right">{data.address_line1}</p>
                {data.address_line2 && <p className="text-sm text-slate-600 text-right">{data.address_line2}</p>}
                <p className="text-sm text-slate-600 text-right">{data.city}, {data.state} - {data.pincode}</p>
              </div>
            </div>
          </div>

          {/* SPORTS HISTORY */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Participations */}
            <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                <History size={18} className="text-[#4169E1]" />
                Participations
              </h3>
              {player.player_participations.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No history recorded</p>
              ) : (
                <div className="space-y-3">
                  {player.player_participations.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{p.level}</p>
                        <p className="text-xs text-slate-400">{p.year}</p>
                      </div>
                      {p.certificate_url && (
                        <a href={p.certificate_url} target="_blank" className="text-[#4169E1] hover:underline flex items-center gap-1 text-xs font-bold">
                          View <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                <Trophy size={18} className="text-yellow-500" />
                Achievements
              </h3>
              {player.player_achievements.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No achievements recorded</p>
              ) : (
                <div className="space-y-3">
                  {player.player_achievements.map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-yellow-50/50 border border-yellow-100">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{a.medal_type} Medal</p>
                        <p className="text-xs text-slate-500">{a.level} • {a.year}</p>
                      </div>
                      {a.certificate_url && (
                        <a href={a.certificate_url} target="_blank" className="text-yellow-700 hover:underline flex items-center gap-1 text-xs font-bold">
                          View <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSTITUTION & DOCUMENTS */}
        <div className="space-y-8">
          {/* INSTITUTION */}
          <div className="bg-slate-900 text-white rounded-[1.5rem] p-6 shadow-xl">
            <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mb-4">Affiliation</h3>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Student Type</p>
                <p className="text-sm font-bold mb-3">{data.student_type || "N/A"}</p>
                
                <p className="text-xs text-slate-400 font-medium">Institution/Academy</p>
                <p className="text-sm font-bold">
                  {data.school_name || data.college_name || data.academy || "Independent"}
                </p>
              </div>
            </div>
          </div>

          {/* DOCUMENTS LIST */}
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
              <FileText size={18} className="text-[#4169E1]" />
              Verification Docs
            </h3>
            <div className="space-y-2">
              {[
                { label: "Birth Certificate", url: data.birth_certificate_url },
                { label: "Aadhar Card", url: data.aadhar_card_url },
                { label: "Belt Certificate", url: data.belt_certificate_url },
                { label: "School Bonafide", url: data.school_bonafide_url },
                { label: "College Proof", url: data.college_proof_url },
              ].map((doc, i) => doc.url && (
                <a 
                  key={i} 
                  href={doc.url} 
                  target="_blank" 
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-[#4169E1] hover:bg-blue-50/50 transition-all group"
                >
                  <span className="text-sm text-slate-600 font-medium group-hover:text-[#4169E1]">{doc.label}</span>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-[#4169E1]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}