"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PlayerDetailPage() {
  const { id, categoryKey, playerId } = useParams()

  const [data, setData] = useState<any>(null)

  const fetchPlayer = async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select(`
        id,
        approved,
        players (
          id,
          name,
          email,
          phone,
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
      .eq("players.id", playerId)
      .single()

    if (!error) setData(data)
  }

  useEffect(() => {
    fetchPlayer()
  }, [])

  if (!data) return <p className="p-6">Loading...</p>

  const player = data.players

  return (
    <div className="p-6 space-y-6">

      <h2 className="text-2xl font-bold">Player Details</h2>

      {/* BASIC INFO */}
      <div className="space-y-2">
        <p><strong>Name:</strong> {player.name}</p>
        <p><strong>Email:</strong> {player.email}</p>
        <p><strong>Phone:</strong> {player.phone}</p>
        <p><strong>District:</strong> {player.district}</p>
        <p><strong>Age:</strong> {player.age}</p>
        <p><strong>Weight:</strong> {player.weight}</p>
        <p><strong>Gender:</strong> {player.gender}</p>
        <p><strong>Belt Rank:</strong> {player.belt_rank}</p>
      </div>

      {/* ADDRESS */}
      <div>
        <h3 className="font-semibold text-lg">Address</h3>
        <p>{player.address_line1}</p>
        <p>{player.address_line2}</p>
        <p>{player.city}, {player.state} - {player.pincode}</p>
      </div>

      {/* STUDENT INFO */}
      <div>
        <h3 className="font-semibold text-lg">Student Info</h3>
        <p><strong>Type:</strong> {player.student_type || "N/A"}</p>
        {player.school_name && <p><strong>School:</strong> {player.school_name}</p>}
        {player.college_name && <p><strong>College:</strong> {player.college_name}</p>}
        {player.academy && <p><strong>Academy:</strong> {player.academy}</p>}
      </div>

      {/* DOCUMENTS */}
      <div>
        <h3 className="font-semibold text-lg">Documents</h3>

        {player.birth_certificate_url && (
          <p>
            <a href={player.birth_certificate_url} target="_blank" className="text-blue-600 underline">
              View Birth Certificate
            </a>
          </p>
        )}

        {player.aadhar_card_url && (
          <p>
            <a href={player.aadhar_card_url} target="_blank" className="text-blue-600 underline">
              View Aadhar Card
            </a>
          </p>
        )}

        {player.belt_certificate_url && (
          <p>
            <a href={player.belt_certificate_url} target="_blank" className="text-blue-600 underline">
              View Belt Certificate
            </a>
          </p>
        )}

        {player.school_bonafide_url && (
          <p>
            <a href={player.school_bonafide_url} target="_blank" className="text-blue-600 underline">
              View School Bonafide
            </a>
          </p>
        )}

        {player.college_proof_url && (
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

      {/* APPROVAL STATUS */}
      <div>
        {data.approved ? (
          <span className="text-green-600 font-semibold">Approved</span>
        ) : (
          <span className="text-yellow-600 font-semibold">Not Approved</span>
        )}
      </div>

    </div>
  )
}