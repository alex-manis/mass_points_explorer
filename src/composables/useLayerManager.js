import { ref, watch } from 'vue'
import { createCategoryLayers, updateLayerFilters } from '../services/mapLayers.js'

export function useLayerManager() {
  // Stable reference - layers never recreated, only cloned for updates
  let layers = []
  let rafId = null

  
  const createLayers = (points, categories, metadata, onHover = null) => {
    layers = createCategoryLayers(points, categories, metadata, onHover)
    return layers
  }

  
  const applyFilterUpdates = (filters, updateCallback) => {
    if (!filters || !layers.length) return
    
    
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
    
    rafId = requestAnimationFrame(() => {
      rafId = null
      const updatedLayers = updateLayerFilters(layers, filters)
      updateCallback(updatedLayers)
      layers = updatedLayers
    })
  }

  const cleanup = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const getLayers = () => layers

  return {
    createLayers,
    applyFilterUpdates,
    cleanup,
    getLayers
  }
}
