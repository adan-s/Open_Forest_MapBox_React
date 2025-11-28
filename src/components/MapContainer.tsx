import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import type { PolygonData, PolygonType, MapContainerProps } from "../types";
import { calculateMeasurements } from "../utils/measurements";
import { validatePolygon } from "../utils/validation";
import { generatePolygonName } from "../utils/polygonHelpers";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

export function MapContainer({
  polygons,
  setPolygons,
  setSelectedPolygonId,
  setIsDrawing,
  drawingType,
  selectedParentId,
  setValidationError,
  setIsDirectSelectMode,
  onMapReady,
}: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  // Refs for event handlers
  const drawingTypeRef = useRef<PolygonType>(drawingType);
  const selectedParentIdRef = useRef<string | null>(selectedParentId);
  const polygonsRef = useRef<PolygonData[]>(polygons);

  // Keep refs in sync
  useEffect(() => {
    drawingTypeRef.current = drawingType;
  }, [drawingType]);

  useEffect(() => {
    selectedParentIdRef.current = selectedParentId;
  }, [selectedParentId]);

  useEffect(() => {
    polygonsRef.current = polygons;
  }, [polygons]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-122.4194, 37.7749],
      zoom: 12,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: false,
        trash: false,
      },

      userProperties: true,
      styles: getDrawStyles(),
    });

    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl as unknown,
      marker: true,
      placeholder: "Search for a location...",
      zoom: 15,
      types:
        "country,region,postcode,district,place,locality,neighborhood,address,poi,poi.landmark",
    });

    map.addControl(geocoder, "top-left");
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "bottom-right"
    );
    map.addControl(draw);

    // Handle draw.create
    map.on("draw.create", (e: { features: GeoJSON.Feature[] }) => {
      const feature = e.features[0];
      if (!feature || feature.geometry.type !== "Polygon") return;

      const coordinates = feature.geometry.coordinates[0] as number[][];
      const currentType = drawingTypeRef.current;
      const currentParentId = selectedParentIdRef.current;
      const currentPolygons = polygonsRef.current;

      // Check for duplicate
      if (currentPolygons.some((p) => p.id === feature.id)) {
        return;
      }

      // Validate polygon
      const validation = validatePolygon(
        coordinates,
        currentType,
        currentParentId,
        currentPolygons
      );

      if (!validation.valid) {
        setValidationError(validation.error || "Invalid polygon");
        draw.delete(feature.id as string);
        setIsDrawing(false);
        return;
      }

      // Calculate measurements
      const measurements = calculateMeasurements(coordinates);
      const name = generatePolygonName(currentType, currentPolygons, currentParentId);

      // Set polygonType property for color styling
      const featureId = feature.id as string;
      const currentFeature = draw.get(featureId);
      if (currentFeature) {
        const featureWithProperty: GeoJSON.Feature<GeoJSON.Polygon> = {
          ...currentFeature,
          id: featureId,
          geometry: currentFeature.geometry as GeoJSON.Polygon,
          properties: {
            ...(currentFeature.properties || {}),
            polygonType: currentType,
          },
        };
        draw.delete(featureId);
        const [addedFeatureId] = draw.add(featureWithProperty);
        feature.id = addedFeatureId;
      }

      const newPolygon: PolygonData = {
        id: feature.id as string,
        type: currentType,
        name,
        parentId: currentParentId,
        ...measurements,
        coordinates,
      };

      setPolygons((prev) => [...prev, newPolygon]);
      setIsDrawing(false);
      setSelectedPolygonId(feature.id as string);
    });

    // Handle draw.update
    map.on("draw.update", (e: { features: GeoJSON.Feature[] }) => {
      const feature = e.features[0];
      if (!feature || feature.geometry.type !== "Polygon") return;

      const coordinates = feature.geometry.coordinates[0] as number[][];
      const currentPolygons = polygonsRef.current;
      const polygon = currentPolygons.find((p) => p.id === feature.id);

      if (!polygon) return;

      // Validate updated polygon
      const validation = validatePolygon(
        coordinates,
        polygon.type,
        polygon.parentId,
        currentPolygons,
        polygon.id
      );

      if (!validation.valid) {
        setValidationError(validation.error || "Invalid polygon");
        // Revert to original coordinates
        const originalFeature = draw.get(polygon.id);
        if (originalFeature) {
          originalFeature.geometry = {
            type: "Polygon",
            coordinates: [polygon.coordinates],
          };
          draw.add(originalFeature);
        }
        return;
      }

      // Update measurements
      const measurements = calculateMeasurements(coordinates);
      setPolygons((prev) =>
        prev.map((p) =>
          p.id === feature.id ? { ...p, ...measurements, coordinates } : p
        )
      );

      // Preserve polygonType property for styling
      const featureToUpdate = draw.get(polygon.id);
      if (featureToUpdate) {
        featureToUpdate.properties = {
          ...featureToUpdate.properties,
          polygonType: polygon.type,
        };
        draw.delete(polygon.id);
        draw.add(featureToUpdate);
      }
    });

    // Handle selection change
    map.on("draw.selectionchange", (e: { features: GeoJSON.Feature[] }) => {
      if (e.features.length > 0) {
        setSelectedPolygonId(e.features[0].id as string);
      } else {
        setSelectedPolygonId(null);
        setIsDirectSelectMode(false);
      }
    });

    // Handle mode change
    map.on("draw.modechange", (e: { mode: string }) => {
      if (e.mode === "simple_select") {
        setIsDrawing(false);
        setIsDirectSelectMode(false);
      } else if (e.mode === "direct_select") {
        setIsDirectSelectMode(true);
      }
    });

    map.on("load", () => {
      mapRef.current = map;
      drawRef.current = draw;
      onMapReady(map, draw);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Sync polygonType property for existing features
  useEffect(() => {
    if (!drawRef.current || !mapRef.current) return;

    const draw = drawRef.current;
    polygons.forEach((polygon) => {
      const feature = draw.get(polygon.id);
      if (feature && feature.properties?.polygonType !== polygon.type) {
        feature.properties = {
          ...feature.properties,
          polygonType: polygon.type,
        };
        draw.delete(polygon.id);
        draw.add(feature);
      }
    });
  }, [polygons]);

  return (
    <div ref={mapContainerRef} className="map-container" />
  );
}

function getDrawStyles() {
  const colorExpr = [
    "case",
    ["==", ["get", "user_polygonType"], "area"], "#3b82f6",
    ["==", ["get", "user_polygonType"], "mz"], "#22c55e",
    ["==", ["get", "user_polygonType"], "sp"], "#facc15",
    "#3b82f6"
  ];

  return [
    // Polygon fill - inactive
    {
      id: "gl-draw-polygon-fill-inactive",
      type: "fill",
      filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
      paint: {
        "fill-color": colorExpr,
        "fill-opacity": 0.3,
      },
    },
    // Polygon stroke - inactive
    {
      id: "gl-draw-polygon-stroke-inactive",
      type: "line",
      filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
      paint: {
        "line-color": colorExpr,
        "line-width": 2,
      },
    },
    // Polygon fill - active
    {
      id: "gl-draw-polygon-fill-active",
      type: "fill",
      filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
      paint: {
        "fill-color": colorExpr,
        "fill-opacity": 0.4,
      },
    },
    // Polygon stroke - active
    {
      id: "gl-draw-polygon-stroke-active",
      type: "line",
      filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
      paint: {
        "line-color": colorExpr,
        "line-width": 3,
      },
    },
    // Vertex points
    {
      id: "gl-draw-point",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
      paint: {
        "circle-radius": 6,
        "circle-color": "#fff",
        "circle-stroke-color": "#3b82f6",
        "circle-stroke-width": 2,
      },
    },
    // Midpoints
    {
      id: "gl-draw-point-mid",
      type: "circle",
      filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
      paint: {
        "circle-radius": 4,
        "circle-color": "#3b82f6",
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 1,
      },
    },
    // Lines (while drawing)
    {
      id: "gl-draw-line-active",
      type: "line",
      filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
      paint: {
        "line-color": "#3b82f6",
        "line-width": 2,
        "line-dasharray": [2, 2],
      },
    },
    {
      id: "gl-draw-line-inactive",
      type: "line",
      filter: ["all", ["==", "$type", "LineString"], ["==", "active", "false"]],
      paint: {
        "line-color": "#3b82f6",
        "line-width": 2,
      },
    },
  ];
}
