'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  User,
  Heart,
  Wind,
  Sun,
  Shield,
  Activity,
} from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { useAuth } from '@/context/AuthContext';
import {
  MONITORED_STATIONS,
  getStationAirReading,
  getStationForecast,
  getStationHistoricalBaseline,
} from '@/lib/mock-data';
import { Station, AirReading, ForecastPoint, HistoricalComparison, CPCB_AQI_CATEGORIES } from '@/lib/api';

export default function CitizenDashboardPage() {
  const { user, updatePreferredStation } = useAuth();

  // Selected station
  const [selectedStationId, setSelectedStationId] = useState<string>(
    user?.preferredStationId || 'MH_001'
  );

  // Simple vs Detailed view toggle
  const [showDetailedPollutants, setShowDetailedPollutants] = useState<boolean>(false);

  // Geolocation state
  const [geoLocating, setGeoLocating] = useState<boolean>(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  // Selected quick activity tab
  const [selectedActivity, setSelectedActivity] = useState<string>('running');

  // Time state
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const station: Station =
    MONITORED_STATIONS.find((s) => s.station_id === selectedStationId) || MONITORED_STATIONS[4];
  const reading: AirReading = getStationAirReading(selectedStationId);
  const forecast: ForecastPoint[] = getStationForecast(selectedStationId);

  // Quick popular city stations
  const popularCities = [
    { label: 'Mumbai', stationId: 'MH_001' },
    { label: 'Delhi', stationId: 'DL_001' },
    { label: 'Bengaluru', stationId: 'KA_001' },
    { label: 'Pune', stationId: 'MH_002' },
    { label: 'Hyderabad', stationId: 'TG_001' },
    { label: 'Kolkata', stationId: 'WB_001' },
    { label: 'Chennai', stationId: 'TN_001' },
  ];

  // Geolocation handler
  const handleUseMyLocation = () => {
    setGeoLocating(true);
    setGeoMessage(null);

    if (!navigator.geolocation) {
      setGeoMessage('Location access is not available on this browser.');
      setGeoLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let nearest = MONITORED_STATIONS[0];
        let minD = Number.MAX_VALUE;

        MONITORED_STATIONS.forEach((stn) => {
          const d = Math.hypot(stn.latitude - latitude, stn.longitude - longitude);
          if (d < minD) {
            minD = d;
            nearest = stn;
          }
        });

        setSelectedStationId(nearest.station_id);
        updatePreferredStation(nearest.station_id);
        setGeoMessage(`Located nearest monitor: ${nearest.station_name}, ${nearest.city}`);
        setGeoLocating(false);
      },
      () => {
        setGeoMessage('Location permission denied. You can select your city from the list.');
        setGeoLocating(false);
      },
      { timeout: 7000 }
    );
  };

  // Activity safety evaluation based on AQI
  const getActivityAdvice = (aqi: number) => {
    if (aqi <= 50) {
      return {
        verdict: 'Ideal for All Outdoor Activities',
        running: { status: 'Safe', tip: 'Air is pristine. Great time for long runs and intense cardio.', badge: 'Safe' },
        walking: { status: 'Safe', tip: 'Enjoy the fresh air outdoors anytime today.', badge: 'Safe' },
        children: { status: 'Safe', tip: 'Completely safe for children and elderly individuals.', badge: 'Safe' },
        cycling: { status: 'Safe', tip: 'No masks or precautions needed.', badge: 'Safe' },
        ventilation: { status: 'Safe', tip: 'Open windows to bring clean outdoor air into your home.', badge: 'Safe' },
      };
    } else if (aqi <= 100) {
      return {
        verdict: 'Good Outdoor Conditions',
        running: { status: 'Safe', tip: 'Outdoor exercise is fine for healthy individuals.', badge: 'Safe' },
        walking: { status: 'Safe', tip: 'Normal walking and daily commuting are fine.', badge: 'Safe' },
        children: { status: 'Safe', tip: 'Normal outdoor playtime is safe.', badge: 'Safe' },
        cycling: { status: 'Safe', tip: 'Normal cycling conditions.', badge: 'Safe' },
        ventilation: { status: 'Safe', tip: 'Safe to ventilate rooms.', badge: 'Safe' },
      };
    } else if (aqi <= 200) {
      return {
        verdict: 'Acceptable with Caution for Sensitive Groups',
        running: { status: 'Caution', tip: 'Healthy individuals can run. Sensitive runners should consider shorter workouts.', badge: 'Caution' },
        walking: { status: 'Safe', tip: 'Normal outdoor walking is safe for most people.', badge: 'Safe' },
        children: { status: 'Caution', tip: 'Children with asthma should take frequent breaks during play.', badge: 'Caution' },
        cycling: { status: 'Caution', tip: 'Prefer less congested routes away from highway traffic.', badge: 'Caution' },
        ventilation: { status: 'Caution', tip: 'Ventilate during mid-day when the air is clearest.', badge: 'Caution' },
      };
    } else if (aqi <= 300) {
      return {
        verdict: 'Unhealthy : Limit Prolonged Outdoor Exertion',
        running: { status: 'Avoid', tip: 'Avoid strenuous outdoor running; switch to an indoor treadmill.', badge: 'Avoid' },
        walking: { status: 'Caution', tip: 'Wear a well-fitted N95 mask if walking near busy roads.', badge: 'Caution' },
        children: { status: 'Avoid', tip: 'Keep children indoors, especially during evening hours.', badge: 'Avoid' },
        cycling: { status: 'Avoid', tip: 'Avoid vigorous road cycling until air clears.', badge: 'Avoid' },
        ventilation: { status: 'Avoid', tip: 'Keep windows closed and run an air purifier if available.', badge: 'Avoid' },
      };
    } else {
      return {
        verdict: 'Hazardous Air : Stay Indoors When Possible',
        running: { status: 'Avoid', tip: 'Do not exercise outdoors under any circumstances.', badge: 'Avoid' },
        walking: { status: 'Avoid', tip: 'Limit outdoor movement strictly to essential trips.', badge: 'Avoid' },
        children: { status: 'Avoid', tip: 'Children, seniors, and heart/lung patients should remain inside.', badge: 'Avoid' },
        cycling: { status: 'Avoid', tip: 'Avoid all outdoor cycling.', badge: 'Avoid' },
        ventilation: { status: 'Avoid', tip: 'Keep all doors and windows tightly shut.', badge: 'Avoid' },
      };
    }
  };

  const advice = getActivityAdvice(reading.aqi);

  // Plain language summary
  const getPlainLanguageExplanation = (stationName: string, aqi: number) => {
    if (aqi <= 100) {
      return {
        lead: `Air around ${stationName} is clear and healthy today.`,
        bullets: [
          'Favorable wind speeds are dispersing vehicle and industrial emissions.',
          'Particulate levels (PM2.5) are well within national clean air standards.',
          'Great day to plan outdoor family activities or sports.',
        ],
      };
    } else if (aqi <= 200) {
      return {
        lead: `Air around ${stationName} is moderately dusty today.`,
        bullets: [
          'Rush-hour traffic and road dust are the primary contributors.',
          'Gentle winds are allowing fine combustion smoke to accumulate slowly.',
          'Air quality is safe for most healthy people, but sensitive individuals may feel mild irritation.',
        ],
      };
    } else {
      return {
        lead: `Air around ${stationName} is heavily polluted today.`,
        bullets: [
          'A night-time temperature inversion has trapped smoke close to street level.',
          'High concentration of fine combustion particulates (PM2.5) is present.',
          'Stay indoors when possible and wear an N95 mask outdoors.',
        ],
      };
    }
  };

  const plainSummary = getPlainLanguageExplanation(station.station_name, reading.aqi);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar for Citizens */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            Citizen Clean Air Portal
          </div>
          <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#202020] tracking-[-0.02em] mt-1">
            Personal Air Intelligence
          </h1>
          <p className="text-xs text-[#828282] font-sans mt-0.5">
            Clear, honest air quality for your daily routine : {station.station_name}, {station.city}
          </p>
        </div>

        {/* User Identity or Quick Sign In */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-sans text-[#202020] font-medium flex items-center gap-1.5 justify-end">
              <User className="w-3.5 h-3.5 text-[#ff682c]" />
              {user ? user.name : 'Citizen Guest'}
            </div>
            <div className="text-[10px] font-mono text-[#828282]">{currentTimeStr}</div>
          </div>
          <Link
            href="/login?role=admin"
            className="btn-ghost-sharp text-xs font-mono py-1.5 px-3 text-[#4d4d4d] hover:text-[#202020]"
          >
            Admin Sign In →
          </Link>
        </div>
      </div>

      {/* Quick City Switcher Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#828282]">
          <span>Select Your City:</span>
          <button
            onClick={handleUseMyLocation}
            disabled={geoLocating}
            className="text-[#ff682c] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Navigation className="w-3 h-3" />
            {geoLocating ? 'Locating...' : 'Use My Current Location'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {popularCities.map((c) => {
            const isSelected = selectedStationId === c.stationId;
            return (
              <button
                key={c.stationId}
                onClick={() => {
                  setSelectedStationId(c.stationId);
                  updatePreferredStation(c.stationId);
                }}
                className={`px-3 py-1.5 text-xs font-mono transition-all rounded-none ${
                  isSelected
                    ? 'bg-[#202020] text-white font-medium'
                    : 'bg-[#f5f5f5] text-[#4d4d4d] hover:bg-[#efefef]'
                }`}
              >
                {c.label}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-1.5 text-xs font-mono">
            <span className="text-[#828282] hidden md:inline">Or Pick Station:</span>
            <select
              value={selectedStationId}
              onChange={(e) => {
                setSelectedStationId(e.target.value);
                updatePreferredStation(e.target.value);
              }}
              className="bg-[#f5f5f5] border border-[#efefef] px-2 py-1 text-xs text-[#202020] font-mono rounded-none"
            >
              {MONITORED_STATIONS.map((s) => (
                <option key={s.station_id} value={s.station_id}>
                  {s.city} : {s.station_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {geoMessage && (
          <div className="p-2.5 bg-[#f5f5f5] border border-[#efefef] text-xs font-sans text-[#4d4d4d]">
            {geoMessage}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO VERDICT: SIMPLE, JARGON-FREE AQI VERDICT */}
      {/* ========================================================================= */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c]">
              Right Now : Verified Station Reading
            </div>
            <h2 className="font-display font-normal text-2xl sm:text-3xl text-[#202020] tracking-[-0.02em]">
              Air Quality is <span className="font-medium">{reading.aqi_category}</span> in {station.city}
            </h2>
            <p className="text-xs sm:text-sm text-[#4d4d4d] font-sans leading-relaxed">
              {CPCB_AQI_CATEGORIES[reading.aqi_category]?.healthStatement || 'Air quality is monitored according to standard CPCB protocols.'}
            </p>
          </div>

          {/* Big High-Contrast AQI Indicator */}
          <div className="flex flex-col items-center sm:items-end p-5 bg-[#f5f5f5] border border-[#efefef] card-asymmetric min-w-[200px]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#828282]">
              Official CPCB Index
            </span>
            <div className="text-5xl font-mono text-[#202020] font-normal my-1">
              {reading.aqi}
            </div>
            <AqiBadge category={reading.aqi_category} size="md" />
            <div className="text-[10px] font-mono text-[#828282] mt-2">
              Primary Stressor: <span className="text-[#202020] font-medium">{reading.dominant_pollutant}</span>
            </div>
          </div>
        </div>

        {/* Clean Golden Outdoor Window Advice */}
        <div className="p-4 bg-[#ebe6dd] border border-[#e0dacd] card-asymmetric flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono text-[#816729] uppercase tracking-wider font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
              Best Outdoor Breathing Window Today
            </div>
            <div className="text-xs text-[#202020] font-sans">
              <strong>06:30 AM to 08:30 AM</strong> has the lowest particulate density (AQI ~85). Plan outdoor workouts and school commutes during this window.
            </div>
          </div>
          <Link
            href="/explain"
            className="text-xs font-mono text-[#202020] link-ember-underline flex-shrink-0"
          >
            Why is this? →
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVITY ADVISOR: "SHOULD I GO OUTSIDE RIGHT NOW?" */}
      {/* ========================================================================= */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#efefef] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-1">
              Daily Routine Planning
            </div>
            <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
              Can I Exercise or Spend Time Outdoors Right Now?
            </h2>
          </div>
          <div className="text-xs font-mono text-[#828282]">
            Overall Status: <span className="text-[#202020] font-medium">{advice.verdict}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Running */}
          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs font-medium text-[#202020]">Jogging &amp; Running</span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-medium ${
                advice.running.badge === 'Safe' ? 'bg-white text-emerald-700 border border-[#e8e8e8]' :
                advice.running.badge === 'Caution' ? 'bg-[#ff682c]/10 text-[#ff682c]' : 'bg-[#202020] text-white'
              }`}>
                {advice.running.status}
              </span>
            </div>
            <p className="text-[11px] text-[#4d4d4d] font-sans leading-relaxed">
              {advice.running.tip}
            </p>
          </div>

          {/* Walking */}
          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs font-medium text-[#202020]">Walking &amp; Commute</span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-medium ${
                advice.walking.badge === 'Safe' ? 'bg-white text-emerald-700 border border-[#e8e8e8]' :
                advice.walking.badge === 'Caution' ? 'bg-[#ff682c]/10 text-[#ff682c]' : 'bg-[#202020] text-white'
              }`}>
                {advice.walking.status}
              </span>
            </div>
            <p className="text-[11px] text-[#4d4d4d] font-sans leading-relaxed">
              {advice.walking.tip}
            </p>
          </div>

          {/* Children & Elderly */}
          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs font-medium text-[#202020]">Kids &amp; Elderly</span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-medium ${
                advice.children.badge === 'Safe' ? 'bg-white text-emerald-700 border border-[#e8e8e8]' :
                advice.children.badge === 'Caution' ? 'bg-[#ff682c]/10 text-[#ff682c]' : 'bg-[#202020] text-white'
              }`}>
                {advice.children.status}
              </span>
            </div>
            <p className="text-[11px] text-[#4d4d4d] font-sans leading-relaxed">
              {advice.children.tip}
            </p>
          </div>

          {/* Cycling */}
          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs font-medium text-[#202020]">Road Cycling</span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-medium ${
                advice.cycling.badge === 'Safe' ? 'bg-white text-emerald-700 border border-[#e8e8e8]' :
                advice.cycling.badge === 'Caution' ? 'bg-[#ff682c]/10 text-[#ff682c]' : 'bg-[#202020] text-white'
              }`}>
                {advice.cycling.status}
              </span>
            </div>
            <p className="text-[11px] text-[#4d4d4d] font-sans leading-relaxed">
              {advice.cycling.tip}
            </p>
          </div>

          {/* Windows / Home Ventilation */}
          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-sans text-xs font-medium text-[#202020]">Home Windows</span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-medium ${
                advice.ventilation.badge === 'Safe' ? 'bg-white text-emerald-700 border border-[#e8e8e8]' :
                advice.ventilation.badge === 'Caution' ? 'bg-[#ff682c]/10 text-[#ff682c]' : 'bg-[#202020] text-white'
              }`}>
                {advice.ventilation.status}
              </span>
            </div>
            <p className="text-[11px] text-[#4d4d4d] font-sans leading-relaxed">
              {advice.ventilation.tip}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SIMPLIFIED 12-HOUR OUTLOOK TIMELINE */}
      {/* ========================================================================= */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#efefef] pb-4 flex justify-between items-center">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">
              Hourly Outlook
            </div>
            <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
              Next 12 Hours Forecast Timeline
            </h2>
          </div>
          <span className="text-xs font-mono text-[#828282]">Probabilistic XGBoost Model</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {forecast.slice(0, 6).map((point) => (
            <div
              key={point.forecast_hour}
              className="p-3.5 bg-[#f5f5f5] border border-[#efefef] card-asymmetric flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="text-[10px] font-mono text-[#828282] uppercase">
                  +{point.forecast_hour} Hour{point.forecast_hour > 1 ? 's' : ''}
                </div>
                <div className="text-xs font-mono text-[#202020] font-medium">{point.timestamp}</div>
              </div>

              <div>
                <div className="text-2xl font-mono text-[#202020] font-normal">{point.predicted_aqi}</div>
                <div className="text-[10px] font-mono text-[#ff682c] mt-0.5">{point.predicted_category}</div>
              </div>

              <div className="text-[10px] text-[#828282] font-sans pt-1 border-t border-[#efefef]">
                Interval: {point.confidence_interval_low} - {point.confidence_interval_high}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. "WHY IS THE AIR LIKE THIS TODAY?" (PLAIN ENGLISH) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="card-data-dashboard p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c]">
              Understanding The Cause
            </div>
            <h3 className="font-display font-normal text-xl text-[#202020] tracking-[-0.01em]">
              {plainSummary.lead}
            </h3>
            <ul className="space-y-2 text-xs text-[#4d4d4d] font-sans leading-relaxed">
              {plainSummary.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c] mt-1.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-[#efefef] flex justify-between items-center text-xs font-mono">
            <span className="text-[#828282]">Want technical feature weights?</span>
            <Link href="/explain" className="text-[#202020] link-ember-underline">
              Inspect TreeSHAP Report →
            </Link>
          </div>
        </div>

        {/* Historical Context Comparison */}
        <div className="card-data-dashboard p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729]">
              Long-Term Context (2009 to 2026)
            </div>
            <h3 className="font-display font-normal text-xl text-[#202020] tracking-[-0.01em]">
              Is Today&apos;s Air Normal for {station.city}?
            </h3>
            <p className="text-xs text-[#4d4d4d] font-sans leading-relaxed">
              Across 17 years of continuous CPCB and US Diplomatic monitoring records, today&apos;s reading is 
              <strong> 12% lower than the historical seasonal March average (158 AQI)</strong> for this station. 
              Air quality improves progressively as the pre-monsoon coastal breeze gains strength.
            </p>
          </div>

          <div className="pt-3 border-t border-[#efefef] flex justify-between items-center text-xs font-mono">
            <span className="text-[#828282]">Historical Trend Archives</span>
            <Link href="/analytics" className="text-[#202020] link-ember-underline">
              Explore 17-Year Analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. OPTIONAL TECHNICAL EXPANDER: "POLLUTANT SUB-INDEX BREAKDOWN" */}
      {/* ========================================================================= */}
      <div className="card-asymmetric p-6 bg-white border border-[#efefef] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-sans font-medium text-[#202020]">
              Detailed Pollutant Concentrations (For Curious Citizens)
            </div>
            <p className="text-xs text-[#828282] font-sans">
              View individual chemical sub-indices (PM2.5, PM10, Nitrogen Dioxide, Ozone, Carbon Monoxide).
            </p>
          </div>
          <button
            onClick={() => setShowDetailedPollutants(!showDetailedPollutants)}
            className="btn-ghost-sharp text-xs font-mono px-3 py-1.5 text-[#202020] flex items-center gap-1.5"
          >
            {showDetailedPollutants ? 'Hide Chemical Details' : 'Show Chemical Details'}
            {showDetailedPollutants ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-[#ff682c]" />}
          </button>
        </div>

        {showDetailedPollutants && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-[#efefef]">
            {reading.pollutants.slice(0, 6).map((p) => (
              <div key={p.pollutant_name} className="p-3 bg-[#f5f5f5] border border-[#efefef] card-asymmetric">
                <div className="text-[10px] font-mono text-[#828282] uppercase">{p.pollutant_name}</div>
                <div className="text-lg font-mono text-[#202020] font-medium mt-1">
                  {p.value} <span className="text-[10px] font-sans text-[#828282]">{p.unit}</span>
                </div>
                <div className="text-[10px] font-mono text-[#ff682c] mt-1">
                  Sub-Index: {p.sub_index}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
}
