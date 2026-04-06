"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"

export default function PlayerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
      } else {
        setUser(user)
      }
    }

    getUser()
  }, [])

  return <div>Player Dashboard</div>
}