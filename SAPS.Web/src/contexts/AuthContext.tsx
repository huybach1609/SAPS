import React, { createContext, useContext, useState, useEffect } from "react";
import { AdminAuthState, AdminUser } from "@/types/admin";
import { authService } from "@/services/authService";

interface AuthContextType extends AdminAuthState {
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AdminAuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("admin_token");
    if (token) {
      authService.getCurrentAdmin().then((response) => {
        if (response.success && response.data) {
          setAuth({
            isAuthenticated: true,
            user: response.data,
            token,
          });
        } else {
          // Token is invalid, remove it
          localStorage.removeItem("admin_token");
        }
      });
    }
  }, []);

  const login = (token: string, user: AdminUser) => {
    setAuth({
      isAuthenticated: true,
      user,
      token,
    });
  };

  const logout = () => {
    authService.logout();
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
