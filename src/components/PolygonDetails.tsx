import type { PolygonData } from "../types";
import { getTypeLabel } from "../utils/polygonHelpers";
import { formatMeasurement } from "../utils/measurements";

interface PolygonDetailsProps {
  polygon: PolygonData;
  isDirectSelectMode: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteVertex: (polygonId: string, vertexIndex: number) => void;
}

export function PolygonDetails({
  polygon,
  isDirectSelectMode,
  onEdit,
  onDelete,
  onDeleteVertex,
}: PolygonDetailsProps) {
  return (
    <div className="polygon-details">
      <h3>{polygon.name}</h3>
      <p className="polygon-type-label">{getTypeLabel(polygon.type)}</p>

      <div className="measurements">
        <div className="measurement-item">
          <span className="label">Area:</span>
          <span className="value">{formatMeasurement(polygon.area, "m²")}</span>
        </div>
        <div className="measurement-item">
          <span className="label">Perimeter:</span>
          <span className="value">{formatMeasurement(polygon.perimeter, "m")}</span>
        </div>
        <div className="measurement-item">
          <span className="label">Width:</span>
          <span className="value">{formatMeasurement(polygon.width, "m")}</span>
        </div>
        <div className="measurement-item">
          <span className="label">Height:</span>
          <span className="value">{formatMeasurement(polygon.height, "m")}</span>
        </div>
        <div className="measurement-item">
          <span className="label">Vertices:</span>
          <span className="value">{polygon.vertices}</span>
        </div>
      </div>

      <div className="actions">
        <button
          className="action-btn edit-btn"
          onClick={() => onEdit(polygon.id)}
        >
          {isDirectSelectMode ? "Editing..." : "Edit Vertices"}
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(polygon.id)}
        >
          Delete Polygon
        </button>
      </div>

      {/* Vertex deletion UI - shown when in edit mode */}
      {isDirectSelectMode && (
        <div className="vertex-controls">
          <h4>Delete Vertices</h4>
          <p className="hint">Click a vertex button to delete it</p>
          <div className="vertex-list">
            {polygon.coordinates.slice(0, -1).map((coord, index) => (
              <button
                key={index}
                className="vertex-btn"
                onClick={() => onDeleteVertex(polygon.id, index)}
                disabled={polygon.vertices <= 3}
                title={`Vertex ${index + 1}: [${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}]`}
              >
                V{index + 1}
              </button>
            ))}
          </div>
          {polygon.vertices <= 3 && (
            <p className="warning">Minimum 3 vertices required</p>
          )}
        </div>
      )}
    </div>
  );
}
