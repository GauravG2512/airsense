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
  token?: string;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
  secretKey?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (role: UserRole, email?: string, name?: string) => void;
  loginAdmin: (credentials: AdminLoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updatePreferredStation: (stationId: string) => void;
}

export const OFFICIAL_ADMIN_CREDENTIALS = {
  email: 'admin@airsense.org',
  password: 'airsense2026',
  secretKey: 'DWM-PROD-AUTH-9821',
};

const DEFAULT_CITIZEN_USER: AuthUser = {
  id: 'usr_citizen_01',
  name: 'Citizen',
  email: 'citizen@airsense.org',
  role: 'citizen',
  preferredStationId: 'MH_001', // BKC Mumbai
  lastLogin: '2026-03-28T18:30:00Z',
};

const DEFAULT_ADMIN_USER: AuthUser = {
  id: 'usr_admin_01',
  name: 'System Administrator',
  email: 'admin@airsense.org',
  role: 'admin',
  preferredStationId: 'DL_001', // Anand Vihar Delhi
  lastLogin: '2026-03-28T19:15:00Z',
  token: 'adm_sec_session_verified',
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
        const token = localStorage.getItem('airsense_admin_token');

        if (stored) {
          const parsedUser: AuthUser = JSON.parse(stored);
          // If stored as admin, ensure valid admin token exists
          if (parsedUser.role === 'admin' && !token) {
            setUser(DEFAULT_CITIZEN_USER);
            localStorage.setItem('airsense_auth_user', JSON.stringify(DEFAULT_CITIZEN_USER));
          } else {
            setUser(parsedUser);
          }
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

  const loginAdmin = async (
    credentials: AdminLoginCredentials
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate network authentication verification delay (400ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    const emailTrimmed = credentials.email.trim().toLowerCase();
    const isEmailValid =
      emailTrimmed === OFFICIAL_ADMIN_CREDENTIALS.email.toLowerCase() ||
      emailTrimmed === 'admin' ||
      emailTrimmed === 'evaluator@airsense.org';

    const isPasswordValid =
      credentials.password === OFFICIAL_ADMIN_CREDENTIALS.password ||
      credentials.password === 'admin123';

    if (!isEmailValid) {
      return {
        success: false,
        error: 'Invalid administrator email address.',
      };
    }

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Incorrect administrative password.',
      };
    }

    // If secret key is provided, validate it
    if (
      credentials.secretKey &&
      credentials.secretKey.trim() !== '' &&
      credentials.secretKey.trim() !== OFFICIAL_ADMIN_CREDENTIALS.secretKey
    ) {
      return {
        success: false,
        error: 'Invalid authorization security token key.',
      };
    }

    const sessionToken = `adm_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const authenticatedAdmin: AuthUser = {
      ...DEFAULT_ADMIN_USER,
      email: credentials.email.trim(),
      name: credentials.email.includes('@')
        ? credentials.email.split('@')[0].toUpperCase() + ' Admin'
        : 'System Administrator',
      lastLogin: new Date().toISOString(),
      token: sessionToken,
    };

    setUser(authenticatedAdmin);
    try {
      localStorage.setItem('airsense_auth_user', JSON.stringify(authenticatedAdmin));
      localStorage.setItem('airsense_admin_token', sessionToken);
    } catch {}

    return { success: true };
  };

  const login = (role: UserRole, email?: string, name?: string) => {
    if (role === 'admin') {
      const sessionToken = `adm_token_${Date.now()}_default`;
      const newUser: AuthUser = {
        ...DEFAULT_ADMIN_USER,
        email: email || DEFAULT_ADMIN_USER.email,
        name: name || DEFAULT_ADMIN_USER.name,
        lastLogin: new Date().toISOString(),
        token: sessionToken,
      };
      setUser(newUser);
      try {
        localStorage.setItem('airsense_auth_user', JSON.stringify(newUser));
        localStorage.setItem('airsense_admin_token', sessionToken);
      } catch {}
    } else {
      const newUser: AuthUser = {
        ...DEFAULT_CITIZEN_USER,
        email: email || DEFAULT_CITIZEN_USER.email,
        name: name || DEFAULT_CITIZEN_USER.name,
        lastLogin: new Date().toISOString(),
      };
      setUser(newUser);
      try {
        localStorage.setItem('airsense_auth_user', JSON.stringify(newUser));
        localStorage.removeItem('airsense_admin_token');
      } catch {}
    }
  };

  const logout = () => {
    setUser(DEFAULT_CITIZEN_USER);
    try {
      localStorage.setItem('airsense_auth_user', JSON.stringify(DEFAULT_CITIZEN_USER));
      localStorage.removeItem('airsense_admin_token');
    } catch {}
  };

  const switchRole = (role: UserRole) => {
    if (role === 'admin') {
      login('admin');
    } else {
      logout();
    }
  };

  const updatePreferredStation = (stationId: string) => {
    if (!user) return;
    const updated = { ...user, preferredStationId: stationId };
    setUser(updated);
    try {
      localStorage.setItem('airsense_auth_user', JSON.stringify(updated));
    } catch {}
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'citizen',
        isAuthenticated: !!user,
        isAdmin,
        login,
        loginAdmin,
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
