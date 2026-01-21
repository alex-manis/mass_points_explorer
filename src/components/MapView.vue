<script setup>

import { watch, onMounted, onUnmounted } from 'vue'
import { useMap } from '../composables/useMap.js'
import { useTooltip } from '../composables/useTooltip.js'
import { useErrorHandler } from '../composables/useErrorHandler.js'
import { useDataLoader } from '../composables/useDataLoader.js'
import { useLayerManager } from '../composables/useLayerManager.js'
import { ERROR_CODES, getErrorConfig } from '../utils/errors.js'
import FilterPanel from './filters/FilterPanel.vue'
import MapTooltip from './map/MapTooltip.vue'
import ErrorNotification from './ui/ErrorNotification.vue'
import LoadingSpinner from './ui/LoadingSpinner.vue'

const { mapContainer, isMapLoaded, isMapLoading, initMap, createOverlay, updateLayers, getOverlay } = useMap()
const { tooltipData, tooltipPosition, updateTooltip } = useTooltip()
const { error, errorMessage, errorDetails, handleError, clearError, retry } = useErrorHandler()
const { pointsMetadata, filters, isDataLoaded, isDataLoading, loadData, getPoints } = useDataLoader()
const { createLayers, applyFilterUpdates, cleanup: cleanupLayers, getLayers } = useLayerManager()

const initialize = async () => {
  try {
    await initMap()
    const { points, metadata } = await loadData()
    const initialLayers = createLayers(points, metadata.categories, metadata, updateTooltip)
    createOverlay(initialLayers)
    
    // Expose instrumentation for testing
    if (import.meta.env.DEV) {
      window.__APP__ = {
        points: getPoints(),
        layers: getLayers(),
        overlay: getOverlay()
      }
    }
  } catch (err) {
    handleError(err, getErrorConfig(ERROR_CODES.APP_INIT_FAILED, { originalError: err }))
    if (import.meta.env.DEV) {
      console.error('[MapView] Initialization failed:', err)
    }
  }
}

const handleRetry = async () => {
  await retry(initialize)
}

// Watch value percentage filter changes
watch(
  () => filters.value && filters.value.valuePercentage,
  () => applyFilterUpdates(filters.value, updateLayers)
)

// Watch category selection changes
watch(
  () => filters.value && Array.from(filters.value.selectedCategories).sort().join(','),
  () => applyFilterUpdates(filters.value, updateLayers)
)

const handlePercentageUpdate = (percentage) => {
  if (!filters.value) return
  filters.value.valuePercentage = percentage
}

const handleCategoriesUpdate = (newSelection) => {
  if (!filters.value) return
  filters.value.selectedCategories = newSelection
}

onMounted(() => {
  initialize()
})

onUnmounted(() => {
  cleanupLayers()
})
</script>

<template>
  <div ref="mapContainer" class="map-view">
    <LoadingSpinner
      v-if="isMapLoading || isDataLoading"
      :message="isMapLoading ? 'Loading map...' : 'Loading data...'"
    />
    
    <ErrorNotification
      v-if="error"
      :message="errorMessage"
      :details="errorDetails ? String(errorDetails) : ''"
      :show-retry="true"
      @close="clearError"
      @retry="handleRetry"
    />
    
    <FilterPanel
      v-if="filters && pointsMetadata && isDataLoaded && !error"
      :filters="filters"
      :categories="pointsMetadata.categories"
      @update:percentage="handlePercentageUpdate"
      @update:categories="handleCategoriesUpdate"
    />
    
    <MapTooltip
      :data="tooltipData"
      :position="tooltipPosition"
    />
  </div>
</template>

<style scoped>
.map-view {
  width: 100%;
  height: 100%;
}
</style>
