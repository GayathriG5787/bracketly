import { supabase } from "@/lib/supabase"

export const syncUser = async (role = "player") => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  // 🔍 Check if user already exists
  const { data: existingUser, error } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single()

  // 🟢 If user exists → DO NOT override role
  if (existingUser) {
    return existingUser
  }

  // 🟢 If new user → insert as player (or passed role)
  const { data, error: insertError } = await supabase
    .from("users")
    .insert({
      id: user.id,
      email: user.email,
      role,
    })

  if (insertError) {
    console.error("Error inserting user:", insertError)
  }

  return data
}