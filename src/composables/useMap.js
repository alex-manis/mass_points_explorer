
import { ref, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { DEFAULT_MAP_CONFIG } from '../utils/constants.js'
import { useErrorHandler } from './useErrorHandler.js'

export function useMap() {
  const mapContainer = ref(null)
  const isMapLoaded = ref(false)
  const isMapLoading = ref(false)
  
  let map = null
  let overlay = null

  const { handleError } = useErrorHandler()
     const initMap = async (config = {}) => {
    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      const error = new Error('Missing VITE_MAPBOX_TOKEN in environment variables')
      handleError(error, {
        userMessage: 'Map cannot be loaded: Missing API token. Please check your configuration.',
        details: { requiresToken: true }
      })
      throw error
    }

    if (!mapContainer.value) {
      const error = new Error('Map container element not found')
      handleError(error, {
        userMessage: 'Map container is not ready. Please try again.'
      })
      throw error
    }

    isMapLoading.value = true

    try {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

      const mapConfig = { ...DEFAULT_MAP_CONFIG, ...config }

      map = new mapboxgl.Map({
        container: mapContainer.value,
        style: mapConfig.style,
        center: mapConfig.center,
        zoom: mapConfig.zoom,
        pitch: mapConfig.pitch,
        bearing: mapConfig.bearing
      })

      // Add error handlers
      map.on('error', (e) => {
        handleError(e.error, {
          userMessage: 'Map error occurred',
          details: { event: e }
        })
      })

      map.on('styleimagemissing', (e) => {
        if (import.meta.env.DEV) {
          console.warn('[useMap] Style image missing:', e.id)
        }
      })

      // Wait for map to load
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Map load timeout'))
        }, 30000) // 30 second timeout

        map.once('style.load', () => {
          clearTimeout(timeout)
          isMapLoaded.value = true
          isMapLoading.value = false
          resolve()
        })

        map.once('error', (e) => {
          clearTimeout(timeout)
          isMapLoading.value = false
          reject(e.error)
        })
      })

      return map
    } catch (error) {
      isMapLoading.value = false
      handleError(error, {
        userMessage: 'Failed to initialize map. Please refresh the page.'
      })
      throw error
    }
  }

   const createOverlay = (layers = []) => {
    if (!map) {
      throw new Error('Map must be initialized before creating overlay')
    }

    try {
      overlay = new MapboxOverlay({ layers })
      map.addControl(overlay)
      return overlay
    } catch (error) {
      handleError(error, {
        userMessage: 'Failed to create map overlay'
      })
      throw error
    }
  }

  
  const updateLayers = (layers) => {
    if (overlay) {
      overlay.setProps({ layers })
    }
  }

 
  const cleanup = () => {
    if (overlay && map) {
      try {
        map.removeControl(overlay)
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[useMap] Error removing overlay:', e)
        }
      }
      overlay = null
    }

    if (map) {
      try {
        map.remove()
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[useMap] Error removing map:', e)
        }
      }
      map = null
    }

    isMapLoaded.value = false
  }

  // Auto-cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    mapContainer,
    isMapLoaded,
    isMapLoading,
    initMap,
    createOverlay,
    updateLayers,
    cleanup,
    getMap: () => map,
    getOverlay: () => overlay
  }
}
