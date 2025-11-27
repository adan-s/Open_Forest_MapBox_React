import type { PolygonData, PolygonType } from "./index";
import type mapboxgl from "mapbox-gl";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";

// DeleteConfirmDialog types
export interface DeleteConfirmDialogProps {
  polygonName: string;
  childrenNames: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export interface DeleteConfirmState {
  isOpen: boolean;
  polygonId: string | null;
  polygonName: string;
  childrenNames: string[];
}

// PolygonList types
export interface PolygonListProps {
  polygons: PolygonData[];
  selectedPolygonId: string | null;
  onSelectPolygon: (id: string) => void;
}

export interface PolygonTreeItemProps {
  polygon: PolygonData;
  polygons: PolygonData[];
  selectedPolygonId: string | null;
  onSelectPolygon: (id: string) => void;
  level: number;
}

// MapContainer types
export interface MapContainerProps {
  polygons: PolygonData[];
  setPolygons: React.Dispatch<React.SetStateAction<PolygonData[]>>;
  selectedPolygonId: string | null;
  setSelectedPolygonId: (id: string | null) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  drawingType: PolygonType;
  selectedParentId: string | null;
  setValidationError: (error: string | null) => void;
  isDirectSelectMode: boolean;
  setIsDirectSelectMode: (mode: boolean) => void;
  onMapReady: (map: mapboxgl.Map, draw: MapboxDraw) => void;
}

// Sidebar types
export interface SidebarProps {
  polygons: PolygonData[];
  selectedPolygonId: string | null;
  isDrawing: boolean;
  isDirectSelectMode: boolean;
  validationError: string | null;
  onStartDrawing: (type: PolygonType, parentId?: string | null) => void;
  onSelectPolygon: (id: string) => void;
  onEditPolygon: (id: string) => void;
  onDeletePolygon: (id: string) => void;
  onDeleteVertex: (polygonId: string, vertexIndex: number) => void;
  onClearError: () => void;
}

// DrawingControls types
export interface DrawingControlsProps {
  polygons: PolygonData[];
  isDrawing: boolean;
  onStartDrawing: (type: PolygonType, parentId?: string | null) => void;
}

// PolygonDetails types
export interface PolygonDetailsProps {
  polygon: PolygonData;
  isDirectSelectMode: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteVertex: (polygonId: string, vertexIndex: number) => void;
}
