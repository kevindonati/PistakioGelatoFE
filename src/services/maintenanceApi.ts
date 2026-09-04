import api from "./api"

export const getMaintenanceMode = async (): Promise<boolean> => {
  const response = await api.get<boolean>("/settings/maintenance")
  return response.data
}
