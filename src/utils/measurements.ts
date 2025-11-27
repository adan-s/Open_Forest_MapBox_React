import * as turf from "@turf/turf";
import type { PolygonMeasurements } from "../types";

/**
 * Calculate measurements for a polygon from its coordinates
 */
export function calculateMeasurements(coordinates: number[][]): PolygonMeasurements {
  const polygon = turf.polygon([coordinates]);

  // Area in square meters
  const area = turf.area(polygon);

  // Perimeter in meters
  const perimeter = turf.length(turf.lineString(coordinates), {
    units: "meters",
  });

  // Bounding box for width and height
  const bbox = turf.bbox(polygon);
  const [minLng, minLat, maxLng, maxLat] = bbox;

  // Width (east-west distance at center latitude)
  const centerLat = (minLat + maxLat) / 2;
  const width = turf.distance(
    turf.point([minLng, centerLat]),
    turf.point([maxLng, centerLat]),
    { units: "meters" }
  );

  // Height (north-south distance at center longitude)
  const centerLng = (minLng + maxLng) / 2;
  const height = turf.distance(
    turf.point([centerLng, minLat]),
    turf.point([centerLng, maxLat]),
    { units: "meters" }
  );

  return {
    area,
    perimeter,
    width,
    height,
    vertices: coordinates.length - 1, // First and last are the same
  };
}

/**
 * Format measurement value with appropriate units
 */
export function formatMeasurement(value: number, unit: "m" | "m²"): string {
  if (unit === "m²") {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} km²`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(2)} ha`;
    }
    return `${value.toFixed(2)} m²`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} km`;
  }
  return `${value.toFixed(2)} m`;
}
