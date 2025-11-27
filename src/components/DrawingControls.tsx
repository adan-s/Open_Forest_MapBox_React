import type { PolygonType, PolygonData } from "../types";
import { getPolygonsByType } from "../utils/polygonHelpers";

interface DrawingControlsProps {
  polygons: PolygonData[];
  isDrawing: boolean;
  onStartDrawing: (type: PolygonType, parentId?: string | null) => void;
}

export function DrawingControls({
  polygons,
  isDrawing,
  onStartDrawing,
}: DrawingControlsProps) {
  const areas = getPolygonsByType(polygons, "area");
  const monitoringZones = getPolygonsByType(polygons, "mz");

  return (
    <div className="drawing-controls">
      <h3>Draw Polygons</h3>

      {/* Draw Area */}
      <div className="control-section">
        <button
          className="draw-btn draw-btn-area"
          onClick={() => onStartDrawing("area")}
          disabled={isDrawing}
        >
          Draw Area
        </button>
      </div>

      {/* Draw Monitoring Zone */}
      <div className="control-section">
        <label>Draw Monitoring Zone in:</label>
        <select
          className="parent-select"
          onChange={(e) => {
            if (e.target.value) {
              onStartDrawing("mz", e.target.value);
            }
          }}
          disabled={isDrawing || areas.length === 0}
          value=""
        >
          <option value="">Select Area...</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      {/* Draw Sample Plot */}
      <div className="control-section">
        <label>Draw Sample Plot in:</label>
        <select
          className="parent-select"
          onChange={(e) => {
            if (e.target.value) {
              onStartDrawing("sp", e.target.value);
            }
          }}
          disabled={isDrawing || monitoringZones.length === 0}
          value=""
        >
          <option value="">Select Monitoring Zone...</option>
          {monitoringZones.map((mz) => (
            <option key={mz.id} value={mz.id}>
              {mz.name}
            </option>
          ))}
        </select>
      </div>

      {isDrawing && (
        <p className="drawing-hint">
          Click on the map to draw. Double-click to finish.
        </p>
      )}
    </div>
  );
}
