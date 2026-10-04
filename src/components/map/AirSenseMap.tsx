'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CPCB_AQI_CATEGORIES, getAqiCategory } from '@/lib/api';
import type { MapStation } from '@/lib/map-data';

interface AirSenseMapProps {
  activeLayer: 'AQI' | 'Clusters';
  selectedStationId: string;
  stations: MapStation[];
  onSelectStation: (stationId: string) => void;
  surfaceMode: 'markers' | 'density';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

export const AirSenseMap: React.FC<AirSenseMapProps> = ({
  activeLayer,
  selectedStationId,
  stations,
  onSelectStation,
  surfaceMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.5, 78.9],
      zoom: 5,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: true,
    });
    const cartoApiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY;
    const cartoKeyParam = cartoApiKey
      ? `?key=${encodeURIComponent(cartoApiKey)}`
      : '';

    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png${cartoKeyParam}`,
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;
    layerGroup.clearLayers();

    stations.forEach((station) => {
      if (!Number.isFinite(station.latitude) || !Number.isFinite(station.longitude)) return;
      const aqi = typeof station.aqi_estimate === 'number' ? station.aqi_estimate : 0;
      const category = getAqiCategory(aqi);
      const cluster = station.kmeans_cluster;
      const clusterColors = ['#0284c7', '#d97706', '#7c3aed', '#059669'];
      const color = activeLayer === 'Clusters' && cluster !== null
        ? cluster < 0
          ? '#64748b'
          : clusterColors[cluster % clusterColors.length]
        : CPCB_AQI_CATEGORIES[category].color;
      const selected = station.station_id === selectedStationId;

      if (surfaceMode === 'density') {
        layerGroup.addLayer(
          L.circle([station.latitude, station.longitude], {
            radius: 45000,
            color,
            weight: 0,
            fillColor: color,
            fillOpacity: 0.16,
            interactive: false,
          })
        );
      }

      const marker = L.circleMarker([station.latitude, station.longitude], {
        radius: selected ? 11 : 7,
        fillColor: color,
        color: selected ? '#0f172a' : '#ffffff',
        weight: selected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: 0.9,
      });

      const clusterLabel = cluster === null ? 'Unavailable' : String(cluster);
      const tooltip = [
        `<strong>${escapeHtml(station.station_name)}</strong>`,
        `${escapeHtml(station.city_name)}, ${escapeHtml(station.state_name)}`,
        `AQI: ${Number.isFinite(aqi) ? Math.round(aqi) : 'Unavailable'} (${escapeHtml(category)})`,
        activeLayer === 'Clusters' ? `K-means cluster: ${escapeHtml(clusterLabel)}` : '',
      ].filter(Boolean).join('<br/>');

      marker.bindTooltip(tooltip, {
        direction: 'top',
        className: 'font-mono text-xs rounded border border-slate-300 shadow-sm bg-white p-2',
      });
      marker.on('click', () => onSelectStation(station.station_id));
      layerGroup.addLayer(marker);
    });
  }, [activeLayer, onSelectStation, selectedStationId, stations, surfaceMode]);

  useEffect(() => {
    const selected = stations.find((station) => station.station_id === selectedStationId);
    if (!selected || !mapInstanceRef.current) return;

    mapInstanceRef.current.panTo([selected.latitude, selected.longitude], {
      animate: true,
      duration: 0.6,
    });
  }, [selectedStationId, stations]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[550px] rounded" />;
};
