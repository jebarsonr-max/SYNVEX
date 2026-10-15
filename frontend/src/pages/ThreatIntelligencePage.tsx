import React, { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { ThreatIncident, ThreatGeoSummary, ThreatSummary } from '../types';
import { Globe2, ShieldAlert, Filter, AlertTriangle, Info, MapPin, Database } from 'lucide-react';
import L from 'leaflet';

const STATE_LAT_LNG: Record<string, [number, number]> = {
  'MH': [19.7515, 75.7139],
  'DL': [28.6139, 77.2090],
  'KA': [15.3173, 75.7139],
  'TN': [11.1271, 78.6569],
  'UP': [26.8467, 80.9462],
  'GJ': [22.2587, 71.1924]
};

export const ThreatIntelligencePage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [summary, setSummary] = useState<ThreatSummary | null>(null);
  const [geoSummaries, setGeoSummaries] = useState<ThreatGeoSummary[]>([]);
  const [incidents, setIncidents] = useState<ThreatIncident[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629], // Center of India
      zoom: 5,
      minZoom: 4,
      maxZoom: 9,
      attributionControl: false
    });

    // Dark-themed OpenStreetMap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch threat data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumData, geoData, incData, catData] = await Promise.all([
        api.threats.getSummary(),
        api.threats.getGeoSummary(selectedCategory),
        api.threats.getIncidents(selectedCategory),
        api.threats.getCategories()
      ]);
      setSummary(sumData);
      setGeoSummaries(geoData);
      setIncidents(incData);
      setCategories(['All Categories', ...catData]);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  // Update map markers when geoSummaries change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    geoSummaries.forEach(geo => {
      const coords = STATE_LAT_LNG[geo.state_code];
      if (!coords) return;

      const markerColor = '#D4AF62';
      const radius = Math.min(28, Math.max(14, Math.sqrt(geo.total_incidents) * 2.5));

      const circle = L.circleMarker(coords, {
        radius: radius,
        fillColor: markerColor,
        color: '#F4D995',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.55
      });

      circle.bindPopup(`
        <div style="font-family:sans-serif; color:#070707; padding:4px;">
          <h4 style="margin:0; font-weight:bold; font-size:14px;">${geo.state_name} (${geo.state_code})</h4>
          <p style="margin:4px 0 0 0; font-size:12px;"><strong>Total Incidents:</strong> ${geo.total_incidents}</p>
          <p style="margin:2px 0 0 0; font-size:11px; color:#555;">Primary: ${geo.primary_category}</p>
          <p style="margin:4px 0 0 0; font-size:9px; color:#c0392b; font-weight:bold;">DEMO INTELLIGENCE DATA</p>
        </div>
      `);

      markersGroupRef.current?.addLayer(circle);
    });
  }, [geoSummaries]);

  return (
    <div className="space-y-6">
      {/* Title & Provenance Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">
            India Cyber-Hotspot Threat Intelligence
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Geospatial tracking of digital arrest, extortion vectors, and deepfake-enabled frauds across states.
          </p>
        </div>

        {/* Mandatory Provenance Banner */}
        <div className="p-3 rounded-lg bg-surface-card border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2 max-w-md">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <span className="font-semibold tracking-wide">
            DEMO DATA — NOT LIVE CYBERCRIME INTELLIGENCE
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-card border border-gold-border/60">
          <span className="text-xs text-text-muted uppercase font-mono">Aggregated Incidents</span>
          <p className="text-2xl font-bold text-text-main mt-1">{summary?.total_threats || 0}</p>
          <span className="text-[11px] text-text-secondary">Simulated demonstration corpus</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-card border border-gold-border/60">
          <span className="text-xs text-text-muted uppercase font-mono">Leading Threat Vector</span>
          <p className="text-xl font-bold text-gold-champagne mt-1 truncate">{summary?.top_category || 'N/A'}</p>
          <span className="text-[11px] text-text-secondary">Highest incident frequency</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-card border border-gold-border/60">
          <span className="text-xs text-text-muted uppercase font-mono">Active Hotspot States</span>
          <p className="text-2xl font-bold text-text-main mt-1">{summary?.state_count || 0}</p>
          <span className="text-[11px] text-text-secondary">India regional telemetry</span>
        </div>
      </div>

      {/* Filter Selector */}
      <div className="p-4 rounded-xl bg-surface-card border border-gold-border/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
          <Filter className="w-4 h-4 text-gold-primary" />
          <span>Filter Threat Vector:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-surface-elevated border border-gold-border/60 rounded-md py-1.5 px-3 text-xs text-text-main focus:outline-none focus:border-gold-primary"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Interactive Leaflet Map View */}
      <div className="rounded-xl overflow-hidden border border-gold-border shadow-2xl relative">
        <div ref={mapContainerRef} className="h-96 w-full z-0 bg-[#070707]" />

        {/* Floating Map Legend */}
        <div className="absolute bottom-4 right-4 z-10 p-3 rounded-lg bg-[#070707]/90 border border-gold-border/80 text-[11px] font-mono text-gold-champagne backdrop-blur space-y-1 shadow-lg">
          <div className="font-bold flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-gold-primary" />
            <span>INCIDENT DENSITY</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gold-primary/60 border border-gold-champagne inline-block" />
            <span>State Concentration</span>
          </div>
          <div className="text-[9px] text-text-muted pt-1 border-t border-gold-border/20">
            OpenStreetMap CartoDB Dark
          </div>
        </div>
      </div>

      {/* Accessible Telemetry Table */}
      <div className="p-5 rounded-xl bg-surface-card border border-gold-border/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-main">
            Incident Breakdown by Jurisdiction ({incidents.length} Records)
          </h3>
          <span className="text-[11px] text-text-muted font-mono">Provenance: Demo Research Corpus</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gold-border/40 text-text-muted font-mono uppercase text-[10px]">
                <th className="pb-2.5">State</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Observed Modus Operandi</th>
                <th className="pb-2.5 text-right">Incidents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-border/20">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-surface-elevated/40 transition-colors">
                  <td className="py-2.5 font-bold text-gold-champagne font-mono">{inc.state_code}</td>
                  <td className="py-2.5 font-semibold text-text-main">{inc.category}</td>
                  <td className="py-2.5 text-text-secondary text-[11px] max-w-md">{inc.details || 'Standard vector.'}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-text-main">{inc.incident_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
