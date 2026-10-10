'use client';

import React from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function TermsPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#efefef] pb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
          Platform Governance &amp; Compliance
        </div>
        <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#202020] tracking-[-0.02em]">
          Terms &amp; Conditions of Service
        </h1>
        <p className="text-xs font-mono text-[#828282] mt-1">
          Effective Date: March 2026 : AirSense Environmental Intelligence Platform
        </p>
      </div>

      <div className="card-data-dashboard p-6 sm:p-8 space-y-6 text-xs text-[#4d4d4d] font-sans leading-relaxed">
        {/* Section 1: Non-Medical Advice Disclaimer on Warm Ivory */}
        <section className="space-y-3 p-5 bg-[#ebe6dd] border border-[#e0dacd] card-asymmetric">
          <div className="flex items-center gap-2 text-xs font-mono text-[#816729] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#ff682c]" />
            1. Environmental Information Disclaimer (Not Medical Advice)
          </div>
          <p className="text-[#202020] font-medium leading-relaxed">
            CRITICAL NOTICE: AirSense provides ambient environmental information, statistical summaries, 
            and machine-learning-based forecasts strictly for informational and research purposes. 
            AirSense does not provide medical advice or individual clinical determinations.
          </p>
          <p className="text-[#4d4d4d] leading-relaxed">
            The platform does not determine whether it is medically safe for any specific individual to exercise, commute, or engage in outdoor activities. 
            Persons with pre-existing cardiovascular conditions, respiratory diseases, asthma, children, or elderly individuals must consult 
            qualified medical professionals regarding personal health precautions.
          </p>
        </section>

        {/* Section 2: Sensor Network Limitations */}
        <section className="space-y-3 border-t border-[#efefef] pt-6">
          <h2 className="text-sm font-mono text-[#202020] font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            2. Public Data Limitations &amp; As-Is Notice
          </h2>
          <p>
            AirSense synthesizes raw observational data published by the XKDR India Air Quality Database, 
            the Central Pollution Control Board (CPCB), and the US Department of State. XKDR and CPCB explicitly state that 
            monitoring network data is compiled as received without regulatory warranty:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#4d4d4d]">
            <li>Sensors are subject to intermittent telemetry dropouts, recalibration cycles, and local microclimate variations.</li>
            <li>Station-based readings represent conditions at specific sensor coordinates and do not guarantee uniform ambient quality across entire urban districts.</li>
            <li>Machine learning forecasts are probabilistic estimates subject to residual error (XGBoost RMSE: 16.7 AQI units).</li>
          </ul>
        </section>

        {/* Section 3: Platform Purpose & Acceptable Use */}
        <section className="space-y-3 border-t border-[#efefef] pt-6">
          <h2 className="text-sm font-mono text-[#202020] font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            3. Platform Purpose &amp; Acceptable Use
          </h2>
          <p>
            AirSense is an open academic and scientific intelligence platform designed to demonstrate modern Data Warehouse, 
            OLAP, Data Mining, and Machine Learning workflows. Users agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#4d4d4d]">
            <li>Use AirSense estimates as the sole evidentiary basis for formal regulatory enforcement or civil litigation.</li>
            <li>Subject public endpoints to aggressive scraping or denial of service attacks.</li>
            <li>Misrepresent probabilistic machine learning forecasts as verified regulatory observations.</li>
          </ul>
        </section>

        {/* Section 4: Intellectual Property & Attribution */}
        <section className="space-y-3 border-t border-[#efefef] pt-6">
          <h2 className="text-sm font-mono text-[#202020] font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            4. Attribution &amp; Licensing
          </h2>
          <p>
            Underlying observational data is licensed under the <strong>Creative Commons Attribution 4.0 International License (CC BY 4.0)</strong>. 
            Users who reproduce analytical charts or database marts must preserve proper institutional citations to the XKDR India Air Quality Database, 
            the Central Pollution Control Board CAAQM network, and AirNow.
          </p>
        </section>

        {/* Section 5: Limitation of Liability */}
        <section className="space-y-3 border-t border-[#efefef] pt-6">
          <h2 className="text-sm font-mono text-[#202020] font-medium uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            5. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by applicable law, the authors, developers, and affiliated academic institutions 
            shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of, or inability to use, 
            the information provided by AirSense.
          </p>
        </section>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
