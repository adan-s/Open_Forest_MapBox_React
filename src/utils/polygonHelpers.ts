import type { PolygonData, PolygonType } from "../types";

/**
 * Get type label for display
 */
export function getTypeLabel(type: PolygonType): string {
  const labels: Record<PolygonType, string> = {
    area: "Area",
    mz: "Monitoring Zone",
    sp: "Sample Plot",
  };
  return labels[type];
}

/**
 * Get color class for polygon type
 */
export function getTypeColorClass(type: PolygonType): string {
  const colors: Record<PolygonType, string> = {
    area: "bg-blue-500",
    mz: "bg-green-500",
    sp: "bg-amber-500",
  };
  return colors[type];
}

/**
 * Get border color class for polygon type
 */
export function getTypeBorderClass(type: PolygonType): string {
  const colors: Record<PolygonType, string> = {
    area: "border-blue-500",
    mz: "border-green-500",
    sp: "border-amber-500",
  };
  return colors[type];
}

/**
 * Get polygons filtered by type
 */
export function getPolygonsByType(
  polygons: PolygonData[],
  type: PolygonType
): PolygonData[] {
  return polygons.filter((p) => p.type === type);
}

/**
 * Get child polygons for a parent
 */
export function getChildPolygons(
  polygons: PolygonData[],
  parentId: string
): PolygonData[] {
  return polygons.filter((p) => p.parentId === parentId);
}

/**
 * Find all descendant IDs (children, grandchildren, etc.)
 */
export function findAllDescendantIds(
  polygons: PolygonData[],
  parentId: string
): string[] {
  const descendants: string[] = [];

  const findChildren = (id: string) => {
    const children = polygons.filter((p) => p.parentId === id);
    children.forEach((child) => {
      descendants.push(child.id);
      findChildren(child.id);
    });
  };

  findChildren(parentId);
  return descendants;
}

/**
 * Extract area number from polygon name (e.g., "PA2" returns 2, "PA1_MZ3" returns 1)
 */
export function extractAreaNumber(name: string): number {
  const match = name.match(/^PA(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extract MZ number from polygon name (e.g., "PA1_MZ3" returns 3)
 */
export function extractMZNumber(name: string): number {
  const match = name.match(/_MZ(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Generate name for new polygon following naming convention:
 * - Areas: PA1, PA2, PA3...
 * - MZs: PA{Y}_MZ{X} where Y = parent area number, X = MZ number within that area
 * - SPs: PA{Y}_MZ{X}_SP{W} where W = SP number within that MZ
 */
export function generatePolygonName(
  type: PolygonType,
  existingPolygons: PolygonData[],
  parentId?: string | null
): string {
  if (type === "area") {
    const existingAreas = existingPolygons.filter((p) => p.type === "area");
    return `PA${existingAreas.length + 1}`;
  }

  if (type === "mz" && parentId) {
    const parentArea = existingPolygons.find((p) => p.id === parentId);
    if (!parentArea) return "MZ1";

    const areaNumber = extractAreaNumber(parentArea.name);
    const existingMZsInArea = existingPolygons.filter(
      (p) => p.type === "mz" && p.parentId === parentId
    );
    return `PA${areaNumber}_MZ${existingMZsInArea.length + 1}`;
  }

  if (type === "sp" && parentId) {
    const parentMZ = existingPolygons.find((p) => p.id === parentId);
    if (!parentMZ) return "SP1";

    // Extract PA and MZ numbers from parent MZ name
    const areaNumber = extractAreaNumber(parentMZ.name);
    const mzNumber = extractMZNumber(parentMZ.name);
    const existingSPsInMZ = existingPolygons.filter(
      (p) => p.type === "sp" && p.parentId === parentId
    );
    return `PA${areaNumber}_MZ${mzNumber}_SP${existingSPsInMZ.length + 1}`;
  }

  // Fallback for orphan polygons
  const existingOfType = existingPolygons.filter((p) => p.type === type);
  return `${type.toUpperCase()}${existingOfType.length + 1}`;
}

/**
 * Renumber all polygons after deletion to eliminate gaps
 * Returns a new array with updated names
 */
export function renumberPolygons(polygons: PolygonData[]): PolygonData[] {
  const result = [...polygons];

  // First, renumber all Areas (PA1, PA2, PA3...)
  const areas = result.filter((p) => p.type === "area");
  areas.forEach((area, index) => {
    const oldAreaNumber = extractAreaNumber(area.name);
    const newAreaNumber = index + 1;

    if (oldAreaNumber !== newAreaNumber) {
      // Update area name
      area.name = `PA${newAreaNumber}`;

      // Update all MZs that belong to this area
      const mzsInArea = result.filter((p) => p.type === "mz" && p.parentId === area.id);
      mzsInArea.forEach((mz) => {
        const mzNumber = extractMZNumber(mz.name);
        mz.name = `PA${newAreaNumber}_MZ${mzNumber}`;

        // Update all SPs that belong to this MZ
        const spsInMZ = result.filter((p) => p.type === "sp" && p.parentId === mz.id);
        spsInMZ.forEach((sp) => {
          const spMatch = sp.name.match(/_SP(\d+)$/);
          const spNumber = spMatch ? parseInt(spMatch[1], 10) : 1;
          sp.name = `PA${newAreaNumber}_MZ${mzNumber}_SP${spNumber}`;
        });
      });
    }
  });

  // Then, renumber MZs within each Area
  areas.forEach((area) => {
    const areaNumber = extractAreaNumber(area.name);
    const mzsInArea = result.filter((p) => p.type === "mz" && p.parentId === area.id);

    mzsInArea.forEach((mz, index) => {
      const oldMZNumber = extractMZNumber(mz.name);
      const newMZNumber = index + 1;

      if (oldMZNumber !== newMZNumber) {
        mz.name = `PA${areaNumber}_MZ${newMZNumber}`;

        // Update all SPs that belong to this MZ
        const spsInMZ = result.filter((p) => p.type === "sp" && p.parentId === mz.id);
        spsInMZ.forEach((sp) => {
          const spMatch = sp.name.match(/_SP(\d+)$/);
          const spNumber = spMatch ? parseInt(spMatch[1], 10) : 1;
          sp.name = `PA${areaNumber}_MZ${newMZNumber}_SP${spNumber}`;
        });
      }
    });

    // Finally, renumber SPs within each MZ
    mzsInArea.forEach((mz) => {
      const areaNum = extractAreaNumber(mz.name);
      const mzNum = extractMZNumber(mz.name);
      const spsInMZ = result.filter((p) => p.type === "sp" && p.parentId === mz.id);

      spsInMZ.forEach((sp, index) => {
        sp.name = `PA${areaNum}_MZ${mzNum}_SP${index + 1}`;
      });
    });
  });

  return result;
}
