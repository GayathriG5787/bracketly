// lib/categoryKey.ts

export function getCategoryKey(
  ageCategory: string,
  gender: string,
  weightCategory: string
) {
  return `${normalize(ageCategory)}-${normalize(gender)}-${normalizeWeight(weightCategory)}`
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces → hyphens
}

function normalizeWeight(weight: string) {
  let w = weight.toLowerCase().trim()

  // ensure "kg" is present
  if (!w.includes("kg")) {
    w = w + "kg"
  }

  return w.replace(/\s+/g, "-")
}