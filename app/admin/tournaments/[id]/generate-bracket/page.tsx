"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { generateBracket } from "@/lib/generateBracket"

export default function GenerateBracketPage() {

  const params = useParams()
  const tournamentId = params.id as string

  const [loading, setLoading] = useState(false)

  const handleGenerateBracket = async () => {

    const confirmGenerate = confirm("Generate bracket for this tournament?")

    if (!confirmGenerate) return

    setLoading(true)

    try {

      await generateBracket(tournamentId)

      alert("Bracket generated successfully!")

    } catch (error) {

      console.error(error)
      alert("Failed to generate bracket")

    }

    setLoading(false)

  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Generate Bracket
      </h1>

      <button
        onClick={handleGenerateBracket}
        disabled={loading}
        className="border px-4 py-2 rounded hover:bg-gray-100"
      >

        {loading ? "Generating..." : "Generate Bracket"}

      </button>

    </div>
  )
}