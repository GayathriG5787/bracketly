"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard(){

  const router = useRouter()

  useEffect(()=>{

    const loggedIn = localStorage.getItem("adminLoggedIn")

    if(!loggedIn){
      router.push("/admin/login")
    }

  },[])

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <p>Welcome Admin</p>

      <button
        onClick={()=>{
          localStorage.removeItem("adminLoggedIn")
          window.location.href="/admin/login"
        }}
      >
        Logout
      </button>

    </div>

  )
}