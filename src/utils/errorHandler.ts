import axios from "axios"

interface ErrorResponse {
  message?: string
  errors?: string[]
}

export const getErrorMessage = (
  error: unknown,
  fallback = "An unexpected error occurred. Please try again.",
): string => {
  if (!axios.isAxiosError<ErrorResponse>(error)) {
    if (error instanceof Error && error.message) {
      return error.message
    }

    return fallback
  }

  if (!error.response) {
    return "Unable to connect to the server."
  }

  const data = error.response.data

  if (data?.errors && data.errors.length > 0) {
    return data.errors
      .map((errorMessage) => {
        const separatorIndex = errorMessage.indexOf(": ")

        if (separatorIndex !== -1) {
          return `• ${errorMessage.substring(separatorIndex + 2)}`
        }

        return `• ${errorMessage}`
      })
      .join("\n")
  }

  if (data?.message) {
    return data.message
  }

  if (error.response.status === 500) {
    return "An internal server error occurred."
  }

  return fallback
}
