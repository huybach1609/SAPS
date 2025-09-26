import { parseJwt } from "@/components/utils/jwtUtils";
import { apiUrl } from "@/config/base";
import { User } from "@/types/User";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { getAuthHeaders } from "../utils/apiUtils";

// JWT refresh interval - 4 minutes in milliseconds
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000;

// Auth response type from API
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresAt: string;
  
}

// JWT Claims interface matching the structure from the backend
interface JwtClaims {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  jti: string;
  AdminRole?: string;
  exp: number;
  iss: string;
  aud: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  getUserRole: () => string;
  getAdminRole: () => string | null;
  hasPermission: (requiredRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<number | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      // Check for stored token
      const accessToken = localStorage.getItem("access_token");

      if (accessToken) {
        try {
          // Extract user info from JWT token
          const userData = extractUserDataFromToken(accessToken);
          setUser(userData);

          // Set up token refresh timer
          setupRefreshTokenTimer();
        } catch (error) {
          console.error("Invalid token:", error);
          // Clear invalid tokens
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Extract user data from JWT token
  const extractUserDataFromToken = (token: string): User => {
    try {
      const claims = parseJwt(token) as JwtClaims;

      return {
        id: claims[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
        email:
          claims[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        fullName:
          claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
        phoneNumber:
          claims[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone"
          ] || "",
        role: claims[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] as "admin" | "parkinglotowner",
        address: "",
        profileImageUrl: "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to extract user data from token:", error);
      throw new Error("Invalid token");
    }
  };

  // Setup token refresh timer
  const setupRefreshTokenTimer = () => {
    // Clear existing timer if any
    if (refreshTimerRef.current) {
      window.clearInterval(refreshTimerRef.current);
    }

    // Setup new timer for token refresh every 4 minutes
    refreshTimerRef.current = window.setInterval(() => {
      refreshAccessToken();
    }, TOKEN_REFRESH_INTERVAL);
  };

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const claims = parseJwt(token) as JwtClaims;
      const currentTime = Math.floor(Date.now() / 1000);
      return claims.exp < currentTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true; // Assume expired on error
    }
  };

  // Refresh token function
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      console.log("refreshToken: ", refreshToken);
      
      const response = await axios.post(`${apiUrl}/api/auth/refresh-token`, {
        refreshToken: refreshToken,
      }, {
        headers: getAuthHeaders(),
      });

      const data = response.data;
      console.log("data", data);
      
      if (data && data.accessToken) {
        // Save new tokens
        localStorage.setItem("access_token", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refresh_token", data.refreshToken);
        }

        // Update user info
        const userData = extractUserDataFromToken(data.accessToken);
        setUser(userData);

        console.log("Token refreshed successfully");
      } else {
        throw new Error("Invalid response from refresh token endpoint");
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout(); // Force logout on refresh failure
    }
  };

  const login = async (
    email: string,
    password: string,
    remember: boolean = false
  ) => {
    console.log("login",remember);
    console.log("apiUrl", apiUrl);
    try {
      const url = `${apiUrl}/api/auth/login`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("response", response);
      if (!response.ok) {
        let message = "Login failed";
        try {
          const contentType = response.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
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

      // Get auth response with access and refresh tokens
      const authResponse: AuthResponse = await response.json();

      // Store tokens in localStorage
      localStorage.setItem("access_token", authResponse.accessToken);
      localStorage.setItem("refresh_token", authResponse.refreshToken);

      // Extract user info from JWT token
      const userData = extractUserDataFromToken(authResponse.accessToken);
      setUser(userData);

      // Set up refresh token timer
      setupRefreshTokenTimer();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Clean up refresh timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  const getUserRole = (): string => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken && !isTokenExpired(accessToken)) {
      try {
        const claims = parseJwt(accessToken) as JwtClaims;
        const role =
          claims[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] || "";
        // Normalize the role to make sure it matches our app's expected format
        if (role.toLowerCase() === "admin") {
          return "admin";
        } else if (role.toLowerCase() === "parkinglotowner") {
          return "parkinglotowner";
        }
        return role;
      } catch (error) {
        console.error("Error decoding token for role:", error);
      }
    } else if (accessToken && isTokenExpired(accessToken)) {
      // If token is expired, try to refresh it
      refreshAccessToken().catch(() => {
        // If refresh fails, clear tokens
        logout();
      });
    }
    return "";
  };

  const getAdminRole = (): string | null => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken && !isTokenExpired(accessToken)) {
      try {
        const claims = parseJwt(accessToken) as JwtClaims;
        // Check for AdminRole which indicates if this is a HeadAdmin
        return claims.AdminRole || null;
      } catch (error) {
        console.error("Error decoding token for admin role:", error);
      }
    }
    return null;
  };

  const hasPermission = (requiredRoles: string[]): boolean => {
    const role = getUserRole();
    const adminRole = getAdminRole();

    // Check if user's role is in the required roles list
    if (role && requiredRoles.includes(role.toLowerCase())) {
      return true;
    }

    // Special check for HeadAdmin which has access to Admin routes
    if (adminRole && requiredRoles.includes("admin")) {
      return true;
    }

    return false;
  };

  const logout = async () => {
    try {
      // Gọi API để vô hiệu hóa refresh token nếu có
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          // Gọi API để vô hiệu hóa token, không cần đợi response
          await axios
            .post(`${apiUrl}/api/auth/logout`, {
              refreshToken,
            })
            .catch((error) => {
              console.log("Logout API error:", error);
            });
        } catch (error) {
          console.error("Error during logout API call:", error);
        }
      }
    } finally {
      // Clear tokens from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      // Xóa tất cả các token khác liên quan đến authentication nếu có
      localStorage.removeItem("user_data");

      // Clear user state
      setUser(null);

      // Clear refresh timer
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    getUserRole,
    getAdminRole,
    hasPermission,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
