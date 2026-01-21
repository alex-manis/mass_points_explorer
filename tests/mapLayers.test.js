
import { describe, it, expect } from 'vitest'
import { createCategoryLayers, updateLayerFilters } from '../src/services/mapLayers.js'
import { computePointsMetadata } from '../src/state/filters.js'

describe('mapLayers - createCategoryLayers', () => {
  it('should create one layer per category', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 60, category: 'B' },
      { id: 'p3', position: [35.2, 32.2], value: 70, category: 'C' }
    ]
    
    const metadata = computePointsMetadata(points)
    
    const layers = createCategoryLayers(points, metadata.categories, metadata)
    
    expect(layers).toHaveLength(3)
    expect(layers[0].id).toBe('points-layer-A')
    expect(layers[1].id).toBe('points-layer-B')
    expect(layers[2].id).toBe('points-layer-C')
  })

  it('should share the same data reference across all layers', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 60, category: 'B' }
    ]
    
    const metadata = computePointsMetadata(points)
    
    const layers = createCategoryLayers(points, metadata.categories, metadata)

    expect(layers[0].props.data).toBe(points)
    expect(layers[1].props.data).toBe(points)
    expect(Object.is(layers[0].props.data, layers[1].props.data)).toBe(true)
  })

  it('should set initial filter range based on metadata', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 20, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 80, category: 'A' }
    ]
    
    const metadata = computePointsMetadata(points)
    
    const layers = createCategoryLayers(points, metadata.categories, metadata)
    
    expect(layers[0].props.filterRange).toEqual([20, 80])
  })

  it('should set all layers as initially visible', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 60, category: 'B' }
    ]
    
    const metadata = computePointsMetadata(points)
    
    const layers = createCategoryLayers(points, metadata.categories, metadata)
    
    layers.forEach(layer => {
      expect(layer.props.visible).toBe(true)
    })
  })

  it('should store category identifier in layer props', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 60, category: 'B' }
    ]
    
    const metadata = computePointsMetadata(points)
    
    const layers = createCategoryLayers(points, metadata.categories, metadata)
    
    expect(layers[0].props.categoryFilter).toBe('A')
    expect(layers[1].props.categoryFilter).toBe('B')
  })
})

describe('mapLayers - updateLayerFilters', () => {
  it('should update layer visibility based on selected categories', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 60, category: 'B' },
      { id: 'p3', position: [35.2, 32.2], value: 70, category: 'C' }
    ]
    
    const metadata = computePointsMetadata(points)
    
    const layers = createCategoryLayers(points, metadata.categories, metadata)
    
    const filters = {
      selectedCategories: new Set(['A', 'B']),
      valuePercentage: 100,
      categoryValueRanges: metadata.categoryValueRanges
    }
    
    const updatedLayers = updateLayerFilters(layers, filters)
    
    expect(updatedLayers[0].props.visible).toBe(true)
    expect(updatedLayers[1].props.visible).toBe(true)
    expect(updatedLayers[2].props.visible).toBe(false)
  })

  it('should update filter range for all layers based on percentage', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 10, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 100, category: 'A' },
      { id: 'p3', position: [35.2, 32.2], value: 20, category: 'B' },
      { id: 'p4', position: [35.3, 32.3], value: 80, category: 'B' }
    ]
    
    const metadata = computePointsMetadata(points)
    
    const layers = createCategoryLayers(points, metadata.categories, metadata)
    
    const filters = {
      selectedCategories: new Set(['A', 'B']),
      valuePercentage: 50,
      categoryValueRanges: metadata.categoryValueRanges
    }
    
    const updatedLayers = updateLayerFilters(layers, filters)
    
    expect(updatedLayers[0].props.filterRange).toEqual([10, 55])
    expect(updatedLayers[1].props.filterRange).toEqual([20, 50])
  })

  it('should use layer.clone() instead of recreating layers', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' }
    ]
    
    const metadata = computePointsMetadata(points)
    
    const layers = createCategoryLayers(points, metadata.categories, metadata)
    const initialLayerId = layers[0].id
    
    const filters = {
      selectedCategories: new Set(['A']),
      valuePercentage: 75,
      categoryValueRanges: metadata.categoryValueRanges
    }
    
    const updatedLayers = updateLayerFilters(layers, filters)
    
    expect(updatedLayers[0].id).toBe(initialLayerId)
  })

  it('should not mutate original layers array', () => {
    const points = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' }
    ]
    
    const metadata = computePointsMetadata(points)
    
    const layers = createCategoryLayers(points, metadata.categories, metadata)
    const originalVisible = layers[0].props.visible
    const originalFilterRange = [...layers[0].props.filterRange]
    
    const filters = {
      selectedCategories: new Set([]),
      valuePercentage: 75,
      categoryValueRanges: metadata.categoryValueRanges
    }
    
    updateLayerFilters(layers, filters)
        
    expect(layers[0].props.visible).toBe(originalVisible)
    expect(layers[0].props.filterRange).toEqual(originalFilterRange)
  })
})
