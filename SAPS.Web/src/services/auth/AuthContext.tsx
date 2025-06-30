import { apiUrl } from '@/config/base';
import { User } from '@/types/User';
import React, { createContext, useContext, useState, useEffect } from 'react';



interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
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
      const url = apiUrl + '/api/auth/validate?isAdmin=' + (token === "admin");
      console.log(url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      if (response.ok) {
        const userData = await response.json();
        console.log(userData);
        setUser(userData);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, remember: boolean = false) => {
    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch(apiUrl + '/api/auth/login?isAdmin=' + remember, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed');
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