import { describe, it, expect } from 'vitest'
import { ERROR_CODES, ERROR_MESSAGES, createError, getErrorConfig } from '../src/utils/errors.js'

describe('Error System', () => {
  describe('ERROR_CODES', () => {
    it('should have all required error codes', () => {
      expect(ERROR_CODES.MAP_MISSING_TOKEN).toBe('MAP_MISSING_TOKEN')
      expect(ERROR_CODES.MAP_CONTAINER_NOT_FOUND).toBe('MAP_CONTAINER_NOT_FOUND')
      expect(ERROR_CODES.DATA_LOAD_FAILED).toBe('DATA_LOAD_FAILED')
      expect(ERROR_CODES.APP_INIT_FAILED).toBe('APP_INIT_FAILED')
    })
  })

  describe('ERROR_MESSAGES', () => {
    it('should have messages for all error codes', () => {
      Object.values(ERROR_CODES).forEach(code => {
        expect(ERROR_MESSAGES[code]).toBeDefined()
        expect(ERROR_MESSAGES[code].technical).toBeTruthy()
        expect(ERROR_MESSAGES[code].user).toBeTruthy()
      })
    })

    it('should have proper structure for each error message', () => {
      const errorMsg = ERROR_MESSAGES[ERROR_CODES.MAP_MISSING_TOKEN]
      expect(errorMsg).toHaveProperty('technical')
      expect(errorMsg).toHaveProperty('user')
    })
  })

  describe('createError', () => {
    it('should create structured error with code', () => {
      const error = createError(ERROR_CODES.MAP_MISSING_TOKEN)
      
      expect(error).toBeInstanceOf(Error)
      expect(error.code).toBe(ERROR_CODES.MAP_MISSING_TOKEN)
      expect(error.message).toBe(ERROR_MESSAGES[ERROR_CODES.MAP_MISSING_TOKEN].technical)
      expect(error.userMessage).toBe(ERROR_MESSAGES[ERROR_CODES.MAP_MISSING_TOKEN].user)
    })

    it('should include original error if provided', () => {
      const originalError = new Error('Original error')
      const error = createError(ERROR_CODES.DATA_LOAD_FAILED, originalError)
      
      expect(error.originalError).toBe(originalError)
    })

    it('should merge additional details', () => {
      const error = createError(ERROR_CODES.DATA_FETCH_ERROR, null, { 
        status: 404, 
        url: '/api/data' 
      })
      
      expect(error.details).toHaveProperty('status', 404)
      expect(error.details).toHaveProperty('url', '/api/data')
    })

    it('should fallback to unknown error for invalid code', () => {
      const error = createError('INVALID_CODE')
      
      expect(error.code).toBe('INVALID_CODE')
      expect(error.userMessage).toBe(ERROR_MESSAGES[ERROR_CODES.APP_UNKNOWN_ERROR].user)
    })
  })

  describe('getErrorConfig', () => {
    it('should return config for handleError', () => {
      const config = getErrorConfig(ERROR_CODES.MAP_INIT_FAILED)
      
      expect(config).toHaveProperty('userMessage')
      expect(config).toHaveProperty('details')
      expect(config.details).toHaveProperty('code', ERROR_CODES.MAP_INIT_FAILED)
    })

    it('should merge additional details into config', () => {
      const config = getErrorConfig(ERROR_CODES.MAP_RUNTIME_ERROR, { 
        event: 'map-error',
        timestamp: Date.now() 
      })
      
      expect(config.details).toHaveProperty('code')
      expect(config.details).toHaveProperty('event', 'map-error')
      expect(config.details).toHaveProperty('timestamp')
    })

    it('should fallback for unknown code', () => {
      const config = getErrorConfig('UNKNOWN_CODE')
      
      expect(config.userMessage).toBe(ERROR_MESSAGES[ERROR_CODES.APP_UNKNOWN_ERROR].user)
      expect(config.details.code).toBe('UNKNOWN_CODE')
    })
  })

  describe('Error categorization', () => {
    it('should categorize map errors with MAP_ prefix', () => {
      const mapErrors = Object.keys(ERROR_CODES).filter(key => key.startsWith('MAP_'))
      expect(mapErrors.length).toBeGreaterThan(0)
      expect(mapErrors).toContain('MAP_MISSING_TOKEN')
      expect(mapErrors).toContain('MAP_INIT_FAILED')
    })

    it('should categorize data errors with DATA_ prefix', () => {
      const dataErrors = Object.keys(ERROR_CODES).filter(key => key.startsWith('DATA_'))
      expect(dataErrors.length).toBeGreaterThan(0)
      expect(dataErrors).toContain('DATA_LOAD_FAILED')
      expect(dataErrors).toContain('DATA_FETCH_ERROR')
    })

    it('should categorize app errors with APP_ prefix', () => {
      const appErrors = Object.keys(ERROR_CODES).filter(key => key.startsWith('APP_'))
      expect(appErrors.length).toBeGreaterThan(0)
      expect(appErrors).toContain('APP_INIT_FAILED')
      expect(appErrors).toContain('APP_UNKNOWN_ERROR')
    })
  })
})
