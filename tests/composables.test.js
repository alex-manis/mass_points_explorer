import { describe, it, expect, vi } from 'vitest'
import { useTooltip } from '../src/composables/useTooltip.js'
import { useErrorHandler } from '../src/composables/useErrorHandler.js'

describe('useTooltip composable', () => {
  it('should initialize with null data', () => {
    const { tooltipData, tooltipPosition } = useTooltip()
    
    expect(tooltipData.value).toBeNull()
    expect(tooltipPosition.value).toEqual({ x: 0, y: 0 })
  })

  it('should update tooltip with info object', () => {
    const { tooltipData, tooltipPosition, updateTooltip } = useTooltip()
    
    const info = {
      object: { id: 'p1', value: 50, category: 'A' },
      x: 100,
      y: 200
    }
    
    updateTooltip(info)
    
    expect(tooltipData.value).toEqual(info.object)
    expect(tooltipPosition.value).toEqual({ x: 100, y: 200 })
  })

  it('should hide tooltip when info has no object', () => {
    const { tooltipData, updateTooltip } = useTooltip()
    

    updateTooltip({ object: { id: 'p1' }, x: 100, y: 200 })
    expect(tooltipData.value).not.toBeNull()
    

    updateTooltip({ x: 100, y: 200 })
    expect(tooltipData.value).toBeNull()
  })

  it('should hide tooltip explicitly', () => {
    const { tooltipData, hideTooltip, updateTooltip } = useTooltip()
    
    updateTooltip({ object: { id: 'p1' }, x: 100, y: 200 })
    expect(tooltipData.value).not.toBeNull()
    
    hideTooltip()
    expect(tooltipData.value).toBeNull()
  })

  it('should show tooltip at specific position', () => {
    const { tooltipData, tooltipPosition, showTooltip } = useTooltip()
    
    const data = { id: 'p1', value: 50 }
    const position = { x: 150, y: 250 }
    
    showTooltip(data, position)
    
    expect(tooltipData.value).toEqual(data)
    expect(tooltipPosition.value).toEqual(position)
  })
})

describe('useErrorHandler composable', () => {
  it('should initialize with no error', () => {
    const { error, errorMessage, errorDetails } = useErrorHandler()
    
    expect(error.value).toBeNull()
    expect(errorMessage.value).toBe('')
    expect(errorDetails.value).toBeNull()
  })

  it('should handle error with custom message', () => {
    const { error, errorMessage, handleError } = useErrorHandler()
    
    const testError = new Error('Test error')
    handleError(testError, {
      userMessage: 'Something went wrong',
      log: false
    })
    
    expect(error.value).toBe(testError)
    expect(errorMessage.value).toBe('Something went wrong')
  })

  it('should handle string error by converting to Error', () => {
    const { error, handleError } = useErrorHandler()
    
    handleError('String error', { log: false })
    
    expect(error.value).toBeInstanceOf(Error)
    expect(error.value.message).toBe('String error')
  })

  it('should store error details', () => {
    const { errorDetails, handleError } = useErrorHandler()
    
    handleError(new Error('Test'), {
      details: { code: 404, path: '/api/data' },
      log: false
    })
    
    expect(errorDetails.value).toEqual({ code: 404, path: '/api/data' })
  })

  it('should clear error state', () => {
    const { error, errorMessage, errorDetails, handleError, clearError } = useErrorHandler()
    
    handleError(new Error('Test'), { userMessage: 'Error occurred', log: false })
    expect(error.value).not.toBeNull()
    
    clearError()
    
    expect(error.value).toBeNull()
    expect(errorMessage.value).toBe('')
    expect(errorDetails.value).toBeNull()
  })

  it('should retry function after clearing error', async () => {
    const { error, retry } = useErrorHandler()
    
    let callCount = 0
    const testFn = async () => {
      callCount++
      return 'success'
    }
    
    const result = await retry(testFn)
    
    expect(callCount).toBe(1)
    expect(result).toBe('success')
    expect(error.value).toBeNull()
  })

  it('should propagate error during retry without handling', async () => {
    const { error, retry, clearError } = useErrorHandler()
    
   
    error.value = new Error('Initial error')
    
    const testFn = async () => {
      throw new Error('Retry failed')
    }
    
 
    await expect(retry(testFn)).rejects.toThrow('Retry failed')
    
    expect(error.value).toBeNull()
  })

  it('should log error to console by default', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { handleError } = useErrorHandler()
    
    handleError(new Error('Test error'), {
      userMessage: 'Test message'
    })
    
    expect(consoleSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })

  it('should not log when log option is false', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { handleError } = useErrorHandler()
    
    handleError(new Error('Test error'), {
      userMessage: 'Test message',
      log: false
    })
    
    expect(consoleSpy).not.toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})
