import type { SidebarProps } from "../types";
import { DrawingControls } from "./DrawingControls";
import { PolygonList } from "./PolygonList";
import { PolygonDetails } from "./PolygonDetails";

export function Sidebar({
  polygons,
  selectedPolygonId,
  isDrawing,
  isDirectSelectMode,
  validationError,
  onStartDrawing,
  onSelectPolygon,
  onEditPolygon,
  onDeletePolygon,
  onDeleteVertex,
  onClearError,
}: SidebarProps) {
  const selectedPolygon = polygons.find((p) => p.id === selectedPolygonId);

  return (
    <div className="sidebar">
      <h2>Polygon Tools</h2>

      {/* Validation Error */}
      {validationError && (
        <div className="error-banner">
          <span>{validationError}</span>
          <button onClick={onClearError}>&times;</button>
        </div>
      )}

      {/* Drawing Controls */}
      <DrawingControls
        polygons={polygons}
        isDrawing={isDrawing}
        onStartDrawing={onStartDrawing}
      />

      <hr className="divider" />

      {/* Polygon List */}
      <PolygonList
        polygons={polygons}
        selectedPolygonId={selectedPolygonId}
        onSelectPolygon={onSelectPolygon}
      />

      {/* Selected Polygon Details */}
      {selectedPolygon && (
        <>
          <hr className="divider" />
          <PolygonDetails
            polygon={selectedPolygon}
            isDirectSelectMode={isDirectSelectMode}
            onEdit={onEditPolygon}
            onDelete={onDeletePolygon}
            onDeleteVertex={onDeleteVertex}
          />
        </>
      )}
    </div>
  );
}
