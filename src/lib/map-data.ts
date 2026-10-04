export interface MapStation {
  station_id: string;
  station_name: string;
  city_name: string;
  state_name: string;
  latitude: number;
  longitude: number;
  aqi_estimate: number | null;
  aqi_category: string | null;
  dominant_pollutant: string | null;
  kmeans_cluster: number | null;
  hierarchical_cluster: number | null;
  dbscan_cluster: number | null;
}
