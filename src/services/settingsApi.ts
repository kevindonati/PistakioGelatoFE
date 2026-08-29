import api from "./api"

export interface ShippingSettings {
  weight1: number
  cost1: number
  weight2: number
  cost2: number
  weight3: number
  cost3: number
  costOver: number
}

export const getShippingSettings = async (): Promise<ShippingSettings> => {
  const response = await api.get<ShippingSettings>("/settings/shipping")

  return response.data
}

export const updateShippingSettings = async (
  data: ShippingSettings,
): Promise<ShippingSettings> => {
  const response = await api.put<ShippingSettings>("/settings/shipping", data)

  return response.data
}
