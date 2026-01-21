import { CATEGORIES, DEFAULT_CATEGORY, POINT_CONFIG } from '../utils/constants.js'

function deterministicHash(seed) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Normalize to 0-1 range
  return Math.abs(hash % 10000) / 10000
}

function deterministicValue(seed, min, max) {
  const normalized = deterministicHash(seed)
  return min + normalized * (max - min)
}

export function normalizePoint(raw, index) {
  return {
    id: raw.id || `pt-${String(index).padStart(6, '0')}`,
    position: [raw.lng || raw.longitude || 0, raw.lat || raw.latitude || 0],
    value: raw.value !== undefined ? Number(raw.value) : 0,
    category: raw.category || DEFAULT_CATEGORY
  }
}

function swarmOffset(pointIndex, swarmId, baseRadius) {
  // Swarm-wide parameters (same for all points in this swarm)
  const swarmSeed = swarmId
  const theta = deterministicHash(`${swarmSeed}-rot`) * Math.PI * 2  // Rotation angle
  const a = baseRadius * (0.6 + deterministicHash(`${swarmSeed}-a`) * 1.2)  // Major axis
  const b = baseRadius * (0.3 + deterministicHash(`${swarmSeed}-b`) * 0.8)  // Minor axis
  
  // Point-specific parameters
  const pointSeed = `${swarmSeed}-pt${pointIndex}`
  const ang = deterministicHash(`${pointSeed}-ang`) * Math.PI * 2
  const u = deterministicHash(`${pointSeed}-u`)
  const r = Math.sqrt(u)  // Denser towards center
  
  // Organic boundary irregularity (amoeba effect)
  const k = 0.35  // Irregularity strength
  const m = 3 + Math.floor(deterministicHash(`${swarmSeed}-waves`) * 5)  // 3-7 waves
  const phase = deterministicHash(`${swarmSeed}-phase`) * Math.PI * 2
  const wobble = 1 + k * Math.sin(m * ang + phase)
  
  // Local ellipse coordinates
  let x = Math.cos(ang) * a * r * wobble
  let y = Math.sin(ang) * b * r * wobble
  
  // Rotate ellipse
  const cosT = Math.cos(theta)
  const sinT = Math.sin(theta)
  const xr = x * cosT - y * sinT
  const yr = x * sinT + y * cosT
  
  return [xr, yr]
}

export function expandPoints(basePoints, targetCount) {
  if (!basePoints || basePoints.length === 0) {
    return []
  }

  if (basePoints.length >= targetCount) {
    return basePoints.slice(0, targetCount)
  }

  const expanded = []
  const baseCount = basePoints.length
  
  // Add all base points first
  basePoints.forEach(point => {
    expanded.push({ ...point })
  })

  // Generate additional points deterministically but in pseudo-random order
  const remaining = targetCount - baseCount
  
  for (let i = 0; i < remaining; i++) {
    // Use modulo to cycle through base points
    const baseIndex = i % baseCount
    const basePoint = basePoints[baseIndex]
    
    // Pseudo-random shuffling of point index for less regular distribution
    // This creates clusters and gaps instead of uniform spacing
    const shuffledIndex = Math.floor(deterministicHash(`${basePoint.id}-shuffle-${i}`) * remaining)
    const mixedIndex = (i + shuffledIndex) % remaining
    
    // Get elliptical swarm offset with organic boundaries
    // Using mixed index creates more chaotic, natural-looking distribution
    const [dLng, dLat] = swarmOffset(mixedIndex, basePoint.id, POINT_CONFIG.jitterRange)
    
    // New coordinates with swarm offset
    const newLng = basePoint.position[0] + dLng
    const newLat = basePoint.position[1] + dLat
    
    // Create unique seed for other properties (use original i for determinism)
    const seed = `${basePoint.id}-${i}`
    
    // Deterministic value with some clustering
    const baseValue = deterministicValue(`${seed}-val`, POINT_CONFIG.valueRange.min, POINT_CONFIG.valueRange.max)
    // Add slight variation based on position in swarm (closer to center = larger schools)
    const radialFactor = Math.sqrt(deterministicHash(`${seed}-rad`))
    const newValue = baseValue * (0.7 + radialFactor * 0.6)
    
    // Deterministic category selection
    const categoryIndex = Math.floor(deterministicValue(`${seed}-cat`, 0, CATEGORIES.length))
    const newCategory = CATEGORIES[categoryIndex]
    
    expanded.push({
      id: `${basePoint.id}-gen-${i}`,
      position: [newLng, newLat],
      value: newValue,
      category: newCategory
    })
  }

  return expanded
}

export async function loadBasePoints() {
  try {
    const response = await fetch('/points.base.json')
    
    if (!response.ok) {
      throw new Error(`Failed to load points: ${response.statusText}`)
    }
    
    const rawPoints = await response.json()
    
    // Normalize all points
    return rawPoints.map((raw, index) => normalizePoint(raw, index))
  } catch (error) {
    console.error('Error loading base points:', error)
    throw error
  }
}
