/**
 * Tests for points data normalization and expansion
 * Validates deterministic behavior and data integrity
 */

import { describe, it, expect } from 'vitest'
import { normalizePoint, expandPoints } from '../src/services/points.js'

describe('normalizePoint', () => {
  it('should normalize raw point with all fields', () => {
    const raw = {
      id: 'test-1',
      lng: 35.0,
      lat: 32.0,
      value: 50,
      category: 'A'
    }
    
    const normalized = normalizePoint(raw, 0)
    
    expect(normalized).toEqual({
      id: 'test-1',
      position: [35.0, 32.0],
      value: 50,
      category: 'A'
    })
  })
  
  it('should handle alternative field names (longitude/latitude)', () => {
    const raw = {
      longitude: 34.5,
      latitude: 31.5,
      value: 75,
      category: 'B'
    }
    
    const normalized = normalizePoint(raw, 5)
    
    expect(normalized.position).toEqual([34.5, 31.5])
    expect(normalized.id).toBe('pt-000005')
  })
  
  it('should provide defaults for missing fields', () => {
    const raw = {}
    
    const normalized = normalizePoint(raw, 10)
    
    expect(normalized.id).toBe('pt-000010')
    expect(normalized.position).toEqual([0, 0])
    expect(normalized.value).toBe(0)
    expect(normalized.category).toBe('A')
  })
})

describe('expandPoints', () => {
  it('should return empty array for empty input', () => {
    const result = expandPoints([], 1000)
    expect(result).toEqual([])
  })
  
  it('should return subset when base points exceed target', () => {
    const basePoints = Array.from({ length: 100 }, (_, i) => ({
      id: `pt-${i}`,
      position: [35.0, 32.0],
      value: i,
      category: 'A'
    }))
    
    const result = expandPoints(basePoints, 50)
    
    expect(result.length).toBe(50)
    expect(result[0].id).toBe('pt-0')
    expect(result[49].id).toBe('pt-49')
  })
  
  it('should expand points deterministically', () => {
    const basePoints = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' },
      { id: 'p2', position: [35.1, 32.1], value: 60, category: 'B' }
    ]
    
    const result1 = expandPoints(basePoints, 10)
    const result2 = expandPoints(basePoints, 10)
    

    expect(result1).toEqual(result2)
    expect(result1.length).toBe(10)
  })
  
  it('should preserve base points in expanded result', () => {
    const basePoints = [
      { id: 'p1', position: [35.0, 32.0], value: 50, category: 'A' }
    ]
    
    const result = expandPoints(basePoints, 5)
    

    expect(result[0].id).toBe('p1')
    expect(result[0].value).toBe(50)
    expect(result.length).toBe(5)
  })
  
  it('should generate points with valid structure', () => {
    const basePoints = [
      { id: 'base', position: [35.0, 32.0], value: 50, category: 'A' }
    ]
    
    const result = expandPoints(basePoints, 3)
    
    result.forEach(point => {
      expect(point).toHaveProperty('id')
      expect(point).toHaveProperty('position')
      expect(point).toHaveProperty('value')
      expect(point).toHaveProperty('category')
      expect(Array.isArray(point.position)).toBe(true)
      expect(point.position.length).toBe(2)
      expect(typeof point.value).toBe('number')
    })
  })
  
  it('should generate unique IDs for expanded points', () => {
    const basePoints = [
      { id: 'base', position: [35.0, 32.0], value: 50, category: 'A' }
    ]
    
    const result = expandPoints(basePoints, 10)
    const ids = result.map(p => p.id)
    const uniqueIds = new Set(ids)
    

    expect(uniqueIds.size).toBe(ids.length)
  })
})
