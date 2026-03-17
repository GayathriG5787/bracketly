"use client"

import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">

      {/* Title */}
      <h1 className="text-4xl font-bold mb-4">
        🏆 Bracketly
      </h1>

      {/* Subtitle */}
      <p className="text-gray-600 text-lg mb-8 max-w-md">
        Smart Tournament Management System for seamless player registration,
        bracket generation, and match tracking.
      </p>

      {/* CTA Button */}
      <Link
        href="/tournaments"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
      >
        View Tournaments
      </Link>

    </div>
  )
}