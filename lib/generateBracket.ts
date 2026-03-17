import { supabase } from "./supabase"

/*
FETCH APPROVED PLAYERS
*/
export async function getApprovedPlayers(tournamentId: string) {

  const { data, error } = await supabase
    .from("registrations")
    .select(`
      player_id,
      players(*)
    `)
    .eq("tournament_id", tournamentId)
    .eq("approved", true)

  if (error) {
    console.error("Error fetching players:", error)
    return []
  }

  return data?.map((r: any) => r.players) || []
}

/*
SHUFFLE PLAYERS
(Fisher-Yates Shuffle)
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
Example:
10 players → 16 bracket
*/
function nextPowerOfTwo(n: number) {

  let power = 1

  while (power < n) {
    power *= 2
  }

  return power
}

/*
ADD BYE PLAYERS
*/
function addByes(players: any[], bracketSize: number) {

  const byes = bracketSize - players.length

  for (let i = 0; i < byes; i++) {
    players.push(null)
  }

  return players
}

/*
CREATE FIRST ROUND MATCHES
*/
function createRoundMatches(players: any[], round: number) {

  const matches: any[] = []

  for (let i = 0; i < players.length; i += 2) {

    matches.push({

      round,
      position: i / 2,

      player1_id: players[i]?.id || null,
      player2_id: players[i + 1]?.id || null

    })

  }

  return matches
}

/*
GENERATE ALL ROUNDS
Example for 16 players:

Round1 → 8 matches
Round2 → 4 matches
Round3 → 2 matches
Round4 → 1 match
*/
function generateAllRounds(bracketSize: number) {

  const rounds: any[] = []

  let matches = bracketSize / 2
  let round = 1

  while (matches >= 1) {

    const roundMatches: any[] = []

    for (let i = 0; i < matches; i++) {

      roundMatches.push({
        round,
        position: i
      })

    }

    rounds.push(roundMatches)

    matches = matches / 2
    round++

  }

  return rounds
}

/*
LINK MATCHES TO NEXT ROUND
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
INSERT MATCHES INTO DATABASE
*/
export async function insertMatches(tournamentId: string, rounds: any[]) {

  const matchMap: any = {}

  for (const round of rounds) {

    for (const match of round) {

      const { data, error } = await supabase
        .from("matches")
        .insert({

          tournament_id: tournamentId,
          round: match.round,
          position: match.position,
          player1_id: match.player1_id || null,
          player2_id: match.player2_id || null

        })
        .select()
        .single()

      if (error) {
        console.error("Error inserting match:", error)
        continue
      }

      matchMap[`${match.round}-${match.position}`] = data.id

    }

  }

  return matchMap
}

/*
UPDATE NEXT MATCH CONNECTIONS
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
LOCK BRACKET
*/
async function lockBracket(tournamentId: string) {

  await supabase
    .from("tournaments")
    .update({ bracket_locked: true })
    .eq("id", tournamentId)

}

/*
MAIN BRACKET GENERATION FUNCTION
*/
export async function generateBracket(tournamentId: string) {

  let players = await getApprovedPlayers(tournamentId)

  if (players.length === 0) {
    console.error("No approved players found")
    return
  }

  players = shuffle(players)

  const bracketSize = nextPowerOfTwo(players.length)

  players = addByes(players, bracketSize)

  const firstRound = createRoundMatches(players, 1)

  const rounds = generateAllRounds(bracketSize)

  rounds[0] = firstRound

  linkMatches(rounds)

  const matchMap = await insertMatches(tournamentId, rounds)

  await updateNextMatches(rounds, matchMap)

  await lockBracket(tournamentId)

}