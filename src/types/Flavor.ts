export interface Flavor {
  id: string
  name: string
  description: string
  referralCode: string
  image: string | null
  stockPortions: number
  available: boolean
  vegan: boolean
  lactoseFree: boolean
  glutenFree: boolean
  sugarFree: boolean
  category: string
}
