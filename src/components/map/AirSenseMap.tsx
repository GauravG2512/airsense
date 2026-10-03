'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MONITORED_STATIONS, getStationAirReading, getStationForecast, STATION_CLUSTERS, ANOMALIES_SAMPLE } from '@/lib/mock-data';
import { Station, AirReading, CPCB_AQI_CATEGORIES, getAqiCategory } from '@/lib/api';

interface AirSenseMapProps {
  activeLayer: 'AQI' | 'PM2.5' | 'PM10' | 'NO2' | 'SO2' | 'O3' | 'Clusters' | 'Anomalies';
  selectedStationId: string;
  onSelectStation: (stationId: string) => void;
  replayHour: number; // 0 to 24 for timeline replay
  surfaceMode: 'markers' | 'density';
}

export const AirSenseMap: React.FC<AirSenseMapProps> = ({
  activeLayer,
  selectedStationId,
  onSelectStation,
  replayHour,
  surfaceMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on central India (approx 21.0 N, 78.0 E)
    const map = L.map(mapContainerRef.current, {
      center: [21.5, 78.9],
      zoom: 5,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: true,
    });

    // High quality scientific cartographic base tiles (CartoDB Positron - light clean neutral)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when layer, station selection, replay hour, or surface mode changes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    const layerGroup = layerGroupRef.current;
    layerGroup.clearLayers();

    // Map stations
    MONITORED_STATIONS.forEach((station) => {
      const reading = getStationAirReading(station.station_id);

      // Replay simulation variation based on hour
      let aqiValue = reading.aqi;
      if (replayHour !== 19) {
        const hourDiff = Math.abs(replayHour - 14);
        aqiValue = Math.max(30, Math.min(480, Math.round(reading.aqi * (0.7 + (hourDiff / 24) * 0.6))));
      }

      const category = getAqiCategory(aqiValue);
      const catConfig = CPCB_AQI_CATEGORIES[category];

      let fillColor = catConfig.color;
      let radius = 8;
      let tooltipContent = `<strong>${station.station_name}</strong><br/>Observed AQI: ${aqiValue} (${category})`;

      if (activeLayer === 'PM2.5') {
        const pVal = reading.pollutants[0].value;
        fillColor = pVal > 60 ? '#ea580c' : '#16a34a';
        tooltipContent = `<strong>${station.station_name}</strong><br/>PM2.5: ${pVal} µg/m³`;
      } else if (activeLayer === 'PM10') {
        const pVal = reading.pollutants[1].value;
        fillColor = pVal > 100 ? '#ea580c' : '#16a34a';
        tooltipContent = `<strong>${station.station_name}</strong><br/>PM10: ${pVal} µg/m³`;
      } else if (activeLayer === 'NO2') {
        const pVal = reading.pollutants[2].value;
        fillColor = pVal > 80 ? '#dc2626' : '#65a30d';
        tooltipContent = `<strong>${station.station_name}</strong><br/>NO2: ${pVal} µg/m³`;
      } else if (activeLayer === 'Clusters') {
        // Deterministic cluster assignment
        const clusterId = (parseInt(station.station_id.replace(/\D/g, ''), 10) % 4) + 1;
        const colors = ['#0284c7', '#d97706', '#7c3aed', '#059669'];
        fillColor = colors[clusterId - 1] || '#0284c7';
        tooltipContent = `<strong>${station.station_name}</strong><br/>Cluster 0${clusterId}: ${STATION_CLUSTERS[clusterId - 1]?.cluster_name}`;
      } else if (activeLayer === 'Anomalies') {
        const anomaly = ANOMALIES_SAMPLE.find((a) => a.station_id === station.station_id);
        if (anomaly) {
          fillColor = '#dc2626';
          radius = 12;
          tooltipContent = `<strong>ANOMALY DETECTED</strong><br/>${station.station_name}<br/>${anomaly.pollutant} observed ${anomaly.observed_value} (+${anomaly.deviation_pct}%)<br/>Method: ${anomaly.detection_method}`;
        } else {
          fillColor = '#94a3b8';
          radius = 5;
          tooltipContent = `<strong>${station.station_name}</strong><br/>No statistical anomaly flagged.`;
        }
      }

      const isSelected = station.station_id === selectedStationId;

      if (surfaceMode === 'density') {
        // Station-based interpolated footprint representation
        const outerCircle = L.circle([station.latitude, station.longitude], {
          radius: 45000, // 45km atmospheric influence radius
          color: fillColor,
          weight: 0,
          fillColor: fillColor,
          fillOpacity: 0.18,
          interactive: false,
        });
        layerGroup.addLayer(outerCircle);
      }

      const marker = L.circleMarker([station.latitude, station.longitude], {
        radius: isSelected ? radius + 4 : radius,
        fillColor: fillColor,
        color: isSelected ? '#0f172a' : '#ffffff',
        weight: isSelected ? 3 : 1.5,
        opacity: 1,
        fillOpacity: 0.9,
      });

      marker.bindTooltip(tooltipContent, {
        direction: 'top',
        className: 'font-mono text-xs rounded border border-slate-300 shadow-sm bg-white p-2',
      });

      marker.on('click', () => {
        onSelectStation(station.station_id);
      });

      layerGroup.addLayer(marker);
    });
  }, [activeLayer, selectedStationId, replayHour, surfaceMode, onSelectStation]);

  // Center on selected station if it changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const stn = MONITORED_STATIONS.find((s) => s.station_id === selectedStationId);
    if (stn) {
      mapInstanceRef.current.panTo([stn.latitude, stn.longitude], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedStationId]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[550px] rounded" />;
};
