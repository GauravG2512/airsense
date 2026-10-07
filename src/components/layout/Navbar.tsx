'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [specsDropdownOpen, setSpecsDropdownOpen] = useState(false);

  const primaryNavItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'AI Forecast', href: '/predict' },
    { name: 'Map', href: '/map' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Data Mining', href: '/datamining' },
    { name: 'Models', href: '/models' },
    { name: 'Warehouse', href: '/warehouse' },
    { name: 'OLAP', href: '/olap' },
    { name: 'Pipeline', href: '/pipeline' },
  ];


  const secondaryNavItems = [
    { name: 'Features Store', href: '/features' },
    { name: 'Explain My AQI', href: '/explain' },
    { name: 'Concepts Syllabus', href: '/concepts' },
    { name: 'About AirSense', href: '/about' },
    { name: 'Admin Console', href: '/admin' },
    { name: 'Switch Login', href: '/login' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#ffffff]/95 backdrop-blur-sm border-b border-[#e8e8e8]">
      {/* Top minimal micro-header bar */}
      <div className="border-b border-[#efefef] bg-[#ffffff] text-[#828282] text-[11px] font-mono py-1 px-4 sm:px-8 flex justify-between items-center whitespace-nowrap overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[#202020]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            <span className="font-sans font-medium tracking-tight">AIRSENSE OBSERVATORY</span>
          </span>
          <span className="text-[#e8e8e8]">/</span>
          <span className="hidden sm:inline">196.5M OBSERVATIONS (2009–2026)</span>
          <span className="text-[#e8e8e8] hidden sm:inline">/</span>
          <span className="hidden md:inline">558 MONITORED STATIONS</span>
        </div>
        <div className="flex items-center gap-4 text-[#828282]">
          <span className="hidden lg:inline text-[11px]">CPCB CAAQM NETWORK</span>
          <Link
            href="/about"
            className="text-[#4d4d4d] hover:text-[#202020] transition-colors link-ember-underline"
          >
            About AirSense
          </Link>
          <span className="text-[#e8e8e8]">|</span>
          <span className="text-[11px] font-mono text-[#816729]">
            Mode: {role === 'admin' ? 'Administrator' : 'Citizen'}
          </span>
        </div>
      </div>

      {/* Main Bar with Centered Pill Capsule */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Wordmark (Left) */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="text-xl font-normal tracking-[-0.02em] text-[#202020] whitespace-nowrap" style={{ fontFamily: 'var(--font-heading)' }}>
              AirSense
            </span>
          </Link>

          {/* Floating Pill Container (Centered, 200px radius, Ash #efefef background) */}
          <nav className="hidden lg:flex items-center nav-pill-capsule gap-0.5 flex-shrink-0">
            {primaryNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1 text-[13px] whitespace-nowrap transition-colors rounded-full ${
                    active
                      ? 'bg-[#ffffff] text-[#202020] font-medium shadow-none'
                      : 'text-[#4d4d4d] hover:text-[#202020]'
                  }`}
                  style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* Dropdown for More / Specs */}
            <div className="relative">
              <button
                onClick={() => setSpecsDropdownOpen(!specsDropdownOpen)}
                className="px-2 py-1 text-[13px] whitespace-nowrap text-[#4d4d4d] hover:text-[#202020] flex items-center gap-1 transition-colors"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
              >
                <span>Specs</span>
                <ChevronDown className="w-3 h-3 text-[#828282]" />
              </button>

              {specsDropdownOpen && (
                <div
                  onMouseLeave={() => setSpecsDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-48 bg-[#ffffff] border border-[#e8e8e8] py-1 z-50 text-left card-asymmetric"
                >
                  {secondaryNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSpecsDropdownOpen(false)}
                      className="block px-4 py-2 text-xs whitespace-nowrap text-[#4d4d4d] hover:bg-[#efefef] hover:text-[#202020] transition-colors"
                      style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action: Clean Role Switcher without wrapping */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {role === 'admin' ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/admin"
                  className="btn-primary-sharp text-xs py-1.5 px-3.5 bg-[#202020] whitespace-nowrap flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
                  <span>Admin Center</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="text-xs font-mono text-[#828282] hover:text-[#202020] whitespace-nowrap link-ember-underline"
                  title="Switch to Citizen Dashboard"
                >
                  Citizen View →
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="btn-primary-sharp text-xs py-1.5 px-3.5 whitespace-nowrap"
                >
                  Citizen Dashboard
                </Link>
                <Link
                  href="/admin"
                  className="text-xs font-mono text-[#828282] hover:text-[#202020] whitespace-nowrap flex items-center gap-1"
                  title="Access Administrator Control Center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#816729]" />
                  Admin
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#202020] hover:bg-[#efefef] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e8e8e8] bg-[#ffffff] px-4 pt-3 pb-6 space-y-4">
          <div className="text-[11px] font-mono uppercase text-[#828282] px-2 tracking-wider">
            Primary Navigation
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {primaryNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-xs whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-[#efefef] text-[#202020] font-medium'
                      : 'text-[#4d4d4d] hover:bg-[#f5f5f5]'
                  }`}
                  style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="text-[11px] font-mono uppercase text-[#828282] px-2 pt-2 tracking-wider">
            Portals &amp; Specs
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs whitespace-nowrap text-[#4d4d4d] hover:bg-[#f5f5f5]"
                style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary-sharp text-xs py-2.5 text-center whitespace-nowrap"
            >
              Citizen Dashboard
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-ghost-sharp text-xs py-2.5 text-center border border-[#202020] text-[#202020] whitespace-nowrap"
            >
              Admin Center
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
