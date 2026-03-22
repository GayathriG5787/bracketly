import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const tournamentId = searchParams.get("tournamentId")

  if (!tournamentId) {
    return NextResponse.json({ error: "Missing tournamentId" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("registrations")
    .select(`
      players (
        id,
        name,
        age,
        weight,
        gender,
        age_category,
        weight_category,
        category_key
      )
    `)
    .eq("tournament_id", tournamentId)
    .eq("approved", true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const players = data.map((r: any) => r.players)

  const grouped: any = {}

  players.forEach((p: any) => {

    if (!p.category_key) return

    if (!grouped[p.category_key]) {
      grouped[p.category_key] = {
        category: {
          age: p.age_category,
          gender: p.gender,
          weight: p.weight_category
        },
        players: []
      }
    }

    grouped[p.category_key].players.push(p)
  })

const result = Object.entries(grouped).map(([key, value]: any) => ({
  category_key: key,
  ...value
}))

  return NextResponse.json(result)
}