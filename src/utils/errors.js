export const ERROR_CODES = {
  // Map-related errors (MAP_*)
  MAP_MISSING_TOKEN: 'MAP_MISSING_TOKEN',
  MAP_CONTAINER_NOT_FOUND: 'MAP_CONTAINER_NOT_FOUND',
  MAP_LOAD_TIMEOUT: 'MAP_LOAD_TIMEOUT',
  MAP_INIT_FAILED: 'MAP_INIT_FAILED',
  MAP_OVERLAY_CREATION_FAILED: 'MAP_OVERLAY_CREATION_FAILED',
  MAP_OVERLAY_NOT_INITIALIZED: 'MAP_OVERLAY_NOT_INITIALIZED',
  MAP_RUNTIME_ERROR: 'MAP_RUNTIME_ERROR',
  
  // Data-related errors (DATA_*)
  DATA_LOAD_FAILED: 'DATA_LOAD_FAILED',
  DATA_FETCH_ERROR: 'DATA_FETCH_ERROR',
  DATA_PARSE_ERROR: 'DATA_PARSE_ERROR',
  
  // Application errors (APP_*)
  APP_INIT_FAILED: 'APP_INIT_FAILED',
  APP_UNKNOWN_ERROR: 'APP_UNKNOWN_ERROR'
}

export const ERROR_MESSAGES = {
  // Map errors
  [ERROR_CODES.MAP_MISSING_TOKEN]: {
    technical: 'Missing VITE_MAPBOX_TOKEN in environment variables',
    user: 'Map cannot be loaded: Missing API token. Please check your configuration.',
    details: { requiresToken: true }
  },
  [ERROR_CODES.MAP_CONTAINER_NOT_FOUND]: {
    technical: 'Map container element not found',
    user: 'Map container is not ready. Please try again.'
  },
  [ERROR_CODES.MAP_LOAD_TIMEOUT]: {
    technical: 'Map load timeout',
    user: 'Map is taking too long to load. Please refresh the page.'
  },
  [ERROR_CODES.MAP_INIT_FAILED]: {
    technical: 'Failed to initialize map',
    user: 'Failed to initialize map. Please refresh the page.'
  },
  [ERROR_CODES.MAP_OVERLAY_CREATION_FAILED]: {
    technical: 'Failed to create deck.gl overlay',
    user: 'Failed to create map overlay'
  },
  [ERROR_CODES.MAP_OVERLAY_NOT_INITIALIZED]: {
    technical: 'Map must be initialized before creating overlay',
    user: 'Map is not ready yet. Please wait.'
  },
  [ERROR_CODES.MAP_RUNTIME_ERROR]: {
    technical: 'Map runtime error',
    user: 'Map error occurred'
  },
  
  // Data errors
  [ERROR_CODES.DATA_LOAD_FAILED]: {
    technical: 'Failed to load base points',
    user: 'Failed to load data. Please refresh the page.'
  },
  [ERROR_CODES.DATA_FETCH_ERROR]: {
    technical: 'Network request failed',
    user: 'Could not fetch data. Please check your connection.'
  },
  [ERROR_CODES.DATA_PARSE_ERROR]: {
    technical: 'Failed to parse data',
    user: 'Data format is invalid. Please contact support.'
  },
  
  // Application errors
  [ERROR_CODES.APP_INIT_FAILED]: {
    technical: 'Application initialization failed',
    user: 'Failed to initialize application. Please try again.'
  },
  [ERROR_CODES.APP_UNKNOWN_ERROR]: {
    technical: 'An unexpected error occurred',
    user: 'An error occurred'
  }
}

export function createError(code, originalError = null, additionalDetails = {}) {
  const errorDef = ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.APP_UNKNOWN_ERROR]
  
  const error = new Error(errorDef.technical)
  error.code = code
  error.userMessage = errorDef.user
  error.details = { ...errorDef.details, ...additionalDetails }
  error.originalError = originalError
  
  return error
}


export function getErrorConfig(code, additionalDetails = {}) {
  const errorDef = ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.APP_UNKNOWN_ERROR]
  
  return {
    userMessage: errorDef.user,
    details: { code, ...errorDef.details, ...additionalDetails }
  }
}
