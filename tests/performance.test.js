    
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { expandPoints, normalizePoint } from '../src/lib/points.js'
import { createDefaultFilters, computePointsMetadata } from '../src/state/filters.js'
import { createCategoryLayers, updateLayerFilters } from '../src/lib/mapLayers.js'

const toggleCategory = (filters, category) => {
  filters.selectedCategories.has(category)
    ? filters.selectedCategories.delete(category)
    : filters.selectedCategories.add(category)
}

const findLayer = (layers, category) => 
  layers.find(l => l.props.categoryFilter === category)

const createTestPoint = (id, value, category) => ({
  id,
  position: [35.0, 32.0],
  value,
  category
})

describe('Data normalization and derivation', () => {
  it('should normalize points with all required fields', () => {
    const rawPoints = [
      { id: 'p1', lng: 35.0, lat: 32.0, value: 50, category: 'A' },
      { id: 'p2', longitude: 35.1, latitude: 32.1, value: 60, category: 'B' }
    ]
    
    const normalized = rawPoints.map((raw, idx) => normalizePoint(raw, idx))
    
    normalized.forEach(point => {
      expect(point).toHaveProperty('id')
      expect(point).toHaveProperty('position')
      expect(point).toHaveProperty('value')
      expect(point).toHaveProperty('category')
      expect(Array.isArray(point.position)).toBe(true)
      expect(point.position.length).toBe(2)
    })
    
    expect(normalized[0].position).toEqual([35.0, 32.0])
    expect(normalized[1].position).toEqual([35.1, 32.1])
  })
  
  it('should derive metadata correctly from large dataset', () => {
    const basePoints = [
      createTestPoint('b1', 10, 'A'),
      createTestPoint('b2', 90, 'B')
    ]
    
    const points = expandPoints(basePoints, 10000)
    const metadata = computePointsMetadata(points)
    
    expect(metadata).toHaveProperty('valueDomain')
    expect(metadata).toHaveProperty('categories')
    expect(metadata).toHaveProperty('categoryValueRanges')
    
    expect(metadata.valueDomain.min).toBeLessThanOrEqual(metadata.valueDomain.max)
    
    const uniqueCategories = new Set(metadata.categories)
    expect(uniqueCategories.size).toBe(metadata.categories.length)
    expect([...metadata.categories]).toEqual([...metadata.categories].sort())
    
    metadata.categories.forEach(cat => {
      const range = metadata.categoryValueRanges[cat]
      expect(range).toBeDefined()
      expect(range.min).toBeLessThanOrEqual(range.max)
    })
  })
  
  it('should derive consistent metadata across multiple computations', () => {
    const points = [
      createTestPoint('p1', 30, 'A'),
      createTestPoint('p2', 70, 'B'),
      createTestPoint('p3', 50, 'A')
    ]
    
    const meta1 = computePointsMetadata(points)
    const meta2 = computePointsMetadata(points)
    
    expect(meta1).toEqual(meta2)
  })
  
  it('should correctly expand base points to target count with determinism', () => {
    const basePoints = [createTestPoint('base', 50, 'A')]
    
    const expanded1 = expandPoints(basePoints, 1000)
    const expanded2 = expandPoints(basePoints, 1000)
    
    expect(expanded1.length).toBe(1000)
    expect(expanded1).toEqual(expanded2)
    
    expanded1.forEach(point => {
      expect(point).toHaveProperty('id')
      expect(point).toHaveProperty('position')
      expect(point).toHaveProperty('value')
      expect(point).toHaveProperty('category')
    })
  })
  
  it('should derive per-category value ranges correctly', () => {
    const points = [
      createTestPoint('p1', 10, 'A'),
      createTestPoint('p2', 50, 'A'),
      createTestPoint('p3', 100, 'A'),
      createTestPoint('p4', 20, 'B'),
      createTestPoint('p5', 30, 'B')
    ]
    
    const meta = computePointsMetadata(points)
    
    expect(meta.categoryValueRanges.A).toEqual({ min: 10, max: 100 })
    expect(meta.categoryValueRanges.B).toEqual({ min: 20, max: 30 })
  })
})

describe('Filter correctness: Points visibility matches filter criteria', () => {
  let points, metadata, filters, layers
  
  beforeEach(() => {
    points = [
      createTestPoint('p1', 10, 'A'),
      createTestPoint('p2', 30, 'A'),
      createTestPoint('p3', 50, 'A'),
      createTestPoint('p4', 70, 'A'),
      createTestPoint('p5', 90, 'A'),
      createTestPoint('p6', 20, 'B'),
      createTestPoint('p7', 40, 'B'),
      createTestPoint('p8', 60, 'B'),
      createTestPoint('p9', 80, 'B')
    ]
    
    metadata = computePointsMetadata(points)
    filters = createDefaultFilters(metadata)
    layers = createCategoryLayers(points, metadata.categories, metadata)
  })
  
  it('should show all points when filters are at 100% and all categories selected', () => {
    filters.valuePercentage = 100
    filters.selectedCategories = new Set(metadata.categories)
    
    const updatedLayers = updateLayerFilters(layers, filters)
    
    updatedLayers.forEach(layer => {
      expect(layer.props.visible).toBe(true)
    })
    
    const layerA = findLayer(updatedLayers, 'A')
    const layerB = findLayer(updatedLayers, 'B')
    
    expect(layerA.props.filterRange).toEqual([10, 90])
    expect(layerB.props.filterRange).toEqual([20, 80])
  })
  
  it('should hide points of unselected categories', () => {
    filters.selectedCategories = new Set(['A'])
    
    const updatedLayers = updateLayerFilters(layers, filters)
    
    expect(findLayer(updatedLayers, 'A').props.visible).toBe(true)
    expect(findLayer(updatedLayers, 'B').props.visible).toBe(false)
  })
  
  it('should correctly filter points by value percentage per category', () => {
    filters.valuePercentage = 50
    const updatedLayers = updateLayerFilters(layers, filters)
    
    const layerA = findLayer(updatedLayers, 'A')
    const layerB = findLayer(updatedLayers, 'B')
    
    expect(layerA.props.filterRange).toEqual([10, 50])
    expect(layerB.props.filterRange).toEqual([20, 50])
    
    const getFilterA = layerA.props.getFilterValue
    expect(getFilterA(points[0])).toBe(10)
    expect(getFilterA(points[5])).toBe(-Infinity)
  })
  
  it('should hide all points when value percentage is 0%', () => {
    filters.valuePercentage = 0
    const updatedLayers = updateLayerFilters(layers, filters)
    
    updatedLayers.forEach(layer => {
      const [min, max] = layer.props.filterRange
      expect(max).toBeLessThan(min)
    })
  })
  
  it('should apply combined filters correctly (category + value)', () => {
    filters.selectedCategories = new Set(['A'])
    filters.valuePercentage = 50
    
    const updatedLayers = updateLayerFilters(layers, filters)
    
    const layerA = findLayer(updatedLayers, 'A')
    const layerB = findLayer(updatedLayers, 'B')
    
    expect(layerA.props.visible).toBe(true)
    expect(layerA.props.filterRange).toEqual([10, 50])
    expect(layerB.props.visible).toBe(false)
  })
  
  it('should correctly filter large dataset (250k points)', () => {
    const basePoints = [
      createTestPoint('b1', 20, 'A'),
      createTestPoint('b2', 80, 'B')
    ]
    
    const largePoints = expandPoints(basePoints, 250000)
    const largeMeta = computePointsMetadata(largePoints)
    const largeFilters = createDefaultFilters(largeMeta)
    const largeLayers = createCategoryLayers(largePoints, largeMeta.categories, largeMeta)
    
    largeFilters.valuePercentage = 50
    largeFilters.selectedCategories = new Set(['A'])
    
    const updatedLargeLayers = updateLayerFilters(largeLayers, largeFilters)
    
    expect(findLayer(updatedLargeLayers, 'A').props.visible).toBe(true)
    expect(findLayer(updatedLargeLayers, 'B').props.visible).toBe(false)
    
    const rangeA = largeMeta.categoryValueRanges.A
    const expectedMaxA = rangeA.min + (rangeA.max - rangeA.min) * 0.5
    expect(findLayer(updatedLargeLayers, 'A').props.filterRange[0]).toBe(rangeA.min)
    expect(findLayer(updatedLargeLayers, 'A').props.filterRange[1]).toBeCloseTo(expectedMaxA, 5)
  })
})

describe('Architectural constraints: Data reference stability', () => {
  it('should maintain stable data reference during filter updates (250k points)', () => {
    const points = expandPoints([createTestPoint('b1', 50, 'A')], 250000)
    const initialRef = points
    
    const metadata = computePointsMetadata(points)
    const filters = createDefaultFilters(metadata)
    
    for (let i = 0; i < 50; i++) {
      filters.valuePercentage = 10 + (i % 90)
      toggleCategory(filters, 'A')
    }
    
    expect(points).toBe(initialRef)
    expect(points.length).toBe(250000)
  })
  
  it('should not mutate individual point objects during filters', () => {
    const points = [createTestPoint('p1', 50, 'A')]
    const initialRef = points[0]
    
    const metadata = computePointsMetadata(points)
    const filters = createDefaultFilters(metadata)
    
    filters.valuePercentage = 30
    filters.selectedCategories = new Set([])
    
    expect(points[0]).toBe(initialRef)
  })
})

describe('Architectural constraints: No CPU-side filtering', () => {
  let spies = []
  
  afterEach(() => {
    spies.forEach(spy => spy.mockRestore())
    spies = []
  })
  
  it('should not call Array.prototype.filter on points during updates', () => {
    const points = expandPoints([createTestPoint('b1', 50, 'A')], 10000)
    const metadata = computePointsMetadata(points)
    const filters = createDefaultFilters(metadata)
    
    const filterSpy = vi.spyOn(points, 'filter')
    spies.push(filterSpy)
    
    filters.valuePercentage = 80
    filters.valuePercentage = 60
    filters.valuePercentage = 40
    toggleCategory(filters, 'A')
    toggleCategory(filters, 'A')
    
    expect(filterSpy).not.toHaveBeenCalled()
  })
  
  it('should not create filtered subsets via map/slice during updates', () => {
    const points = Array.from({ length: 1000 }, (_, i) => 
      createTestPoint(`p${i}`, i, 'A')
    )
    
    const metadata = computePointsMetadata(points)
    const filters = createDefaultFilters(metadata)
    
    const mapSpy = vi.spyOn(points, 'map')
    const sliceSpy = vi.spyOn(points, 'slice')
    spies.push(mapSpy, sliceSpy)
    
    for (let i = 0; i < 20; i++) {
      filters.valuePercentage = 10 + i * 4
    }
    
    expect(mapSpy).not.toHaveBeenCalled()
    expect(sliceSpy).not.toHaveBeenCalled()
  })
})

describe('Architectural constraints: Stable layer instances', () => {
  let spies = []
  
  afterEach(() => {
    spies.forEach(spy => spy.mockRestore())
    spies = []
  })
  
  it('should reuse layers via clone, not recreate during updates', () => {
    const points = [
      createTestPoint('p1', 50, 'A'),
      createTestPoint('p2', 60, 'B')
    ]
    
    const metadata = computePointsMetadata(points)
    const filters = createDefaultFilters(metadata)
    const layers = createCategoryLayers(points, metadata.categories, metadata)
    const initialLayerIds = layers.map(l => l.id)
    
    const cloneSpies = layers.map(layer => vi.spyOn(layer, 'clone'))
    spies.push(...cloneSpies)
    
    const updatedLayers1 = updateLayerFilters(layers, filters)
    filters.valuePercentage = 60
    const updatedLayers2 = updateLayerFilters(updatedLayers1, filters)
    
    expect(cloneSpies.some(spy => spy.mock.calls.length > 0)).toBe(true)
    expect(updatedLayers2.map(l => l.id)).toEqual(initialLayerIds)
  })
  
  it('should verify no new layer construction during 100 updates', () => {
    const points = [createTestPoint('p1', 50, 'A')]
    const metadata = computePointsMetadata(points)
    const filters = createDefaultFilters(metadata)
    
    let layers = createCategoryLayers(points, metadata.categories, metadata)
    const initialLayerIds = layers.map(l => l.id)
    
    for (let i = 0; i < 100; i++) {
      filters.valuePercentage = 10 + (i % 90)
      layers = updateLayerFilters(layers, filters)
    }
    
    expect(layers.map(l => l.id)).toEqual(initialLayerIds)
  })
})

describe('Architectural constraints: Incremental updates only', () => {
  it('should only update filterRange and visible props during updates', () => {
    const points = [
      createTestPoint('p1', 50, 'A'),
      createTestPoint('p2', 60, 'B')
    ]
    
    const metadata = computePointsMetadata(points)
    const filters = createDefaultFilters(metadata)
    const layers = createCategoryLayers(points, metadata.categories, metadata)
    const initialDataRefs = layers.map(l => l.props.data)
    
    filters.valuePercentage = 50
    const updatedLayers = updateLayerFilters(layers, filters)
    
    updatedLayers.forEach((layer, idx) => {
      expect(layer.props.data).toBe(initialDataRefs[idx])
    })
  })
  
  it('should not reallocate data arrays during 50 consecutive updates', () => {
    const points = expandPoints([createTestPoint('b1', 50, 'A')], 100000)
    const metadata = computePointsMetadata(points)
    const filters = createDefaultFilters(metadata)
    let layers = createCategoryLayers(points, metadata.categories, metadata)
    const initialDataRef = layers[0].props.data
    
    for (let i = 0; i < 50; i++) {
      filters.valuePercentage = 10 + i
      layers = updateLayerFilters(layers, filters)
    }
    
    layers.forEach(layer => {
      expect(layer.props.data).toBe(initialDataRef)
    })
  })
})
