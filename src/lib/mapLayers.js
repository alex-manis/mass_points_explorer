
import { ScatterplotLayer } from '@deck.gl/layers'
import { DataFilterExtension } from '@deck.gl/extensions'
import { getCategoryColor, LAYER_CONFIG } from '../utils/constants.js'


const dataFilterExtension = new DataFilterExtension({
  filterSize: 1 // Single dimension: value
})

export function createCategoryLayers(data, categories, metadata, onHover = null) {
  
  return categories.map(category => {
    return new ScatterplotLayer({
      id: `points-layer-${category}`,
      data, // Stable shared data reference
      pickable: true,
      opacity: LAYER_CONFIG.opacity,
      stroked: true,
      filled: true,
      radiusScale: LAYER_CONFIG.radiusScale,
      radiusMinPixels: LAYER_CONFIG.radiusMinPixels,
      radiusMaxPixels: LAYER_CONFIG.radiusMaxPixels,
      lineWidthMinPixels: LAYER_CONFIG.lineWidthMinPixels,
      
      // Position accessor
      getPosition: d => d.position,
      
      // Radius based on value
      getRadius: d => Math.sqrt(d.value) * LAYER_CONFIG.radiusMultiplier,
      
      // Color based on category
      getFillColor: d => getCategoryColor(d.category),
      
      // Stroke color
      getLineColor: [255, 255, 255, 100],
      
      // DataFilterExtension for value filtering on GPU
      extensions: [dataFilterExtension],
      
      // getFilterValue returns value for this point
      // Filter out other categories (this point belongs to layer only if matches category)
      getFilterValue: d => {
        // If point doesn't match this layer's category, hide it with impossible value
        if (d.category !== category) {
          return -Infinity
        }
        return d.value
      },
      
      // Initial filter range (full value range) - 1D array for filterSize: 1
      filterRange: [
        metadata?.valueDomain.min ?? 0,
        metadata?.valueDomain.max ?? 100
      ],
      
      // Store category for this layer (used in updateLayerFilters)
      categoryFilter: category,
      
      // Initially visible
      visible: true,
      
      // Enable filtering
      filterEnabled: true,
      
      // Hover callback
      ...(onHover && { onHover })
    })
  })
}

export function updateLayerFilters(layers, filters) {
  const selectedCategories = filters.selectedCategories
  const percentage = filters.valuePercentage
  const categoryRanges = filters.categoryValueRanges
  
  // Use map to create updated layer instances
  // deck.gl layer.clone() is optimized for this use case
  return layers.map(layer => {
    const categoryForLayer = layer.props.categoryFilter
    const isVisible = selectedCategories.has(categoryForLayer)
    
    // Calculate filter range for this specific category based on percentage
    const categoryRange = categoryRanges[categoryForLayer]
    let filterRange
    
    if (!categoryRange) {
      // Fallback if category range not found
      filterRange = [0, 0]
    } else if (percentage === 0) {
      // At 0%, hide all points
      filterRange = [categoryRange.min, categoryRange.min - 1]
    } else {
      // Calculate proportional max value for this category
      const range = categoryRange.max - categoryRange.min
      const maxValue = categoryRange.min + (range * percentage / 100)
      filterRange = [categoryRange.min, maxValue]
    }
    
    // Clone only updates changed props (diff-based)
    // This is the recommended deck.gl pattern for filter updates
    return layer.clone({
      visible: isVisible,
      filterRange: filterRange
    })
  })
}

