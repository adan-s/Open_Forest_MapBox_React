import * as turf from "@turf/turf";
import type { PolygonData, PolygonType, ValidationResult } from "../types";

const TYPE_LABELS: Record<PolygonType, string> = {
  area: "Areas",
  mz: "Monitoring Zones",
  sp: "Sample Plots",
};

/**
 * Check if a polygon overlaps with any others of the same type
 */
export function checkOverlap(
  newCoords: number[][],
  type: PolygonType,
  existingPolygons: PolygonData[],
  excludeId?: string
): boolean {
  const newPolygon = turf.polygon([newCoords]);
  const sameTypePolygons = existingPolygons.filter(
    (p) => p.type === type && p.id !== excludeId
  );

  for (const existing of sameTypePolygons) {
    const existingPolygon = turf.polygon([existing.coordinates]);
    const intersection = turf.intersect(
      turf.featureCollection([newPolygon, existingPolygon])
    );
    if (intersection) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a polygon is completely within its parent boundary
 */
export function checkWithinParent(
  newCoords: number[][],
  parentId: string,
  existingPolygons: PolygonData[]
): boolean {
  const parent = existingPolygons.find((p) => p.id === parentId);
  if (!parent) return false;

  const newPolygon = turf.polygon([newCoords]);
  const parentPolygon = turf.polygon([parent.coordinates]);

  return turf.booleanContains(parentPolygon, newPolygon);
}

/**
 * Check if all children are still contained within the edited parent polygon
 */
export function checkChildrenStillContained(
  newParentCoords: number[][],
  parentId: string,
  existingPolygons: PolygonData[]
): { valid: boolean; childName?: string } {
  const newParentPolygon = turf.polygon([newParentCoords]);
  const children = existingPolygons.filter((p) => p.parentId === parentId);

  for (const child of children) {
    const childPolygon = turf.polygon([child.coordinates]);
    if (!turf.booleanContains(newParentPolygon, childPolygon)) {
      return { valid: false, childName: child.name };
    }
  }

  return { valid: true };
}

/**
 * Validate a new or edited polygon
 */
export function validatePolygon(
  coords: number[][],
  type: PolygonType,
  parentId: string | null,
  existingPolygons: PolygonData[],
  excludeId?: string
): ValidationResult {
  // Check overlap with same type
  if (checkOverlap(coords, type, existingPolygons, excludeId)) {
    return {
      valid: false,
      error: `${TYPE_LABELS[type]} cannot overlap with each other`,
    };
  }

  // Check containment for MZ (must be inside Area)
  if (type === "mz" && parentId) {
    if (!checkWithinParent(coords, parentId, existingPolygons)) {
      return {
        valid: false,
        error: "Monitoring Zone must be completely within the selected Area",
      };
    }
  }

  // Check containment for SP (must be inside MZ)
  if (type === "sp" && parentId) {
    if (!checkWithinParent(coords, parentId, existingPolygons)) {
      return {
        valid: false,
        error: "Sample Plot must be completely within the selected Monitoring Zone",
      };
    }
  }

  // When editing an Area, check that all its MZs are still contained
  if (type === "area" && excludeId) {
    const childrenCheck = checkChildrenStillContained(coords, excludeId, existingPolygons);
    if (!childrenCheck.valid) {
      return {
        valid: false,
        error: `Cannot resize Area: "${childrenCheck.childName}" would be outside the boundary`,
      };
    }
  }

  // When editing an MZ, check that all its SPs are still contained
  if (type === "mz" && excludeId) {
    const childrenCheck = checkChildrenStillContained(coords, excludeId, existingPolygons);
    if (!childrenCheck.valid) {
      return {
        valid: false,
        error: `Cannot resize Monitoring Zone: "${childrenCheck.childName}" would be outside the boundary`,
      };
    }
  }

  return { valid: true, error: null };
}
