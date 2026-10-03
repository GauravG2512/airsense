'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, UserCheck, Key, CheckCircle2 } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { MONITORED_STATIONS } from '@/lib/mock-data';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get('role') as UserRole) || 'citizen';
  const redirectPath = searchParams.get('redirect');

  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<UserRole>(defaultTab);

  // Citizen form state
  const [citizenName, setCitizenName] = useState('Priya Sharma');
  const [citizenEmail, setCitizenEmail] = useState('priya.sharma@example.com');
  const [citizenStation, setCitizenStation] = useState('MH_001');

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('admin@airsense.org');
  const [adminPassword, setAdminPassword] = useState('airsense2026');
  const [adminSecretKey, setAdminSecretKey] = useState('DWM-PROD-AUTH-9821');

  const handleCitizenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('citizen', citizenEmail, citizenName);
    router.push(redirectPath || '/dashboard');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('admin', adminEmail, 'Dr. Vikram Malhotra');
    router.push(redirectPath || '/admin');
  };

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#efefef] rounded-full text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
          Role-Based Access Control
        </div>
        <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#202020] tracking-[-0.02em]">
          Sign In to AirSense
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#828282] leading-relaxed">
          Select your portal access level. Citizens receive simplified health advisories; administrators control station telemetry, ETL batches, and ML models.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-[#efefef] border border-[#e8e8e8] rounded-none">
          <button
            type="button"
            onClick={() => setActiveTab('citizen')}
            className={`px-6 py-2.5 text-xs font-mono transition-all flex items-center gap-2 ${
              activeTab === 'citizen'
                ? 'bg-white text-[#202020] shadow-sm font-medium'
                : 'text-[#828282] hover:text-[#202020]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#ff682c]" />
            Citizen Portal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-6 py-2.5 text-xs font-mono transition-all flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-[#202020] text-white font-medium'
                : 'text-[#828282] hover:text-[#202020]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#ff682c]" />
            Administrator &amp; Evaluator
          </button>
        </div>
      </div>

      {/* Login Containers */}
      <div className="max-w-[560px] mx-auto">
        {activeTab === 'citizen' ? (
          /* ================= CITIZEN LOGIN ================= */
          <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#efefef] pb-4">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-1">
                Citizen Access
              </div>
              <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
                Neighborhood Air &amp; Health Portal
              </h2>
              <p className="text-xs text-[#828282] font-sans mt-1">
                Designed for everyday clarity: plain-language pollution levels, outdoor activity safety, and hourly forecasts.
              </p>
            </div>

            <form onSubmit={handleCitizenLogin} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-[#828282] uppercase text-[10px] tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-[#f5f5f5] border border-[#efefef] px-3.5 py-2.5 text-[#202020] text-xs font-sans focus:outline-none focus:border-[#202020]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#828282] uppercase text-[10px] tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  className="w-full bg-[#f5f5f5] border border-[#efefef] px-3.5 py-2.5 text-[#202020] text-xs font-sans focus:outline-none focus:border-[#202020]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#828282] uppercase text-[10px] tracking-wider">Primary Neighborhood / Station</label>
                <select
                  value={citizenStation}
                  onChange={(e) => setCitizenStation(e.target.value)}
                  className="w-full bg-[#f5f5f5] border border-[#efefef] px-3.5 py-2.5 text-[#202020] text-xs font-sans focus:outline-none focus:border-[#202020]"
                >
                  {MONITORED_STATIONS.map((s) => (
                    <option key={s.station_id} value={s.station_id}>
                      {s.city} : {s.station_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary-sharp w-full py-3 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>Enter Citizen Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ff682c]" />
                </button>
              </div>
            </form>

            <div className="p-4 bg-[#f5f5f5] border border-[#efefef] card-asymmetric space-y-2 text-[11px] font-sans text-[#4d4d4d]">
              <div className="font-mono text-[#816729] uppercase tracking-wider text-[10px] font-medium">
                Included Citizen Features:
              </div>
              <ul className="space-y-1 text-[#828282]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff682c] flex-shrink-0" />
                  <span>&quot;Should I go outside right now?&quot; activity advisor</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff682c] flex-shrink-0" />
                  <span>Plain-language explanation without chemical jargon</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff682c] flex-shrink-0" />
                  <span>Best morning/evening clean air commute windows</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* ================= ADMIN LOGIN ================= */
          <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#efefef] pb-4">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-[#ff682c]" />
                Administrative Credentials Required
              </div>
              <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
                Operations &amp; Model Governance
              </h2>
              <p className="text-xs text-[#828282] font-sans mt-1">
                Elevated privileges to control DuckDB ETL batches, station telemetry, TimeSeriesSplit retraining, and PostgreSQL partitions.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-[#828282] uppercase text-[10px] tracking-wider">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#f5f5f5] border border-[#efefef] px-3.5 py-2.5 text-[#202020] text-xs font-mono focus:outline-none focus:border-[#202020]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#828282] uppercase text-[10px] tracking-wider">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-[#f5f5f5] border border-[#efefef] px-3.5 py-2.5 text-[#202020] text-xs font-mono focus:outline-none focus:border-[#202020]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#828282] uppercase text-[10px] tracking-wider">Authorization Key Token</label>
                <input
                  type="text"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  className="w-full bg-[#f5f5f5] border border-[#efefef] px-3.5 py-2.5 text-[#202020] text-xs font-mono focus:outline-none focus:border-[#202020]"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary-sharp w-full py-3 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 bg-[#202020]"
                >
                  <span>Authorize Administrator Access</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#ff682c]" />
                </button>
              </div>
            </form>

            <div className="p-4 bg-[#ebe6dd] border border-[#e0dacd] card-asymmetric space-y-2 text-[11px] font-sans text-[#4d4d4d]">
              <div className="font-mono text-[#816729] uppercase tracking-wider text-[10px] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
                Academic &amp; Evaluator Demonstration Credentials:
              </div>
              <p className="text-xs text-[#4d4d4d] leading-relaxed">
                Pre-filled with official evaluator credentials (<code className="font-mono text-[#202020]">admin@airsense.org</code>). Click the button above for instant administrative elevation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Information Notice */}
      <div className="text-center font-mono text-[11px] text-[#828282]">
        Need academic project documentation? Visit the{' '}
        <Link href="/about" className="text-[#202020] link-ember-underline">
          About AirSense
        </Link>{' '}
        or{' '}
        <Link href="/concepts" className="text-[#202020] link-ember-underline">
          Syllabus Reference
        </Link>{' '}
        pages.
      </div>
    </div>
  );
}
