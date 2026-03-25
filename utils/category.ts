// utils/category.ts
import { getCategoryKey } from "@/lib/categoryKey"

// ✅ AGE CATEGORY
export function getAgeCategory(age: number): string {
  if (age <= 7) return "Infant"
  if (age >= 8 && age <= 11) return "Sub-Junior"
  if (age >= 12 && age <= 14) return "Cadet"
  if (age >= 15 && age <= 17) return "Junior"
  return "Senior"
}

export function getWeightCategory(
  weight: number,
  ageCategory: string,
  gender: string
): string {

  // ✅ INFANT BOYS
  if (ageCategory === "Infant" && gender === "Male") {
    if (weight <= 17) return "Under 17kg"
    if (weight <= 19) return "Under 19kg"
    if (weight <= 21) return "Under 21kg"
    if (weight <= 23) return "Under 23kg"
    return "Over 23kg"
  }

  // ✅ INFANT GIRLS
  if (ageCategory === "Infant" && gender === "Female") {
    if (weight <= 17) return "Under 17kg"
    if (weight <= 19) return "Under 19kg"
    if (weight <= 21) return "Under 21kg"
    if (weight <= 23) return "Under 23kg"
    return "Over 23kg"
  }

  // ✅ SUB-JUNIOR BOYS
  if (ageCategory === "Sub-Junior" && gender === "Male") {
    if (weight <= 16) return "Under 16kg"
    if (weight <= 18) return "Under 18kg"
    if (weight <= 21) return "Under 21kg"
    if (weight <= 23) return "Under 23kg"
    if (weight <= 25) return "Under 25kg"
    if (weight <= 27) return "Under 27kg"
    if (weight <= 29) return "Under 29kg"
    if (weight <= 32) return "Under 32kg"
    if (weight <= 35) return "Under 35kg"
    if (weight <= 38) return "Under 38kg"
    if (weight <= 41) return "Under 41kg"
    if (weight <= 44) return "Under 44kg"
    if (weight <= 50) return "Under 50kg"
    return "Over 50kg"
  }

  // ✅ SUB-JUNIOR GIRLS
  if (ageCategory === "Sub-Junior" && gender === "Female") {
    if (weight <= 14) return "Under 14kg"
    if (weight <= 16) return "Under 16kg"
    if (weight <= 18) return "Under 18kg"
    if (weight <= 20) return "Under 20kg"
    if (weight <= 22) return "Under 22kg"
    if (weight <= 24) return "Under 24kg"
    if (weight <= 26) return "Under 26kg"
    if (weight <= 29) return "Under 29kg"
    if (weight <= 32) return "Under 32kg"
    if (weight <= 35) return "Under 35kg"
    if (weight <= 38) return "Under 38kg"
    if (weight <= 41) return "Under 41kg"
    if (weight <= 47) return "Under 47kg"
    return "Over 47kg"
  }

  // ✅ CADET MALE
  if (ageCategory === "Cadet" && gender === "Male") {
    if (weight <= 33) return "Under 33kg"
    if (weight <= 37) return "Under 37kg"
    if (weight <= 41) return "Under 41kg"
    if (weight <= 45) return "Under 45kg"
    if (weight <= 49) return "Under 49kg"
    if (weight <= 53) return "Under 53kg"
    if (weight <= 57) return "Under 57kg"
    if (weight <= 61) return "Under 61kg"
    if (weight <= 65) return "Under 65kg"
    return "Over 65kg"
  }

  // ✅ CADET FEMALE
  if (ageCategory === "Cadet" && gender === "Female") {
    if (weight <= 29) return "Under 29kg"
    if (weight <= 33) return "Under 33kg"
    if (weight <= 37) return "Under 37kg"
    if (weight <= 41) return "Under 41kg"
    if (weight <= 44) return "Under 44kg"
    if (weight <= 47) return "Under 47kg"
    if (weight <= 51) return "Under 51kg"
    if (weight <= 55) return "Under 55kg"
    if (weight <= 59) return "Under 59kg"
    return "Over 59kg"
  }

  // ✅ JUNIOR BOYS
  if (ageCategory === "Junior" && gender === "Male") {
    if (weight <= 45) return "Under 45kg"
    if (weight <= 48) return "Under 48kg"
    if (weight <= 51) return "Under 51kg"
    if (weight <= 55) return "Under 55kg"
    if (weight <= 59) return "Under 59kg"
    if (weight <= 63) return "Under 63kg"
    if (weight <= 68) return "Under 68kg"
    if (weight <= 73) return "Under 73kg"
    if (weight <= 78) return "Under 78kg"
    return "Over 78kg"
  }

  // ✅ JUNIOR GIRLS
  if (ageCategory === "Junior" && gender === "Female") {
    if (weight <= 42) return "Under 42kg"
    if (weight <= 44) return "Under 44kg"
    if (weight <= 46) return "Under 46kg"
    if (weight <= 49) return "Under 49kg"
    if (weight <= 52) return "Under 52kg"
    if (weight <= 55) return "Under 55kg"
    if (weight <= 59) return "Under 59kg"
    if (weight <= 63) return "Under 63kg"
    if (weight <= 68) return "Under 68kg"
    return "Over 68kg"
  }

  // ✅ SENIOR MALE
  if (ageCategory === "Senior" && gender === "Male") {
    if (weight <= 54) return "Under 54kg"
    if (weight <= 58) return "Under 58kg"
    if (weight <= 63) return "Under 63kg"
    if (weight <= 68) return "Under 68kg"
    if (weight <= 74) return "Under 74kg"
    if (weight <= 80) return "Under 80kg"
    if (weight <= 87) return "Under 87kg"
    return "Over 87kg"
  }

  // ✅ SENIOR FEMALE
  if (ageCategory === "Senior" && gender === "Female") {
    if (weight <= 46) return "Under 46kg"
    if (weight <= 49) return "Under 49kg"
    if (weight <= 53) return "Under 53kg"
    if (weight <= 57) return "Under 57kg"
    if (weight <= 62) return "Under 62kg"
    if (weight <= 67) return "Under 67kg"
    if (weight <= 73) return "Under 73kg"
    return "Over 73kg"
  }

  return "Unknown"
}

type Player = {
  age: number
  weight: number
  gender: string
}

export function getCategory(player: Player) {
  const age_category = getAgeCategory(player.age)

  const weight_category = getWeightCategory(
    player.weight,
    age_category,
    player.gender
  )

  const category_key = getCategoryKey(
    age_category,
    player.gender,
    weight_category
  )

  return { age_category, weight_category, category_key }
}