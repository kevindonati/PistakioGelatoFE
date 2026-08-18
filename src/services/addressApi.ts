import api from "./api"
import type { Address } from "../types/Address"

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
