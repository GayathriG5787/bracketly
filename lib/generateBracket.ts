import { supabase } from "./supabase"

/*
FETCH APPROVED PLAYERS
*/
export async function getApprovedPlayers(
  tournamentId: string,
  categoryKey: string
) {

  const { data, error } = await supabase
    .from("registrations")
    .select(`
      player_id,
      players(*)
    `)
    .eq("tournament_id", tournamentId)
    .eq("approved", true)
    .eq("category_key", categoryKey) // ✅ THIS IS THE FIX

  if (error) {
    console.error("Error fetching players:", error)
    throw new Error("Failed to fetch players")
  }

  return data?.map((r: any) => r.players) || []
}

/*
SHUFFLE PLAYERS Fisher-Yates shuffle
*/
function shuffle(players: any[]) {
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[players[i], players[j]] = [players[j], players[i]]
  }
  return players
}

/*
NEXT POWER OF TWO
*/
function nextPowerOfTwo(n: number) {
  let power = 1
  while (power < n) power *= 2
  return power
}

function distributeByes(players: any[], bracketSize: number) {
  const totalByes = bracketSize - players.length

  // Step 1: Create slots
  const slots: any[] = new Array(bracketSize).fill(null)

  // Step 2: Fill players in even positions first
  let pIndex = 0
  for (let i = 0; i < bracketSize; i += 2) {
    if (pIndex < players.length) {
      slots[i] = players[pIndex++]
    }
  }

  // Step 3: Fill remaining players in odd positions
  for (let i = 1; i < bracketSize; i += 2) {
    if (pIndex < players.length) {
      slots[i] = players[pIndex++]
    }
  }

  return slots
}

/*
CREATE FIRST ROUND
*/
function createRoundMatches(
  players: any[],
  round: number,
  categoryKey: string
) {

  const matches: any[] = []

  for (let i = 0; i < players.length; i += 2) {
    matches.push({
      round,
      position: i / 2,
      category_key: categoryKey,
      player1_id: players[i]?.id || null,
      player2_id: players[i + 1]?.id || null
    })
  }

  return matches
}
/*
GENERATE ALL ROUNDS
*/
function generateAllRounds(bracketSize: number, categoryKey: string) {

  const rounds: any[] = []

  let matches = bracketSize / 2
  let round = 1

  while (matches >= 1) {

    const roundMatches: any[] = []

    for (let i = 0; i < matches; i++) {
      roundMatches.push({
        round,
        position: i,
        category_key: categoryKey // ✅ FIX
      })
    }

    rounds.push(roundMatches)

    matches = matches / 2
    round++
  }

  return rounds
}

/*
LINK MATCHES
*/
function linkMatches(rounds: any[]) {

  for (let r = 0; r < rounds.length - 1; r++) {

    const currentRound = rounds[r]

    currentRound.forEach((match: any) => {

      const nextPosition = Math.floor(match.position / 2)

      match.next_match_position = nextPosition
      match.next_match_slot = match.position % 2 === 0 ? 1 : 2

    })
  }
}

/*
INSERT MATCHES
*/
export async function insertMatches(tournamentId: string, rounds: any[]) {

  const matchMap: any = {}

  for (const round of rounds) {

    for (const match of round) {

      if (!match.category_key) {
        throw new Error("Missing category_key in match")
      }

      const { data, error } = await supabase
        .from("matches")
        .insert({
          tournament_id: tournamentId,
          category_key: match.category_key,
          round: match.round,
          position: match.position,
          player1_id: match.player1_id || null,
          player2_id: match.player2_id || null
        })
        .select()
        .single()

      if (error) {
        console.error("Error inserting match:", error)
        throw new Error("Failed to insert matches")
      }

      matchMap[`${match.round}-${match.position}`] = data.id
    }
  }

  return matchMap
}

/*
UPDATE NEXT MATCH LINKS
*/
export async function updateNextMatches(rounds: any[], matchMap: any) {

  for (const round of rounds) {

    for (const match of round) {

      if (match.next_match_position === undefined) continue

      const nextId = matchMap[`${match.round + 1}-${match.next_match_position}`]
      const currentId = matchMap[`${match.round}-${match.position}`]

      await supabase
        .from("matches")
        .update({
          next_match_id: nextId,
          next_match_slot: match.next_match_slot
        })
        .eq("id", currentId)
    }
  }
}

/*
🔥 AUTO ADVANCE BYE MATCHES (NEW)
*/
async function autoAdvanceByes(
  tournamentId: string,
  categoryKey: string
) {

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("category_key", categoryKey) // ✅ Filter by category

  if (!matches) return

  for (const match of matches) {

    if (
      match.player1_id &&
      !match.player2_id &&
      !match.winner_id
    ) {

      // 1. Mark winner (auto win due to BYE)
      await supabase
        .from("matches")
        .update({
          winner_id: match.player1_id,
          walkover: true
        })
        .eq("id", match.id)

      // 2. Move winner to next match (same category implicitly)
      if (match.next_match_id) {

        const updateField =
          match.next_match_slot === 1 ? "player1_id" : "player2_id"

        await supabase
          .from("matches")
          .update({
            [updateField]: match.player1_id
          })
          .eq("id", match.next_match_id)
      }
    }
  }
}

/*
LOCK BRACKET
*/
async function lockBracket(
  tournamentId: string,
  categoryKey: string
) {
  await supabase
    .from("matches")
    .update({ bracket_locked: true })
    .eq("tournament_id", tournamentId)
    .eq("category_key", categoryKey)
}

/*
MAIN FUNCTION
*/
export async function generateBracket(
  tournamentId: string,
  categoryKey: string
) {
  
  // Checking whether bracket already exists

  const { data: existing } = await supabase
    .from("matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("category_key", categoryKey)

  if (existing && existing.length > 0) {
    return {
      success: false,
      message: "Bracket already exists"
    }
  }

  let players = await getApprovedPlayers(tournamentId, categoryKey)

  if (!players || players.length === 0) {
    return {
      success: false,
      message: "No approved players"
    }
  }

  players = shuffle(players)

  const bracketSize = nextPowerOfTwo(players.length)

  players = distributeByes(players, bracketSize)

  const firstRound = createRoundMatches(players, 1, categoryKey)

  const rounds = generateAllRounds(bracketSize, categoryKey)

  rounds[0] = firstRound

  linkMatches(rounds)

  console.log("TOTAL ROUNDS:", rounds.length)

  let totalMatches = 0
  for (const r of rounds) totalMatches += r.length

  console.log("TOTAL MATCHES:", totalMatches)

  const matchMap = await insertMatches(tournamentId, rounds)

  await updateNextMatches(rounds, matchMap)

  await autoAdvanceByes(tournamentId, categoryKey)

  await lockBracket(tournamentId, categoryKey)

  return {
    success: true,
    message: "Bracket generated successfully"
  }
}