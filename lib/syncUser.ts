import { supabase } from "@/lib/supabase"

export const syncUser = async (role = "player") => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      role,
    })
  }
}