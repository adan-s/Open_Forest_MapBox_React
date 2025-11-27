# Open Forest MapBox

A React-based interactive mapping application for drawing and managing hierarchical polygon structures using Mapbox GL JS. Designed for forest management and monitoring purposes.

## Features

### Hierarchical Polygon Structure

The application supports a three-level hierarchy of polygons:

1. **Project Areas (PA)** - Top-level boundary polygons
2. **Monitoring Zones (MZ)** - Must be completely contained within a Project Area
3. **Sample Plots (SP)** - Must be completely contained within a Monitoring Zone

### Naming Convention

Polygons follow a structured naming convention:

- **Areas**: `PA1`, `PA2`, `PA3`, ...
- **Monitoring Zones**: `PA{Y}_MZ{X}` where:
  - `Y` = Parent area number
  - `X` = MZ number within that area
  - Example: `PA1_MZ1`, `PA1_MZ2`, `PA2_MZ1`
- **Sample Plots**: `PA{Y}_MZ{X}_SP{W}` where:
  - `Y` = Area number
  - `X` = MZ number
  - `W` = SP number within that MZ
  - Example: `PA1_MZ1_SP1`, `PA1_MZ2_SP3`

When polygons are deleted, remaining polygons are automatically renumbered to eliminate gaps.

### Validation Rules

The application enforces strict validation rules:

- **No Overlapping**: Polygons of the same type cannot overlap with each other
- **Containment**:
  - Monitoring Zones must be completely inside their parent Area
  - Sample Plots must be completely inside their parent Monitoring Zone
- **Edit Protection**: When editing a parent polygon, the system ensures all children remain within the boundary

### Map Controls

- **Geosearch**: Search for any location using the search bar (top-left)
- **Navigation Controls**: Zoom in/out buttons (bottom-right)
- **Geolocation**: "My Location" button to center map on your current position (bottom-right)

### Polygon Management

- **Drawing**: Click to add vertices, double-click to complete the polygon
- **Selection**: Click on any polygon in the list or on the map to select it
- **Editing**: Enter edit mode to drag vertices and reshape polygons
- **Vertex Deletion**: Remove individual vertices while editing (minimum 3 vertices required)
- **Deletion**: Delete polygons along with all their children

### Measurements

Each polygon displays:
- Area (in square meters/hectares)
- Perimeter (in meters)
- Width and Height (bounding box dimensions)
- Number of vertices

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Mapbox GL JS** - Interactive maps
- **Mapbox GL Draw** - Polygon drawing and editing
- **Mapbox GL Geocoder** - Location search
- **Turf.js** - Geospatial calculations and validation

## Getting Started

### Prerequisites

- Node.js 18+
- A Mapbox access token (get one at [mapbox.com](https://www.mapbox.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Open_Forest_MapBox_React
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── MapContainer.tsx    # Main map component with Mapbox integration
│   ├── Sidebar.tsx         # Side panel containing all controls
│   ├── DrawingControls.tsx # Buttons for creating new polygons
│   ├── PolygonList.tsx     # Hierarchical list of all polygons
│   ├── PolygonDetails.tsx  # Selected polygon info and actions
│   └── index.ts            # Component exports
├── utils/
│   ├── measurements.ts     # Area, perimeter calculations using Turf.js
│   ├── validation.ts       # Overlap and containment validation
│   └── polygonHelpers.ts   # Naming, filtering, and utility functions
├── types/
│   └── index.ts            # TypeScript type definitions
├── App.tsx                 # Main application component
├── App.css                 # Application styles
└── main.tsx                # Application entry point
```

## Usage Guide

### Creating Polygons

1. **Create an Area**: Click "Draw Area" button, then click on the map to place vertices. Double-click to complete.

2. **Create a Monitoring Zone**: Select an existing Area, then click "Draw MZ in [Area Name]". The MZ must be drawn completely within the selected Area.

3. **Create a Sample Plot**: Select an existing Monitoring Zone, then click "Draw SP in [MZ Name]". The SP must be drawn completely within the selected MZ.

### Editing Polygons

1. Select a polygon from the list or by clicking on it on the map
2. Click "Edit Vertices" to enter edit mode
3. Drag vertices to reshape the polygon
4. Click on a vertex and use "Delete Vertex" to remove it (if more than 3 vertices)
5. The system will prevent changes that would violate containment rules

### Deleting Polygons

1. Select the polygon you want to delete
2. Click "Delete" button
3. **Warning**: Deleting a parent polygon will also delete all its children
4. Remaining polygons will be automatically renumbered

## License

MIT
