import { getUserClaimsFromJwt } from '@/components/utils/jwtUtils';
import { apiUrl } from '@/config/base';
import { User } from '@/types/User';
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';



interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
  getRole: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const url = `${apiUrl}/api/auth/validate`;
      console.log(token);
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      const refreshedToken = data?.accessToken ?? data?.AccessToken ?? '';
      const userData = data?.user ?? data?.User ?? null;

      if (refreshedToken) {
        localStorage.setItem('auth_token', refreshedToken);
      }
      if (userData) {
        setUser(userData);
      } else {
        // Fallback: if API returns only token and not user, keep existing user
        setUser(prev => prev);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, remember: boolean = false) => {
    console.log(remember);
    
    try {
      const url = `${apiUrl}/api/auth/login`;
      
      
      console.log(url + " " + email + " " + password);

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      console.log(response);

      if (!response.ok) {
        let message = 'Login failed';
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await response.json();
            message = (data && (data.message || data.error)) || message;
          } else {
            const text = await response.text();
            if (text) message = text;
          }
        } catch (_) {
          // ignore parse errors and use default message
        }
        const err: any = new Error(message);
        err.status = response.status;
        throw err;
      }

      const { token, user } = await response.json();
      localStorage.setItem('auth_token', token);
      setUser(user);
      console.log(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };


  const getRole = (): string => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const { raw } = getUserClaimsFromJwt(token);
      return raw.role.toLowerCase();
    }
    return '';
  }

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    getRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 