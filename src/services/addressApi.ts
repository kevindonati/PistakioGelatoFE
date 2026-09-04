import api from "./api"

import type { Address } from "../types/Address"

export interface AddressData {
  addressLine1: string
  addressLine2?: string
  postalCode: string
  city: string
  country: string
}

export const getAddresses = async (): Promise<Address[]> => {
  const response = await api.get<{
    content: Address[]
  }>("/addresses", {
    params: {
      page: 0,
      size: 50,
      orderBy: "city",
    },
  })

  return response.data.content
}

export const getAddressById = async (id: string): Promise<Address> => {
  const response = await api.get<Address>(`/addresses/${id}`)

  return response.data
}

export const createAddress = async (data: AddressData): Promise<string> => {
  const response = await api.post<{
    id: string
  }>("/addresses", data)

  return response.data.id
}

export const updateAddress = async (
  id: string,
  data: AddressData,
): Promise<Address> => {
  const response = await api.put<Address>(`/addresses/${id}`, data)

  return response.data
}

export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/addresses/${id}`)
}
