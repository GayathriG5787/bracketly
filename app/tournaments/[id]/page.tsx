"use client"

import { useParams } from "next/navigation"

export default function TournamentDetails() {
  const { id } = useParams()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Tournament Details</h1>
      <p>ID: {id}</p>
    </div>
  )
}