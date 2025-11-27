// Polygon types for hierarchical structure
export type PolygonType = "area" | "mz" | "sp";

export interface PolygonData {
  id: string;
  type: PolygonType;
  name: string;
  parentId: string | null;
  area: number;
  perimeter: number;
  width: number;
  height: number;
  vertices: number;
  coordinates: number[][];
}

export interface PolygonMeasurements {
  area: number;
  perimeter: number;
  width: number;
  height: number;
  vertices: number;
}

// Map context types - using 'any' to avoid importing mapbox types here
export interface MapContextType {
  map: unknown;
  draw: unknown;
  isMapReady: boolean;
}

// Polygon context types
export interface PolygonContextType {
  polygons: PolygonData[];
  selectedPolygonId: string | null;
  isDrawing: boolean;
  isDirectSelectMode: boolean;
  drawingType: PolygonType;
  selectedParentId: string | null;
  validationError: string | null;

  // Actions
  startDrawing: (type: PolygonType, parentId?: string | null) => void;
  deletePolygon: (id: string) => void;
  selectPolygon: (id: string) => void;
  editPolygon: (id: string) => void;
  deleteVertex: (polygonId: string, vertexIndex: number) => void;
  clearError: () => void;
}
