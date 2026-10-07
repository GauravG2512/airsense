'use client';

import { Activity, CarFront, House, ShieldCheck, Wind } from 'lucide-react';
import { getAqiCategory } from '@/lib/api';

type HealthGuidanceProps = {
  aqi: number;
  city: string;
  pm25TwentyFourHourMean?: number | null;
};

function guidanceForAqi(aqi: number) {
  if (aqi <= 50) {
    return {
      level: 'Routine precautions',
      summary: 'Air quality is in the Good range. Normal outdoor activity is generally reasonable.',
      risk: 'Air pollution is expected to pose little or no risk at this AQI level.',
      outdoor: 'Usual outdoor activity is reasonable.',
      indoor: 'No additional filtration is usually needed for the current AQI.',
      commute: 'Use normal ventilation; avoid vehicle idling where practical.',
      mask: 'A respirator is not generally needed for air pollution at this AQI.',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  }
  if (aqi <= 100) {
    return {
      level: 'Sensitive groups: monitor',
      summary: 'People unusually sensitive to air pollution should watch for symptoms during prolonged outdoor activity.',
      risk: 'A small number of unusually sensitive people may notice irritation during extended outdoor exposure.',
      outdoor: 'Take breaks if you notice irritation or breathing discomfort.',
      indoor: 'Keep windows closed if outdoor air worsens; use a correctly sized air cleaner if available.',
      commute: 'Keep vehicle filters maintained and limit idling.',
      mask: 'Consider a well-fitting N95 for prolonged outdoor exposure if you are sensitive.',
      color: 'text-lime-800 bg-lime-50 border-lime-200',
    };
  }
  if (aqi <= 200) {
    return {
      level: 'Reduce prolonged exposure',
      summary: 'Sensitive people may experience breathing discomfort. Consider lighter or shorter outdoor exertion.',
      risk: 'People with asthma or heart/lung conditions may experience breathing discomfort, especially during prolonged exposure.',
      outdoor: 'People with asthma or heart/lung conditions, children, and older adults should limit prolonged heavy exertion.',
      indoor: 'Close windows during higher-pollution periods; run a suitable HEPA air cleaner if available.',
      commute: 'Maintain the cabin filter and use recirculation in heavy traffic or visibly polluted conditions.',
      mask: 'If you must spend time outdoors, a well-fitting N95 may reduce particle exposure.',
      color: 'text-amber-800 bg-amber-50 border-amber-200',
    };
  }
  if (aqi <= 300) {
    return {
      level: 'Limit outdoor activity',
      summary: 'Prolonged exposure may cause discomfort. Reduce outdoor exertion, especially for sensitive groups.',
      risk: 'Prolonged exposure may cause breathing discomfort in many people, with greater concern for those with existing conditions.',
      outdoor: 'Move strenuous exercise indoors and keep outdoor trips brief.',
      indoor: 'Keep doors and windows closed during pollution peaks; use a HEPA air cleaner if available.',
      commute: 'Keep windows closed in traffic and use a maintained cabin filter with recirculation.',
      mask: 'For unavoidable outdoor trips, use a well-fitting N95; it does not remove all pollution risk.',
      color: 'text-orange-800 bg-orange-50 border-orange-200',
    };
  }
  return {
    level: 'Avoid outdoor exposure',
    summary: 'Air quality is very poor to severe. Everyone should reduce exposure; sensitive people may be affected sooner.',
    risk: 'Health effects can occur even in healthy adults; people with existing respiratory or heart conditions may be affected more seriously.',
    outdoor: 'Avoid outdoor exercise and postpone non-essential outdoor activity.',
    indoor: 'Keep windows closed and run a HEPA air cleaner if available; reduce indoor particle sources.',
    commute: 'Postpone non-essential travel where possible; use a maintained cabin filter and recirculation.',
    mask: 'If going outdoors is unavoidable, use a well-fitting N95 and keep the trip short.',
    color: 'text-red-800 bg-red-50 border-red-200',
  };
}

function aqiToPm25(aqi: number): number {
  if (aqi <= 50) return (aqi / 50) * 30;
  if (aqi <= 100) return 30 + ((aqi - 50) / 50) * 30;
  if (aqi <= 200) return 60 + ((aqi - 100) / 100) * 30;
  if (aqi <= 300) return 90 + ((aqi - 200) / 100) * 30;
  if (aqi <= 400) return 120 + ((aqi - 300) / 100) * 130;
  return 250 + ((aqi - 400) / 100) * 130;
}

function getExposureContext(pm25: number): string {
  if (pm25 <= 21) return 'WHO Annual Target level';
  if (pm25 <= 50) return 'Typical rural / clean urban baseline air';
  if (pm25 <= 72) return 'Base Equivalence Threshold (~1.0 cigarette/day)';
  if (pm25 <= 100) return 'Urban background traffic & industrial levels';
  if (pm25 <= 150) return 'Heavy traffic & mild winter smog buildup';
  if (pm25 <= 175) return 'Highly polluted industrial zone / moderate wildfire smoke';
  if (pm25 <= 200) return 'Heavy urban winter inversion smog';
  if (pm25 <= 300) return 'Hazardous seasonal smog episode';
  if (pm25 <= 400) return 'Severe crop-burning / stubble burning smoke';
  return 'Severe smog emergency (Peak South Asian winter crisis)';
}

export function HealthGuidance({
  aqi,
  city,
  pm25TwentyFourHourMean,
}: HealthGuidanceProps) {
  const guidance = guidanceForAqi(aqi);
  const category = getAqiCategory(aqi);

  const effectivePm25 =
    typeof pm25TwentyFourHourMean === 'number' &&
    Number.isFinite(pm25TwentyFourHourMean) &&
    pm25TwentyFourHourMean > 0
      ? pm25TwentyFourHourMean
      : aqiToPm25(aqi);

  const cigarettes24h = effectivePm25 / 22;
  const cigarettes8h = (effectivePm25 / 22) * (8 / 24);
  const envContext = getExposureContext(effectivePm25);

  const recommendations = [
    { icon: Activity, label: 'Outdoor activity', value: guidance.outdoor },
    { icon: Wind, label: 'Indoor air', value: guidance.indoor },
    { icon: CarFront, label: 'Commute', value: guidance.commute },
    { icon: ShieldCheck, label: 'Respiratory protection', value: guidance.mask },
  ];

  return (
    <section className="card-data-dashboard p-6 sm:p-8 space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-1">
            Exposure &amp; Health Guidance
          </div>
          <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
            Practical precautions for {city}
          </h2>
          <p className="text-xs text-[#4d4d4d] mt-2 leading-relaxed">{guidance.summary}</p>
        </div>
        <span className={`shrink-0 px-3 py-1.5 text-[10px] font-mono uppercase border ${guidance.color}`}>
          {category} AQI · {guidance.level}
        </span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-4">
        <div className="p-4 bg-[#f5f5f5] border border-[#efefef] space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#816729]">
            <House className="w-3.5 h-3.5" />
            PM2.5 Exposure Context (Cigarette Equivalent)
          </div>

          <div>
            <div className="text-3xl font-mono font-bold text-[#202020]">
              {cigarettes24h.toFixed(1)} <span className="text-xs font-normal text-[#4d4d4d]">cigarettes / day (24h)</span>
            </div>
            <div className="text-xs text-[#816729] font-mono mt-1">
              8-Hour Exertion: <strong>{cigarettes8h.toFixed(2)}</strong> cigarettes
            </div>
          </div>

          <div className="p-2.5 bg-white border border-[#e8e8e8] text-[11px] font-mono text-[#202020]">
            <span className="text-[#ff682c] font-semibold">Environment:</span> {envContext} (PM2.5: {effectivePm25.toFixed(1)} µg/m³)
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#4d4d4d]">
            <span>Weekly cumulative: <strong>{(cigarettes24h * 7).toFixed(1)}</strong></span>
            <span>Monthly cumulative: <strong>{(cigarettes24h * 30).toFixed(1)}</strong></span>
          </div>

          <p className="text-[10px] text-[#828282] leading-relaxed border-t border-[#efefef] pt-2">
            Methodology: Berkeley Earth model (Pope et al.). Baseline: 1 cigarette/day ≈ 22 µg/m³ PM2.5 over 24h. Formula: (PM2.5 / 22) × (Hours / 24).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recommendations.map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 border border-[#efefef] bg-white">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#816729]">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
              <p className="text-xs text-[#202020] mt-2 leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 border border-[#efefef] bg-white space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#816729]">Risk context</div>
          <p className="text-xs text-[#202020] leading-relaxed">{guidance.risk}</p>
          <div className="flex flex-wrap gap-1.5">
            {['Asthma', 'Chronic lung disease', 'Heart disease', 'Children', 'Older adults'].map((group) => (
              <span key={group} className="px-2 py-1 bg-[#f5f5f5] border border-[#efefef] text-[10px] text-[#4d4d4d]">
                {group}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[#828282] leading-relaxed">
            Air pollution can aggravate existing symptoms such as wheezing, cough, throat irritation, or shortness of breath; individual responses vary.
          </p>
        </div>
        <div className="p-4 border border-[#efefef] bg-white space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#816729]">Do / avoid</div>
          <p className="text-xs text-[#202020] leading-relaxed">
            <strong>Do:</strong> follow your clinician&apos;s existing care plan, check conditions before strenuous activity, and keep indoor air cleaner when pollution is elevated.
          </p>
          <p className="text-xs text-[#202020] leading-relaxed">
            <strong>Avoid:</strong> smoking or burning materials indoors, and strenuous outdoor exercise when this AQI guidance recommends limiting exposure.
          </p>
        </div>
      </div>

      <div className="p-3 bg-[#f5f5f5] border border-[#efefef] text-[10px] text-[#4d4d4d] leading-relaxed">
        Air-quality precautions are general information, not a diagnosis or medical advice. People with existing health conditions should follow their clinician&apos;s guidance; seek urgent care for severe breathing difficulty or chest pain. Cigarette-equivalent values are calculated using Berkeley Earth&apos;s PM2.5 baseline model (1 cigarette/day ≈ 22 µg/m³ PM2.5 over 24h).
      </div>
    </section>
  );
}
