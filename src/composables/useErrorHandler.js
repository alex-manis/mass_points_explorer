import { ref } from 'vue'

export function useErrorHandler() {
  const error = ref(null)
  const errorMessage = ref('')
  const errorDetails = ref(null)

  const handleError = (err, options = {}) => {
    const {
      userMessage = 'An error occurred',
      log = true,
      details = null
    } = options

    error.value = err instanceof Error ? err : new Error(String(err))
    errorMessage.value = userMessage
    errorDetails.value = details

    if (log) {
      console.error('[Error Handler]', userMessage, err, details)
    }
  }

   const clearError = () => {
    error.value = null
    errorMessage.value = ''
    errorDetails.value = null
  }

  const retry = async (fn) => {
    clearError()
    return await fn()
  }

  return {
    error,
    errorMessage,
    errorDetails,
    handleError,
    clearError,
    retry
  }
}
