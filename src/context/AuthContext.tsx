'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'citizen' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferredStationId?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole, email?: string, name?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updatePreferredStation: (stationId: string) => void;
}

const DEFAULT_CITIZEN_USER: AuthUser = {
  id: 'usr_citizen_01',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  role: 'citizen',
  preferredStationId: 'MH_001', // BKC Mumbai
  lastLogin: '2026-03-28T18:30:00Z',
};

const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'usr_admin_01',
  name: 'Dr. Vikram Malhotra',
  email: 'admin@airsense.org',
  role: 'admin',
  preferredStationId: 'DL_001', // Anand Vihar Delhi
  lastLogin: '2026-03-28T19:15:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      try {
        const stored = localStorage.getItem('airsense_auth_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          // By default initialize as Citizen for immediate friendly dashboard usability
          setUser(DEFAULT_CITIZEN_USER);
          localStorage.setItem('airsense_auth_user', JSON.stringify(DEFAULT_CITIZEN_USER));
        }
      } catch {
        setUser(DEFAULT_CITIZEN_USER);
      } finally {
        setIsInitialized(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const login = (role: UserRole, email?: string, name?: string) => {
    let newUser: AuthUser;
    if (role === 'admin') {
      newUser = {
        ...DEFAULT_ADMIN_USER,
        email: email || DEFAULT_ADMIN_USER.email,
        name: name || DEFAULT_ADMIN_USER.name,
        lastLogin: new Date().toISOString(),
      };
    } else {
      newUser = {
        ...DEFAULT_CITIZEN_USER,
        email: email || DEFAULT_CITIZEN_USER.email,
        name: name || DEFAULT_CITIZEN_USER.name,
        lastLogin: new Date().toISOString(),
      };
    }
    setUser(newUser);
    try {
      localStorage.setItem('airsense_auth_user', JSON.stringify(newUser));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('airsense_auth_user');
    } catch {}
  };

  const switchRole = (role: UserRole) => {
    login(role);
  };

  const updatePreferredStation = (stationId: string) => {
    if (!user) return;
    const updated = { ...user, preferredStationId: stationId };
    setUser(updated);
    try {
      localStorage.setItem('airsense_auth_user', JSON.stringify(updated));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        updatePreferredStation,
      }}
    >
      {isInitialized ? children : <div className="min-h-screen bg-white" />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
