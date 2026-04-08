"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PlayerDetailPage() {
  const { id, categoryKey, playerId } = useParams()

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

          player_achievements (
            level,
            medal_type,
            year,
            certificate_url
          ),

          player_participations (
            level,
            year,
            certificate_url
          )
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

    // update UI instantly
    setData({ ...data, approved: true })
    setApproving(false)
    }

  if (!data) return <p className="p-6">Loading...</p>

  const player = data.players || {}

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-bold">Player Details</h2>

      {/* BASIC INFO */}
      <div className="space-y-2">
        <p><strong>Name:</strong> {player.name}</p>
        <p><strong>Email:</strong> {player.email}</p>
        <p><strong>Phone:</strong> {player.phone}</p>
        <p><strong>District:</strong> {data.district}</p>
        <p><strong>Age:</strong> {data.age}</p>
        <p><strong>Weight:</strong> {data.weight}</p>
        <p><strong>Gender:</strong> {data.gender}</p>
        <p><strong>Belt Rank:</strong> {data.belt_rank}</p>
      </div>

      {/* ADDRESS */}
      <div>
        <h3 className="font-semibold text-lg">Address</h3>
        <p>{data.address_line1}</p>
        <p>{data.address_line2}</p>
        <p>{data.city}, {data.state} - {data.pincode}</p>
      </div>

      {/* STUDENT INFO */}
      <div>
        <h3 className="font-semibold text-lg">Student Info</h3>
        <p><strong>Type:</strong> {data.student_type  || "N/A"}</p>
        {data.school_name && <p><strong>School:</strong> {player.school_name}</p>}
        {data.college_name && <p><strong>College:</strong> {player.college_name}</p>}
        {data.academy && <p><strong>Academy:</strong> {player.academy}</p>}
      </div>

      {/* DOCUMENTS */}
      <div>
        <h3 className="font-semibold text-lg">Documents</h3>

        {data.birth_certificate_url && (
          <p>
            <a href={data.birth_certificate_url} target="_blank" className="text-blue-600 underline">
              View Birth Certificate
            </a>
          </p>
        )}

        {data.aadhar_card_url && (
          <p>
            <a href={player.aadhar_card_url} target="_blank" className="text-blue-600 underline">
              View Aadhar Card
            </a>
          </p>
        )}

        {data.belt_certificate_url && (
          <p>
            <a href={player.belt_certificate_url} target="_blank" className="text-blue-600 underline">
              View Belt Certificate
            </a>
          </p>
        )}

        {data.school_bonafide_url && (
          <p>
            <a href={player.school_bonafide_url} target="_blank" className="text-blue-600 underline">
              View School Bonafide
            </a>
          </p>
        )}

        {data.college_proof_url && (
          <p>
            <a href={player.college_proof_url} target="_blank" className="text-blue-600 underline">
              View College Proof
            </a>
          </p>
        )}
      </div>

      {/* PARTICIPATIONS */}
      <div>
        <h3 className="font-semibold text-lg">Participations</h3>

        {player.player_participations.length === 0 && <p>No participations</p>}

        {player.player_participations.map((p: any, i: number) => (
          <div key={i} className="mb-2">
            <p>{p.level} ({p.year})</p>
            {p.certificate_url && (
              <a href={p.certificate_url} target="_blank" className="text-blue-600 underline">
                View Certificate
              </a>
            )}
          </div>
        ))}
      </div>

      {/* ACHIEVEMENTS */}
      <div>
        <h3 className="font-semibold text-lg">Achievements</h3>

        {player.player_achievements.length === 0 && <p>No achievements</p>}

        {player.player_achievements.map((a: any, i: number) => (
          <div key={i} className="mb-2">
            <p>{a.level} - {a.medal_type} ({a.year})</p>
            {a.certificate_url && (
              <a href={a.certificate_url} target="_blank" className="text-blue-600 underline">
                View Certificate
              </a>
            )}
          </div>
        ))}
      </div>


      <div className="mt-4">

    {!data.approved ? (
        <button
        onClick={approvePlayer}
        disabled={approving}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
        {approving ? "Approving..." : "Approve Player"}
        </button>
    ) : (
        <button
        disabled
        className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
        >
        Approved
        </button>
    )}

    </div>

    </div>
  )
}