'use client';

import React from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function PrivacyPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#efefef] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
          Data Governance &amp; Transparency
        </div>
        <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#202020] tracking-[-0.02em]">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-[#828282] mt-1">
          Effective Date: March 2026 : AirSense Environmental Intelligence Platform
        </p>
      </div>

      <div className="card-data-dashboard p-6 sm:p-8 space-y-6 text-xs text-[#4d4d4d] font-sans leading-relaxed">
        {/* Section 1: Location Data Policy */}
        <section className="space-y-3">
          <h2 className="text-sm font-mono text-[#202020] font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            1. Geographic Location Permissions &amp; Processing
          </h2>
          <p>
            AirSense provides localized ambient air quality evaluations. To find the nearest continuous air-monitoring 
            station relative to your device, the application offers an optional &quot;Use My Location&quot; feature:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#4d4d4d]">
            <li>
              <strong className="text-[#202020]">Explicit Permission Required:</strong> Your browser will explicitly ask for permission before accessing geolocation coordinates. You may deny this request at any time.
            </li>
            <li>
              <strong className="text-[#202020]">Ephemeral In-Memory Calculation:</strong> Latitude and longitude coordinates provided by your browser are processed strictly in local browser memory to compute the distance to the nearest of 558 monitoring stations.
            </li>
            <li>
              <strong className="text-[#202020]">Zero Server Storage:</strong> Exact personal GPS coordinates are never transmitted to, logged in, or permanently stored in our Data Warehouse or server databases.
            </li>
            <li>
              <strong className="text-[#202020]">Manual Fallback Always Available:</strong> If you decline location permissions, you can manually search any Indian city or select a station from the dropdown menu without restriction.
            </li>
          </ul>
        </section>

        {/* Section 2: Environmental Data Integrity */}
        <section className="space-y-3 border-t border-[#efefef] pt-6">
          <h2 className="text-sm font-mono text-[#202020] font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            2. Public Environmental Data Handling
          </h2>
          <p>
            AirSense operates on public, anonymized environmental observation datasets compiled by the XKDR India Air Quality Database, 
            sourced from the Central Pollution Control Board (CPCB) and US Department of State monitors. 
            No personally identifiable information (PII) is included in the environmental Data Warehouse.
          </p>
        </section>

        {/* Section 3: Cookies & Local Storage */}
        <section className="space-y-3 border-t border-[#efefef] pt-6">
          <h2 className="text-sm font-mono text-[#202020] font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            3. Cookies, Telemetry &amp; Local Storage
          </h2>
          <p>
            AirSense does not use tracking cookies, commercial advertising networks, or third-party behavioral analytics profiling:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#4d4d4d]">
            <li>Local browser session storage may be used solely to remember your preferred station or activity selection across page reloads.</li>
            <li>No data is sold, monetized, or shared with commercial advertising brokers.</li>
          </ul>
        </section>

        {/* Section 4: Third-Party Infrastructure */}
        <section className="space-y-3 border-t border-[#efefef] pt-6">
          <h2 className="text-sm font-mono text-[#202020] font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            4. Third-Party Map Services
          </h2>
          <p>
            Our geospatial map interface renders basemap tiles provided by CartoDB (Positron) and OpenStreetMap contributors. 
            Map tile requests are standard HTTPS requests that receive tile images. Please consult CartoDB and OpenStreetMap privacy notices for their respective server access log policies.
          </p>
        </section>

        {/* Section 5: Inquiries */}
        <section className="space-y-3 border-t border-[#efefef] pt-6">
          <h2 className="text-sm font-mono text-[#202020] font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            5. Inquiries &amp; Academic Contact
          </h2>
          <p>
            For questions regarding AirSense data architecture, algorithmic transparency, or academic reproducibility, please inspect our repository documentation or review the{' '}
            <Link href="/about" className="text-[#202020] link-ember-underline">
              About AirSense
            </Link>{' '}
            page.
          </p>
        </section>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
