// Fish species categories used throughout the app
export const CATEGORIES = ['A', 'B', 'C', 'D', 'E']

// Names for each category
export const FISH_NAMES = {
  A: 'Blue Tuna',
  B: 'Golden Mackerel',
  C: 'Silver Sardine',
  D: 'Red Snapper',
  E: 'Green Mackerel'
}

export const DEFAULT_CATEGORY = 'A'

// RGBA colors for map visualization [R, G, B, Alpha]
export const CATEGORY_COLORS = {
  A: [30, 90, 180, 200],      // Blue
  B: [255, 200, 50, 200],     // Golden
  C: [150, 200, 240, 200],    // Light Blue
  D: [255, 100, 60, 200],     // Red
  E: [80, 180, 140, 200]      // Green
}

export const DEFAULT_COLOR = [200, 200, 200, 180]

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || DEFAULT_COLOR
}

// ==================== MAP CONFIGURATION ====================
// Mapbox initial settings

export const DEFAULT_MAP_CONFIG = {
  center: [33.9, 32.7],  // Mediterranean Sea off Israeli coast [lng, lat]
  zoom: 8.5,             // Initial zoom level
  pitch: 0,              // Camera tilt angle (0-60)
  bearing: 0,            // Map rotation (0-360)
  style: 'mapbox://styles/mapbox/dark-v11'  // Dark theme
}

// ==================== LAYER CONFIGURATION ====================
// Deck.gl ScatterplotLayer visual settings

export const LAYER_CONFIG = {
  opacity: 0.75,              // Layer transparency (0-1)
  radiusScale: 10,            // Global radius multiplier
  radiusMinPixels: 1,         // Minimum point size in pixels
  radiusMaxPixels: 8,         // Maximum point size in pixels
  lineWidthMinPixels: 0.5,    // Stroke width
  radiusMultiplier: 0.5       // Multiplier for value-based sizing
}

// ==================== POINT GENERATION ====================
// Configuration for synthetic data generation and point expansion

export const POINT_CONFIG = {
  // Target number of points to generate from base data
  defaultTargetCount: 250000,
  
  // Geographic spread radius (degrees)
  jitterRange: 1.2,
  
  // Value range for generated fish school sizes
  valueRange: {
    min: 1,
    max: 100
  },
  
  // ID generation settings
  idPrefix: 'pt-',              // Prefix for generated point IDs
  idPadding: 6,                 // Zero-padding length (e.g., pt-000001)
  hashNormalizer: 10000,        // Modulo for deterministic hash normalization
  
  // Organic swarm distribution algorithm parameters
  swarm: {
    majorAxisMin: 0.6,          // Minimum ellipse major axis multiplier
    majorAxisRange: 1.2,        // Major axis variation range
    minorAxisMin: 0.3,          // Minimum ellipse minor axis multiplier
    minorAxisRange: 0.8,        // Minor axis variation range
    irregularityStrength: 0.35, // Amoeba-like boundary irregularity (0-1)
    wavesMin: 3,                // Minimum number of boundary waves
    wavesRange: 5               // Wave count variation (results in 3-7 waves)
  },
  
  // Value clustering parameters (closer to center = larger schools)
  radialValueMin: 0.7,          // Minimum radial value multiplier
  radialValueRange: 0.6         // Radial variation range
}

export const DATA_CONFIG = {
  basePointsPath: '/points.base.json'
}

export const MAP_TIMEOUTS = {
  loadTimeout: 30000 // 30 seconds
}

// ==================== UI LABELS ====================
// User-facing text strings (centralized for easy localization)

export const UI_LABELS = {
  filterPanel: {
    title: '🐟 Fish Schools',
    schoolSizeRange: 'School Size Range',
    fishSpecies: 'Fish Species'
  },
  tooltip: {
    id: 'ID',
    species: 'Species',
    schoolSize: 'School Size',
    unit: 'fish',
    notAvailable: 'N/A'
  }
}

// ==================== FORMATTING ====================
// Number formatting precision

export const FORMAT_PRECISION = {
  coordinates: 4,   // Decimal places for lat/lng display
  schoolSize: 0     // Decimal places for fish count (whole numbers)
}
