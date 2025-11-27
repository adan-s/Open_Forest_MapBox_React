import { useState, useCallback, useRef } from "react";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import type { PolygonData, PolygonType, DeleteConfirmState } from "./types";
import { MapContainer, Sidebar, DeleteConfirmDialog } from "./components";
import { calculateMeasurements } from "./utils/measurements";
import { validatePolygon } from "./utils/validation";
import { findAllDescendantIds, renumberPolygons } from "./utils/polygonHelpers";
import "./App.css";

function App() {
  const [polygons, setPolygons] = useState<PolygonData[]>([]);
  const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDirectSelectMode, setIsDirectSelectMode] = useState(false);
  const [drawingType, setDrawingType] = useState<PolygonType>("area");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    polygonId: null,
    polygonName: "",
    childrenNames: [],
  });

  const drawRef = useRef<MapboxDraw | null>(null);

  const handleMapReady = useCallback((_map: unknown, draw: MapboxDraw) => {
    drawRef.current = draw;
  }, []);

  const handleStartDrawing = useCallback(
    (type: PolygonType, parentId: string | null = null) => {
      if (!drawRef.current) return;

      setDrawingType(type);
      setSelectedParentId(parentId);
      setIsDrawing(true);
      setValidationError(null);
      drawRef.current.changeMode("draw_polygon");
    },
    []
  );

  const handleSelectPolygon = useCallback((id: string) => {
    if (!drawRef.current) return;

    setSelectedPolygonId(id);
    setIsDirectSelectMode(false);
    drawRef.current.changeMode("simple_select", { featureIds: [id] });
  }, []);

  const handleEditPolygon = useCallback((id: string) => {
    if (!drawRef.current) return;

    setSelectedPolygonId(id);
    setIsDirectSelectMode(true);
    drawRef.current.changeMode("direct_select", { featureId: id });
  }, []);

  const handleRequestDelete = useCallback(
    (id: string) => {
      const polygon = polygons.find((p) => p.id === id);
      if (!polygon) return;

      const descendantIds = findAllDescendantIds(polygons, id);
      const childrenNames = descendantIds
        .map((childId) => polygons.find((p) => p.id === childId)?.name)
        .filter((name): name is string => !!name);

      setDeleteConfirm({
        isOpen: true,
        polygonId: id,
        polygonName: polygon.name,
        childrenNames,
      });
    },
    [polygons]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!drawRef.current || !deleteConfirm.polygonId) return;

    const descendantIds = findAllDescendantIds(polygons, deleteConfirm.polygonId);
    const idsToDelete = [deleteConfirm.polygonId, ...descendantIds];

    idsToDelete.forEach((polygonId) => {
      drawRef.current?.delete(polygonId);
    });

    setPolygons((prev) => {
      const remaining = prev.filter((p) => !idsToDelete.includes(p.id));
      return renumberPolygons(remaining);
    });
    setSelectedPolygonId(null);
    setDeleteConfirm({
      isOpen: false,
      polygonId: null,
      polygonName: "",
      childrenNames: [],
    });
  }, [polygons, deleteConfirm.polygonId]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirm({
      isOpen: false,
      polygonId: null,
      polygonName: "",
      childrenNames: [],
    });
  }, []);

  const handleDeleteVertex = useCallback(
    (polygonId: string, vertexIndex: number) => {
      if (!drawRef.current) return;

      const feature = drawRef.current.get(polygonId);
      if (!feature || feature.geometry.type !== "Polygon") return;

      const coordinates = feature.geometry.coordinates[0] as number[][];
      if (coordinates.length <= 4) {
        setValidationError("Polygon must have at least 3 vertices");
        return;
      }

      const newCoords = [...coordinates];
      newCoords.splice(vertexIndex, 1);

      // If we removed the first vertex, update the closing point
      if (vertexIndex === 0) {
        newCoords[newCoords.length - 1] = newCoords[0];
      }

      // If we removed the last vertex (before closing point), update closing point
      if (vertexIndex === coordinates.length - 2) {
        newCoords[newCoords.length - 1] = newCoords[0];
      }

      // Validate the new shape
      const polygon = polygons.find((p) => p.id === polygonId);
      if (polygon) {
        const validation = validatePolygon(
          newCoords,
          polygon.type,
          polygon.parentId,
          polygons,
          polygonId
        );
        if (!validation.valid) {
          setValidationError(validation.error || "Invalid polygon");
          return;
        }
      }

      // Update the feature
      feature.geometry.coordinates[0] = newCoords;
      drawRef.current.add(feature);

      // Update polygon data
      const measurements = calculateMeasurements(newCoords);
      setPolygons((prev) =>
        prev.map((p) =>
          p.id === polygonId
            ? { ...p, ...measurements, coordinates: newCoords }
            : p
        )
      );
    },
    [polygons]
  );

  const handleClearError = useCallback(() => {
    setValidationError(null);
  }, []);

  return (
    <div className="app">
     <MapContainer
        polygons={polygons}
        setPolygons={setPolygons}
        selectedPolygonId={selectedPolygonId}
        setSelectedPolygonId={setSelectedPolygonId}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        drawingType={drawingType}
        selectedParentId={selectedParentId}
        setValidationError={setValidationError}
        isDirectSelectMode={isDirectSelectMode}
        setIsDirectSelectMode={setIsDirectSelectMode}
        onMapReady={handleMapReady}
      />
      <Sidebar
        polygons={polygons}
        selectedPolygonId={selectedPolygonId}
        isDrawing={isDrawing}
        isDirectSelectMode={isDirectSelectMode}
        validationError={validationError}
        onStartDrawing={handleStartDrawing}
        onSelectPolygon={handleSelectPolygon}
        onEditPolygon={handleEditPolygon}
        onDeletePolygon={handleRequestDelete}
        onDeleteVertex={handleDeleteVertex}
        onClearError={handleClearError}
      />
      {deleteConfirm.isOpen && (
        <DeleteConfirmDialog
          polygonName={deleteConfirm.polygonName}
          childrenNames={deleteConfirm.childrenNames}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default App;
