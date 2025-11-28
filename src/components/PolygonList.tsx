import type { PolygonType, PolygonListProps, PolygonTreeItemProps } from "../types";
import {
  getPolygonsByType,
  getTypeLabel,
  getChildPolygons,
} from "../utils/polygonHelpers";

export function PolygonList({
  polygons,
  selectedPolygonId,
  onSelectPolygon,
}: PolygonListProps) {
  const areas = getPolygonsByType(polygons, "area");

  if (polygons.length === 0) {
    return (
      <div className="polygon-list">
        <h3>Polygons</h3>
        <p className="empty-message">No polygons drawn yet.</p>
      </div>
    );
  }

  return (
    <div className="polygon-list">
      <h3>Polygons</h3>

      {/* Show hierarchical structure */}
      {areas.map((area) => (
        <PolygonTreeItem
          key={area.id}
          polygon={area}
          polygons={polygons}
          selectedPolygonId={selectedPolygonId}
          onSelectPolygon={onSelectPolygon}
          level={0}
        />
      ))}

      {/* Show orphan MZs (shouldn't happen but just in case) */}
      {getPolygonsByType(polygons, "mz")
        .filter((mz) => !mz.parentId)
        .map((mz) => (
          <PolygonTreeItem
            key={mz.id}
            polygon={mz}
            polygons={polygons}
            selectedPolygonId={selectedPolygonId}
            onSelectPolygon={onSelectPolygon}
            level={0}
          />
        ))}

      {/* Show orphan SPs */}
      {getPolygonsByType(polygons, "sp")
        .filter((sp) => !sp.parentId)
        .map((sp) => (
          <PolygonTreeItem
            key={sp.id}
            polygon={sp}
            polygons={polygons}
            selectedPolygonId={selectedPolygonId}
            onSelectPolygon={onSelectPolygon}
            level={0}
          />
        ))}
    </div>
  );
}

function PolygonTreeItem({
  polygon,
  polygons,
  selectedPolygonId,
  onSelectPolygon,
  level,
}: PolygonTreeItemProps) {
  const children = getChildPolygons(polygons, polygon.id);
  const isSelected = selectedPolygonId === polygon.id;

  const typeColors: Record<PolygonType, string> = {
    area: "#3b82f6",
    mz: "#22c55e",
    sp: "#facc15",
  };

  return (
    <div className="tree-item" style={{ marginLeft: level * 16 }}>
      <button
        className={`polygon-item ${isSelected ? "selected" : ""}`}
        onClick={() => onSelectPolygon(polygon.id)}
      >
        <span
          className="type-indicator"
          style={{ backgroundColor: typeColors[polygon.type] }}
        />
        <span className="polygon-name">{polygon.name}</span>
        <span className="polygon-type">{getTypeLabel(polygon.type)}</span>
      </button>

      {children.map((child) => (
        <PolygonTreeItem
          key={child.id}
          polygon={child}
          polygons={polygons}
          selectedPolygonId={selectedPolygonId}
          onSelectPolygon={onSelectPolygon}
          level={level + 1}
        />
      ))}
    </div>
  );
}
