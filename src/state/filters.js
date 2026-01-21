import { reactive } from 'vue'

export function createDefaultFilters(meta) {
  const { categories, categoryValueRanges } = meta
  
  return reactive({
    // Percentage filter (0-100)
    valuePercentage: 100,
    
    // Store category ranges for computation
    categoryValueRanges: categoryValueRanges,
    
    // Selected categories (Set for O(1) lookup)
    selectedCategories: new Set(categories)
  })
}

export function computePointsMetadata(points) {
  if (!points || points.length === 0) {
    return {
      valueDomain: { min: 0, max: 100 },
      categories: [],
      categoryValueRanges: {}
    }
  }
  
  let min = Infinity
  let max = -Infinity
  const categorySet = new Set()
  const categoryRanges = {}
  
  // Single pass through data to compute overall and per-category ranges
  for (const point of points) {
    if (point.value < min) min = point.value
    if (point.value > max) max = point.value
    categorySet.add(point.category)
    
    // Track min/max per category
    if (!categoryRanges[point.category]) {
      categoryRanges[point.category] = { min: Infinity, max: -Infinity }
    }
    if (point.value < categoryRanges[point.category].min) {
      categoryRanges[point.category].min = point.value
    }
    if (point.value > categoryRanges[point.category].max) {
      categoryRanges[point.category].max = point.value
    }
  }
  
  return {
    valueDomain: { min, max },
    categories: Array.from(categorySet).sort(),
    categoryValueRanges: categoryRanges
  }
}
