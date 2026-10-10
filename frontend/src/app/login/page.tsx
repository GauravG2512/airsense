'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, UserCheck, CheckCircle2, Key, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth, UserRole, OFFICIAL_ADMIN_CREDENTIALS } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get('role') as UserRole) || 'citizen';
  const redirectPath = searchParams.get('redirect');

  const { login, loginAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<UserRole>(defaultTab);

  // Admin form state
  const [adminEmail, setAdminEmail] = useState(OFFICIAL_ADMIN_CREDENTIALS.email);
  const [adminPassword, setAdminPassword] = useState(OFFICIAL_ADMIN_CREDENTIALS.password);
  const [adminSecretKey, setAdminSecretKey] = useState(OFFICIAL_ADMIN_CREDENTIALS.secretKey);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleCitizenLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    login('citizen', 'citizen@airsense.org', 'Citizen');
    router.push(redirectPath || '/dashboard');
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      const res = await loginAdmin({
        email: adminEmail,
        password: adminPassword,
        secretKey: adminSecretKey,
      });
      if (res.success) {
        router.push(redirectPath || '/admin');
      } else {
        setAuthError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setAuthError('An unexpected authentication error occurred.');
    } finally {
      setIsAuthenticating(false);
    }
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

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1 text-xs">
                <div className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Public Access — No Account Required</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-sans">
                  Citizens can explore real-time air quality, AI forecasts, and interactive pollution maps immediately with zero friction.
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => handleCitizenLogin(e)}
                className="btn-primary-sharp w-full py-3.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 bg-[#202020] text-white hover:bg-[#333333]"
              >
                <span>Enter Citizen View (Dashboard, Forecast, Map)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#ff682c]" />
              </button>
            </div>

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

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Authentication Failed:</strong> {authError}
                </div>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-[#828282] uppercase text-[10px] tracking-wider flex items-center gap-1.5 font-medium">
                  <Mail className="w-3.5 h-3.5 text-[#816729]" />
                  <span>Admin Email</span>
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#f5f5f5] border border-[#efefef] px-3.5 py-2.5 text-[#202020] text-xs font-mono focus:outline-none focus:border-[#202020]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#828282] uppercase text-[10px] tracking-wider flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-[#816729]" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-[#f5f5f5] border border-[#efefef] px-3.5 py-2.5 pr-10 text-[#202020] text-xs font-mono focus:outline-none focus:border-[#202020]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828282] hover:text-[#202020]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[#828282] uppercase text-[10px] tracking-wider flex items-center gap-1.5 font-medium">
                  <Key className="w-3.5 h-3.5 text-[#816729]" />
                  <span>Authorization Key Token</span>
                </label>
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
                  disabled={isAuthenticating}
                  className="btn-primary-sharp w-full py-3.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 bg-[#202020] text-white hover:bg-[#333333] transition-colors"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#ff682c]" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize Administrator Access</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#ff682c]" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="p-4 bg-[#ebe6dd] border border-[#e0dacd] card-asymmetric space-y-2 text-[11px] font-sans text-[#4d4d4d]">
              <div className="font-mono text-[#816729] uppercase tracking-wider text-[10px] font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
                  Academic &amp; Evaluator Demonstration Credentials:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail(OFFICIAL_ADMIN_CREDENTIALS.email);
                    setAdminPassword(OFFICIAL_ADMIN_CREDENTIALS.password);
                    setAdminSecretKey(OFFICIAL_ADMIN_CREDENTIALS.secretKey);
                    setAuthError(null);
                  }}
                  className="underline text-[#202020] hover:text-[#ff682c] font-mono text-[10px]"
                >
                  Auto-Fill
                </button>
              </div>
              <p className="text-xs text-[#4d4d4d] leading-relaxed">
                Pre-filled with official evaluator credentials (<code className="font-mono text-[#202020]">admin@airsense.org</code> / <code className="font-mono text-[#202020]">airsense2026</code>). Click the button above to authorize.
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
