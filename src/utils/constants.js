export const CATEGORIES = ['A', 'B', 'C', 'D', 'E']

export const FISH_NAMES = {
  A: 'Blue Tuna',
  B: 'Golden Mackerel',
  C: 'Silver Sardine',
  D: 'Red Snapper',
  E: 'Green Mackerel'
}

export const DEFAULT_CATEGORY = 'A'

export const CATEGORY_COLORS = {
  A: [30, 90, 180, 200],     
  B: [255, 200, 50, 200],     
  C: [150, 200, 240, 200],    
  D: [255, 100, 60, 200],     
  E: [80, 180, 140, 200]      
}

export const DEFAULT_COLOR = [200, 200, 200, 180]

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR
}

export const DEFAULT_MAP_CONFIG = {
  center: [33.9, 32.7], // Mediterranean Sea off Israeli coast [lng, lat]
  zoom: 8.5,
  pitch: 0,
  bearing: 0,
  style: 'mapbox://styles/mapbox/dark-v11'
}

export const LAYER_CONFIG = {
  opacity: 0.75,
  radiusScale: 10,
  radiusMinPixels: 1,
  radiusMaxPixels: 8,
  lineWidthMinPixels: 0.5,
  radiusMultiplier: 0.5, 
}

export const POINT_CONFIG = {
  defaultTargetCount: 250000,
  jitterRange: 1.2, 
  valueRange: {
    min: 1,
    max: 100
  }
}
