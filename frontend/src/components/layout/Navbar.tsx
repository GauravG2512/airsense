'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [specsDropdownOpen, setSpecsDropdownOpen] = useState(false);

  const isAdmin = role === 'admin';

  // Citizen view strictly contains only 3 items: Dashboard, AI Forecast, Map
  const citizenNavItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'AI Forecast', href: '/predict' },
    { name: 'Map', href: '/map' },
  ];

  // Admin view retains all engineering and analytical tools
  const adminPrimaryNavItems = [
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

  const adminSecondaryNavItems = [
    { name: 'Features Store', href: '/features' },
    { name: 'Explain My AQI', href: '/explain' },
    { name: 'Concepts Syllabus', href: '/concepts' },
    { name: 'About AirSense', href: '/about' },
    { name: 'Admin Console', href: '/admin' },
  ];

  const activeNavItems = isAdmin ? adminPrimaryNavItems : citizenNavItems;

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const handleSwitchToAdmin = () => {
    router.push('/admin');
  };

  const handleSwitchToCitizen = () => {
    if (isAdmin) {
      logout();
    }
    router.push('/dashboard');
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
          <span className="hidden sm:inline">196.5M OBSERVATIONS</span>
          <span className="text-[#e8e8e8] hidden sm:inline">/</span>
          <span className="hidden md:inline">558 MONITORED STATIONS</span>
        </div>
        <div className="flex items-center gap-2 text-[#828282]">
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#828282] hidden sm:inline">Active View:</span>
          <button
            type="button"
            onClick={handleSwitchToCitizen}
            className={`text-[11px] font-mono flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              !isAdmin ? 'bg-[#202020] text-white font-medium' : 'text-[#4d4d4d] hover:text-[#202020]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${!isAdmin ? 'bg-emerald-400' : 'bg-gray-400'}`} />
            Citizen View
          </button>
          <span className="text-[#e8e8e8]">/</span>
          <button
            type="button"
            onClick={handleSwitchToAdmin}
            className={`text-[11px] font-mono flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              isAdmin ? 'bg-[#816729] text-white font-medium' : 'text-[#4d4d4d] hover:text-[#816729]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-amber-300' : 'bg-gray-400'}`} />
            Admin View
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Wordmark (Left) */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="text-xl font-normal tracking-[-0.02em] text-[#202020] whitespace-nowrap" style={{ fontFamily: 'var(--font-heading)' }}>
              AirSense
            </span>
            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${isAdmin ? 'bg-[#816729]/10 text-[#816729]' : 'bg-[#efefef] text-[#4d4d4d]'}`}>
              {isAdmin ? 'Admin' : 'Citizen'}
            </span>
          </Link>

          {/* Navigation Pill Capsule (Centered) */}
          <nav className="hidden lg:flex items-center nav-pill-capsule gap-0.5 flex-shrink-0">
            {activeNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors rounded-full ${
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

            {/* Admin Specs Dropdown (Admin Only) */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setSpecsDropdownOpen(!specsDropdownOpen)}
                  className="px-2.5 py-1 text-[13px] whitespace-nowrap text-[#4d4d4d] hover:text-[#202020] flex items-center gap-1 transition-colors"
                  style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
                >
                  <span>Specs &amp; DWM</span>
                  <ChevronDown className="w-3 h-3 text-[#828282]" />
                </button>

                {specsDropdownOpen && (
                  <div
                    onMouseLeave={() => setSpecsDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-48 bg-[#ffffff] border border-[#e8e8e8] py-1 z-50 text-left card-asymmetric shadow-lg"
                  >
                    {adminSecondaryNavItems.map((item) => (
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
            )}
          </nav>

          {/* Right Action: 2 Clear View Option Buttons (Citizen View & Admin View) */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleSwitchToCitizen}
              className={`text-xs py-1.5 px-3 font-mono flex items-center gap-1.5 transition-all border ${
                !isAdmin
                  ? 'bg-[#202020] text-white border-[#202020] font-medium shadow-sm'
                  : 'bg-[#ffffff] text-[#4d4d4d] border-[#e8e8e8] hover:border-[#202020] hover:text-[#202020]'
              }`}
              title="Citizen View (Dashboard, AI Forecast, Live Map)"
            >
              <UserCheck className={`w-3.5 h-3.5 ${!isAdmin ? 'text-emerald-400' : 'text-[#828282]'}`} />
              <span>Citizen View</span>
              {!isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={handleSwitchToAdmin}
              className={`text-xs py-1.5 px-3 font-mono flex items-center gap-1.5 transition-all border ${
                isAdmin
                  ? 'bg-[#816729] text-white border-[#816729] font-medium shadow-sm'
                  : 'bg-[#ffffff] text-[#4d4d4d] border-[#e8e8e8] hover:border-[#816729] hover:text-[#816729]'
              }`}
              title="Admin View (Data Warehouse, OLAP Cubes, ML Lab, Pipelines)"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-300' : 'text-[#816729]'}`} />
              <span>Admin View</span>
              {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
            </button>
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
          <div className="flex justify-between items-center px-2">
            <span className="text-[11px] font-mono uppercase text-[#828282] tracking-wider">
              {isAdmin ? 'Admin Navigation' : 'Citizen Navigation (3 Tools)'}
            </span>
            <span className="text-xs font-mono text-[#ff682c]">
              {isAdmin ? 'Welcome Admin' : 'Hey Citizen'}
            </span>
          </div>

          <div className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
            {activeNavItems.map((item) => {
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

          {isAdmin && (
            <>
              <div className="text-[11px] font-mono uppercase text-[#828282] px-2 pt-2 tracking-wider">
                Admin Specifications
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {adminSecondaryNavItems.map((item) => (
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
            </>
          )}

          <div className="pt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleSwitchToCitizen();
              }}
              className={`text-xs py-2.5 px-2 text-center justify-center flex items-center gap-1.5 border font-mono ${
                !isAdmin
                  ? 'bg-[#202020] text-white border-[#202020]'
                  : 'bg-white text-[#4d4d4d] border-[#e8e8e8]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Citizen View</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleSwitchToAdmin();
              }}
              className={`text-xs py-2.5 px-2 text-center justify-center flex items-center gap-1.5 border font-mono ${
                isAdmin
                  ? 'bg-[#816729] text-white border-[#816729]'
                  : 'bg-white text-[#4d4d4d] border-[#e8e8e8]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Admin View</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
