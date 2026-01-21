import { ref } from 'vue'
import { loadBasePoints, expandPoints } from '../services/points.js'
import { computePointsMetadata, createDefaultFilters } from '../state/filters.js'
import { POINT_CONFIG } from '../utils/constants.js'

export function useDataLoader() {
  const pointsMetadata = ref(null)
  const filters = ref(null)
  const isDataLoaded = ref(false)
  const isDataLoading = ref(false)

  // Stable reference - never replaced after initial assignment (performance optimization)
  let points = []

  const loadData = async () => {
    try {
      isDataLoading.value = true
      const basePoints = await loadBasePoints()
      
      // CRITICAL: points assigned once for stable reference (no array recreation)
      points = expandPoints(basePoints, POINT_CONFIG.defaultTargetCount)
      
      if (import.meta.env.DEV) {
        console.log(`[useDataLoader] Loaded ${basePoints.length} base points, expanded to ${points.length} points`)
      }

      pointsMetadata.value = computePointsMetadata(points)
      filters.value = createDefaultFilters(pointsMetadata.value)
      
      isDataLoaded.value = true
      isDataLoading.value = false
      
      return {
        points,
        metadata: pointsMetadata.value,
        filters: filters.value
      }
    } catch (error) {
      isDataLoading.value = false
      throw error
    }
  }

  const getPoints = () => points

  return {
    pointsMetadata,
    filters,
    isDataLoaded,
    isDataLoading,
    loadData,
    getPoints
  }
}
