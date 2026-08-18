import api from "./api"
import type { Category } from "../types/Category"
import type { Flavor } from "../types/Flavor"
import type { Page } from "../types/Page"

export const getCategories = async (
  page = 0,
  size = 10,
): Promise<Page<Category>> => {
  const response = await api.get<Page<Category>>("/categories", {
    params: {
      page,
      size,
    },
  })

  return response.data
}

export const getFlavors = async (
  page = 0,
  size = 50,
): Promise<Page<Flavor>> => {
  const response = await api.get<Page<Flavor>>("/flavors", {
    params: {
      page,
      size,
    },
  })

  return response.data
}

export const getAvailableFlavors = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language?: string,
): Promise<Flavor[]> => {
  const response = await api.get<Flavor[]>("/flavors/available")
  return response.data
}

export const getVeganFlavors = async (): Promise<Flavor[]> => {
  const response = await api.get<Flavor[]>("/flavors/vegan")
  return response.data
}

export const getLactoseFreeFlavors = async (): Promise<Flavor[]> => {
  const response = await api.get<Flavor[]>("/flavors/lactose-free")
  return response.data
}

export const getGlutenFreeFlavors = async (): Promise<Flavor[]> => {
  const response = await api.get<Flavor[]>("/flavors/gluten-free")
  return response.data
}

export const getSugarFreeFlavors = async (): Promise<Flavor[]> => {
  const response = await api.get<Flavor[]>("/flavors/sugar-free")
  return response.data
}

export const getFlavorById = async (id: string): Promise<Flavor> => {
  const response = await api.get<Flavor>(`/flavors/${id}`)
  return response.data
}
