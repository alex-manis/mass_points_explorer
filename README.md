# Mass Points Explorer

## Overview

This is a Vue 3 single-page application that renders up to 250,000 geographic points using Mapbox and deck.gl. It supports real-time numeric and categorical filtering with GPU-accelerated updates and stable data references.

## Requirements

- Node.js >= 18

## Setup

```bash
npm install
```

## Environment Variables

This project requires a Mapbox access token.

Create a `.env` file in the project root based on `.env.example`:

```bash
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

A Mapbox access token is provided as part of this exercise by the hiring team.

**Important:** The token is not committed to version control.

## Run

```bash
npm run dev
```

The application will open at `http://localhost:5173`.

## Tests

```bash
npm run test
```

For watch mode:

```bash
npm run test:watch
```

## Architecture Notes

Tests rely on these exported accessors to verify data and layer stability via instrumentation.

### Data Access

The full dataset is loaded once during initialization and stored as a stable reference in the `points` variable inside the `useDataLoader` composable (`src/composables/useDataLoader.js`, line 18).

- Data is never replaced or recreated after initial assignment (line 30).
- Tests and evaluators can access the data reference via the `getPoints()` method exported by `useDataLoader`.

### Layer Access

deck.gl layers are created in `createCategoryLayers` (`src/lib/mapLayers.js`) and stored in the `layers` variable inside the `useLayerManager` composable (`src/composables/useLayerManager.js`, line 11).

- Layers reference the same stable data array.
- Layer updates use `layer.clone()` for performance, avoiding instance recreation.
- Tests can access the layers array via the `getLayers()` method exported by `useLayerManager`.

### Performance Constraints

Filter updates maintain stable data and layer references to avoid expensive GPU buffer reallocations. All filtering is GPU-accelerated using deck.gl's `DataFilterExtension`.

## Documentation

For detailed architectural decisions and trade-offs, see:

- `DESIGN.md` – Architecture, rendering model, and performance validation
- `NOTES.md` – Development notes and learning journey
