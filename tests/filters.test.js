
import { describe, it, expect } from 'vitest'
import {
  createDefaultFilters,
  computePointsMetadata
} from '../src/state/filters.js'

describe('computePointsMetadata', () => {
  it('should compute correct value domain from points', () => {
    const points = [
      { value: 10, category: 'A' },
      { value: 50, category: 'B' },
      { value: 100, category: 'A' },
      { value: 25, category: 'C' }
    ]
    
    const meta = computePointsMetadata(points)
    
    expect(meta.valueDomain.min).toBe(10)
    expect(meta.valueDomain.max).toBe(100)
    expect(meta.categoryValueRanges.A).toEqual({ min: 10, max: 100 })
    expect(meta.categoryValueRanges.B).toEqual({ min: 50, max: 50 })
    expect(meta.categoryValueRanges.C).toEqual({ min: 25, max: 25 })
  })
  
  it('should extract unique categories sorted', () => {
    const points = [
      { value: 10, category: 'C' },
      { value: 50, category: 'A' },
      { value: 100, category: 'B' },
      { value: 25, category: 'A' }
    ]
    
    const meta = computePointsMetadata(points)
    
    expect(meta.categories).toEqual(['A', 'B', 'C'])
  })
  
  it('should handle empty points array', () => {
    const meta = computePointsMetadata([])
    
    expect(meta.valueDomain.min).toBe(0)
    expect(meta.valueDomain.max).toBe(100)
    expect(meta.categories).toEqual([])
  })
  
  it('should handle single point', () => {
    const points = [{ value: 42, category: 'X' }]
    
    const meta = computePointsMetadata(points)
    
    expect(meta.valueDomain.min).toBe(42)
    expect(meta.valueDomain.max).toBe(42)
    expect(meta.categories).toEqual(['X'])
  })
})

describe('createDefaultFilters', () => {
  it('should create filters with correct initial state', () => {
    const meta = {
      valueDomain: { min: 10, max: 100 },
      categories: ['A', 'B', 'C'],
      categoryValueRanges: {
        A: { min: 10, max: 100 },
        B: { min: 20, max: 80 },
        C: { min: 30, max: 60 }
      }
    }
    
    const filters = createDefaultFilters(meta)
    
    expect(filters.valuePercentage).toBe(100)
    expect(filters.categoryValueRanges).toEqual(meta.categoryValueRanges)
    expect(filters.selectedCategories).toBeInstanceOf(Set)
    expect(filters.selectedCategories.size).toBe(3)
    expect(filters.selectedCategories.has('A')).toBe(true)
    expect(filters.selectedCategories.has('B')).toBe(true)
    expect(filters.selectedCategories.has('C')).toBe(true)
  })
  
  it('should select all categories by default', () => {
    const meta = {
      valueDomain: { min: 0, max: 50 },
      categories: ['X', 'Y'],
      categoryValueRanges: {
        X: { min: 0, max: 50 },
        Y: { min: 10, max: 40 }
      }
    }
    
    const filters = createDefaultFilters(meta)
    
    expect(Array.from(filters.selectedCategories)).toEqual(['X', 'Y'])
  })
})

describe('Filter logic correctness', () => {
  it('should correctly filter by category selection', () => {
    const points = [
      { id: 'p1', value: 50, category: 'A' },
      { id: 'p2', value: 50, category: 'B' },
      { id: 'p3', value: 50, category: 'C' },
      { id: 'p4', value: 50, category: 'A' }
    ]
    
    const meta = computePointsMetadata(points)
    const filters = createDefaultFilters(meta)

    filters.selectedCategories = new Set(['A'])
    
    const passesFilter = points.filter(p => 
      filters.selectedCategories.has(p.category)
    )
    
    expect(passesFilter.length).toBe(2)
    expect(passesFilter.every(p => p.category === 'A')).toBe(true)
  })
  
  it('should correctly identify points within percentage range per category', () => {
    const points = [
      { id: 'p1', value: 10, category: 'A' },
      { id: 'p2', value: 50, category: 'A' },
      { id: 'p3', value: 100, category: 'A' },
      { id: 'p4', value: 20, category: 'B' },
      { id: 'p5', value: 80, category: 'B' }
    ]
    
    const meta = computePointsMetadata(points)
    const filters = createDefaultFilters(meta)
    
       filters.valuePercentage = 50
    

    const categoryRanges = meta.categoryValueRanges
    
    const passesFilterA = points.filter(p => {
      if (p.category !== 'A') return false
      const range = categoryRanges.A
      const maxValue = range.min + (range.max - range.min) * 0.5
      return p.value >= range.min && p.value <= maxValue
    })
    
    const passesFilterB = points.filter(p => {
      if (p.category !== 'B') return false
      const range = categoryRanges.B
      const maxValue = range.min + (range.max - range.min) * 0.5
      return p.value >= range.min && p.value <= maxValue
    })
    
    expect(passesFilterA.map(p => p.id)).toEqual(['p1', 'p2'])
    expect(passesFilterB.map(p => p.id)).toEqual(['p4'])
  })
})
