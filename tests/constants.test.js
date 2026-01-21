
import { describe, it, expect } from 'vitest'
import { 
  CATEGORY_COLORS, 
  DEFAULT_COLOR, 
  getCategoryColor,
  CATEGORIES,
  DEFAULT_CATEGORY,
  DEFAULT_MAP_CONFIG,
  LAYER_CONFIG,
  POINT_CONFIG
} from '../src/utils/constants.js'

describe('colors constants', () => {
  it('should export category colors', () => {
    expect(CATEGORY_COLORS).toBeDefined()
    expect(CATEGORY_COLORS.A).toEqual([30, 90, 180, 200])
    expect(CATEGORY_COLORS.B).toEqual([255, 200, 50, 200])
  })

  it('should export default color', () => {
    expect(DEFAULT_COLOR).toEqual([200, 200, 200, 180])
  })

  it('getCategoryColor should return correct color for known category', () => {
    expect(getCategoryColor('A')).toEqual(CATEGORY_COLORS.A)
    expect(getCategoryColor('B')).toEqual(CATEGORY_COLORS.B)
  })

  it('getCategoryColor should return default color for unknown category', () => {
    expect(getCategoryColor('Z')).toEqual(DEFAULT_COLOR)
    expect(getCategoryColor(undefined)).toEqual(DEFAULT_COLOR)
  })
})

describe('categories constants', () => {
  it('should export categories array', () => {
    expect(CATEGORIES).toEqual(['A', 'B', 'C', 'D', 'E'])
  })

  it('should export default category', () => {
    expect(DEFAULT_CATEGORY).toBe('A')
  })
})

describe('map constants', () => {
  it('should export default map config', () => {
    expect(DEFAULT_MAP_CONFIG).toBeDefined()
    expect(DEFAULT_MAP_CONFIG.center).toEqual([33.9, 32.7])
    expect(DEFAULT_MAP_CONFIG.zoom).toBe(8.5)
    expect(DEFAULT_MAP_CONFIG.style).toBe('mapbox://styles/mapbox/dark-v11')
  })

  it('should export layer config', () => {
    expect(LAYER_CONFIG).toBeDefined()
    expect(LAYER_CONFIG.opacity).toBe(0.75)
    expect(LAYER_CONFIG.radiusScale).toBe(10)
  })

  it('should export point config', () => {
    expect(POINT_CONFIG).toBeDefined()
    expect(POINT_CONFIG.defaultTargetCount).toBe(250000)
    expect(POINT_CONFIG.jitterRange).toBe(1.2)
    expect(POINT_CONFIG.valueRange).toEqual({ min: 1, max: 100 })
  })
})
