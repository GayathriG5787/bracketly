"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"

export default function PlayerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [player, setPlayer] = useState<any>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadDashboard = async () => {
      // ========================
      // STEP 1: Get User
      // ========================
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
        return
      }

      setUser(user)

      // ========================
      // ✅ STEP 2: Get or Create Player (FIXED)
      // ========================
      let { data: playerData } = await supabase
        .from("players")
        .select("*")
        .eq("user_id", user.id)
        .single()

      // 🔥 If player does not exist → create one
      if (!playerData) {
        const { data: newPlayer } = await supabase
          .from("players")
          .insert({
            user_id: user.id,
            name: user.user_metadata?.full_name || "Player",
            email: user.email,
          })
          .select()
          .single()

        playerData = newPlayer
      }

      setPlayer(playerData)

      // ========================
      // 🏆 STEP 3: Fetch Registrations (UPDATED)
      // ========================
      const { data: regData } = await supabase
        .from("registrations")
        .select(`
          id,
          approved,
          category_key,
          tournament:tournaments(name)
        `)
        .eq("player_id", playerData.id)

      setRegistrations(regData || [])
    }

    loadDashboard()
  }, [router])

  // ========================
  // 🎯 UI Rendering
  // ========================
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Player Info */}
      {player && (
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Player Info</h2>
          <p>Name: {player.name}</p>
          <p>Email: {player.email}</p>
        </div>
      )}

      {/* Tournaments */}
      <div className="border p-4 rounded">
        <h2 className="font-semibold">My Tournaments</h2>

        {registrations.length === 0 && (
          <p className="text-gray-500 mt-2">
            You have not registered for any tournaments yet.
          </p>
        )}

        {registrations.map((reg) => (
          <div key={reg.id} className="border p-3 mt-2 rounded">
            <p className="font-medium">{reg.tournament?.name}</p>

            <p>Category: {reg.category_key}</p>

            <p>
              Status:{" "}
              {reg.approved ? (
                <span className="text-green-600">Approved</span>
              ) : (
                <span className="text-yellow-600">Pending</span>
              )}
            </p>

            <p className="text-gray-500">
            Bracket will be available after matches are generated
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}