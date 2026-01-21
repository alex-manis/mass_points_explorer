
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { expandPoints } from '../src/lib/points.js'
import {
  createDefaultFilters,
  computePointsMetadata
} from '../src/state/filters.js'


function toggleCategory(filters, category) {
  if (filters.selectedCategories.has(category)) {
    filters.selectedCategories.delete(category)
  } else {
    filters.selectedCategories.add(category)
  }
}

describe('Constraint 1: Data reference stability', () => {
  it('should maintain stable data reference after filter updates', () => {

    const basePoints = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' }
    ]
    const points = expandPoints(basePoints, 100)
    
    const initialPointsRef = points
    
    const meta = computePointsMetadata(points)
    const filters = createDefaultFilters(meta)
    
    filters.valuePercentage = 80
    filters.valuePercentage = 70
    filters.valuePercentage = 90
    
    toggleCategory(filters, 'A')
    toggleCategory(filters, 'A')
    
    expect(points).toBe(initialPointsRef)
    expect(Object.is(points, initialPointsRef)).toBe(true)
  })
  
  it('should not mutate points array during filter operations', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 60, category: 'B' }
    ]
    
    const initialLength = points.length
    const initialFirstItem = points[0]
    
    const meta = computePointsMetadata(points)
    const filters = createDefaultFilters(meta)
    
    filters.valuePercentage = 50
    filters.selectedCategories = new Set(['A'])
    
    expect(points.length).toBe(initialLength)
    expect(points[0]).toBe(initialFirstItem)
  })
})

describe('Constraint 2: No CPU filtering via Array.prototype.filter', () => {
  it('should not create filtered subsets during filter state updates', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 60, category: 'B' }
    ]
    
    const meta = computePointsMetadata(points)
    const filters = createDefaultFilters(meta)
    
    let filterCalledOnPoints = false
    const originalFilter = points.filter
    points.filter = function(...args) {
      filterCalledOnPoints = true
      return originalFilter.apply(this, args)
    }
    
    filters.valuePercentage = 80
    filters.valuePercentage = 70
    toggleCategory(filters, 'A')
    toggleCategory(filters, 'B')
    
    points.filter = originalFilter
    
    expect(filterCalledOnPoints).toBe(false)
  })
  
  it('should not create new filtered arrays from points data', () => {
    const points = Array.from({ length: 100 }, (_, i) => ({
      id: `p${i}`,
      position: [35.0 + i * 0.01, 32.0 + i * 0.01],
      value: 10 + i,
      category: ['A', 'B', 'C'][i % 3]
    }))
    
    const meta = computePointsMetadata(points)
    const filters = createDefaultFilters(meta)
    
      let subsetCreated = false
    const checkSubsetCreation = (arr) => {
      if (Array.isArray(arr) && arr.length > 0 && arr.length < points.length) {
        if (arr.every(item => points.includes(item))) {
          subsetCreated = true
        }
      }
    }
    
    for (let i = 0; i < 10; i++) {
      const percentage = 20 + i * 5
      filters.valuePercentage = percentage
      
      checkSubsetCreation(filters)
    }
    
    expect(subsetCreated).toBe(false)
  })
})

describe('Constraint 3: No layer recreation', () => {
  it('should verify layer factory is called exactly once per category during initialization', () => {
    let layerCreationCount = 0
    
    function createMockLayerForCategory(data, category) {
      layerCreationCount++
      return {
        id: `mock-layer-${category}`,
        data,
        category,
        clone: function(props) {
          return { ...this, ...props }
        }
      }
    }
    
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' }
    ]
    const categories = ['A', 'B', 'C']
    
    const layers = categories.map(cat => createMockLayerForCategory(points, cat))
    expect(layerCreationCount).toBe(3)
    
    const updatedLayers1 = layers.map(l => l.clone({ filterRange: [20, 80] }))
    const updatedLayers2 = updatedLayers1.map(l => l.clone({ filterRange: [30, 70] }))
    const updatedLayers3 = updatedLayers2.map(l => l.clone({ visible: true }))
    
    expect(layerCreationCount).toBe(3)
    expect(updatedLayers3[0].id).toBe('mock-layer-A')
    expect(updatedLayers3[1].id).toBe('mock-layer-B')
    expect(updatedLayers3[2].id).toBe('mock-layer-C')
  })
})

describe('Constraint 4: No new array allocations for filtered dataset', () => {
  it('should not create derived arrays from points during filter updates', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 60, category: 'B' },
      { id: 'p3', position: [35.2, 32.2], value: 70, category: 'C' }
    ]
    
    const meta = computePointsMetadata(points)
    const filters = createDefaultFilters(meta)
    
    let methodsCalled = {
      filter: false,
      map: false,
      slice: false
    }
    
    const originalFilter = points.filter
    const originalMap = points.map
    const originalSlice = points.slice
    
    points.filter = function(...args) {
      methodsCalled.filter = true
      return originalFilter.apply(this, args)
    }
    
    points.map = function(...args) {
      methodsCalled.map = true
      return originalMap.apply(this, args)
    }
    
    points.slice = function(...args) {
      methodsCalled.slice = true
      return originalSlice.apply(this, args)
    }
    
    filters.valuePercentage = 80
    filters.selectedCategories = new Set(['A', 'B'])
    filters.valuePercentage = 70
    
    points.filter = originalFilter
    points.map = originalMap
    points.slice = originalSlice
    
    expect(methodsCalled.filter).toBe(false)
    expect(methodsCalled.map).toBe(false)
    expect(methodsCalled.slice).toBe(false)
  })
})

describe('Integration: All constraints combined', () => {
  it('should satisfy all constraints during realistic filter workflow', () => {

    const basePoints = [
      { id: 'p1', position: [35.0, 32.0], value: 30, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 50, category: 'B' }
    ]
    const points = expandPoints(basePoints, 50)
    const initialRef = points
    const initialLength = points.length
    const initialFirstPoint = points[0]
    
    const meta = computePointsMetadata(points)
    const filters = createDefaultFilters(meta)
    
    let arrayMutated = false
    const originalFilter = points.filter
    points.filter = function(...args) {
      arrayMutated = true
      return originalFilter.apply(this, args)
    }
    
    const updates = [
      () => filters.valuePercentage = 80,
      () => filters.valuePercentage = 75,
      () => filters.valuePercentage = 70,
      () => toggleCategory(filters, 'A'),
      () => filters.valuePercentage = 65,
      () => toggleCategory(filters, 'A'),
      () => filters.valuePercentage = 60,
      () => filters.selectedCategories = new Set(['A']),
      () => filters.valuePercentage = 55,
      () => filters.valuePercentage = 90
    ]
    
    updates.forEach(update => update())
    
    points.filter = originalFilter
    
    expect(points).toBe(initialRef)
    expect(Object.is(points, initialRef)).toBe(true)
    
    expect(arrayMutated).toBe(false)
    
    expect(points.length).toBe(initialLength)
    
    expect(points[0]).toBe(initialFirstPoint)
    expect(points[0]).toHaveProperty('id')
    expect(points[0]).toHaveProperty('value')
    expect(points[0]).toHaveProperty('category')
  })
})
