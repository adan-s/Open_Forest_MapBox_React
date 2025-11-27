declare module "@mapbox/mapbox-gl-geocoder" {
  import { IControl, Map } from "mapbox-gl";

  interface GeocoderOptions {
    accessToken: string;
    mapboxgl?: unknown;
    marker?: boolean;
    placeholder?: string;
    zoom?: number;
    flyTo?: boolean | object;
    proximity?: { longitude: number; latitude: number };
    trackProximity?: boolean;
    collapsed?: boolean;
    clearAndBlurOnEsc?: boolean;
    clearOnBlur?: boolean;
    bbox?: [number, number, number, number];
    countries?: string;
    types?: string;
    minLength?: number;
    limit?: number;
    language?: string;
    filter?: (feature: object) => boolean;
    localGeocoder?: (query: string) => object[];
    reverseGeocode?: boolean;
    enableEventLogging?: boolean;
  }

  export default class MapboxGeocoder implements IControl {
    constructor(options: GeocoderOptions);
    onAdd(map: Map): HTMLElement;
    onRemove(): void;
    query(query: string): this;
    setInput(value: string): this;
    setProximity(proximity: { longitude: number; latitude: number }): this;
    getProximity(): { longitude: number; latitude: number };
    setLanguage(language: string): this;
    getLanguage(): string;
    setZoom(zoom: number): this;
    getZoom(): number;
    setPlaceholder(placeholder: string): this;
    getPlaceholder(): string;
    clear(): void;
  }
}
