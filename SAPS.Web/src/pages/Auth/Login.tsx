import React, { useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { Camera, ChartColumnBig, Lock, Zap } from "lucide-react";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/react";
import logoImage from "../../assets/Logo/logo.svg";

export default function LoginPage() {
  const { login, loading, getUserRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password, remember);

      // After successful login, redirect based on user role
      const userRole = getUserRole();
      // const adminRole = getAdminRole();

      if (userRole) {
        switch (userRole.toLowerCase()) {
          case "admin":
            navigate("/admin");
            break;
          case "parkinglotowner":
            navigate("/owner/parking-info");
            break;
          default:
            navigate("/unauthorized");
        }
      } else {
        // Fallback if role is not set
        navigate("/unauthorized");
      }
    } catch (err) {
      console.log(err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in (err as any)
            ? String((err as any).message)
            : "Invalid email or password";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full">
        {/* Left side */}
        <div className="w-1/2 flex flex-col items-center justify-center p-12 bg-gradient-to-b from-blue-900 to-blue-700 text-white">
          <div className="mb-8">
            <div className="bg-blue-100 p-6 rounded-2xl shadow-lg inline-flex justify-center items-center">
              <span role="img" aria-label="car" className="text-4xl">
                <img src={logoImage} alt="SAPLS Logo" className="w-32 h-32 object-cover" />
              </span>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 text-center">SAPLS</h1>
          <h2 className="text-xl font-medium mb-8 text-center text-blue-100">
            Semi-Automatic Parking Lot System
          </h2>
          <p className="mb-12 text-center max-w-xs text-blue-100 leading-relaxed">
            Advanced parking management platform with automated license plate
            recognition, real-time monitoring, and comprehensive analytics.
          </p>
          <div className="grid grid-cols-4 gap-6 w-full max-w-md">
            <div className="flex flex-col items-center">
              <div className="bg-blue-800 p-2.5 rounded-lg mb-2 inline-flex justify-center items-center">
                <span
                  role="img"
                  aria-label="AI Recognition"
                  className="text-xl"
                >
                  <Camera size={24} />
                </span>
              </div>
              <span className="text-xs text-blue-100">AI Recognition</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-800 p-2.5 rounded-lg mb-2 inline-flex justify-center items-center">
                <span role="img" aria-label="Analytics" className="text-xl">
                  <ChartColumnBig size={24} />
                </span>
              </div>
              <span className="text-xs text-blue-100">Analytics</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-800 p-2.5 rounded-lg mb-2 inline-flex justify-center items-center">
                <span role="img" aria-label="Secure" className="text-xl">
                  <Lock size={24} />
                </span>
              </div>
              <span className="text-xs text-blue-100">Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-800 p-2.5 rounded-lg mb-2 inline-flex justify-center items-center">
                <span role="img" aria-label="Fast" className="text-xl">
                  <Zap size={24} />
                </span>
              </div>
              <span className="text-xs text-blue-100">Fast</span>
            </div>
          </div>
        </div>
        {/* Right side */}
        <div className="w-1/2 flex flex-col justify-center p-12 bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">
              Login
            </h2>
            <p className="text-gray-500 mb-8">
              Access the administrative dashboard
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-blue-900 font-semibold mb-2">
                  ID / Email
                </label>
                <Input
                  type="email"
                  className="w-full"
                  placeholder="Enter your admin ID or email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  size="lg"
                  variant="bordered"
                />
              </div>
              <div>
                <label className="block text-blue-900 font-semibold mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  className="w-full"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="lg"
                  variant="bordered"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center text-gray-700">
                  <Checkbox
                    className="mr-2"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    size="sm"
                  />
                  Remember me
                </label>
                {/* <a href="#" className="text-blue-600 text-sm hover:underline">
                  Forgot Password?
                </a> */}
              </div>
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
                disabled={submitting || loading}
                startContent={<Lock size={18} />}
                size="lg"
              >
                {submitting || loading
                  ? "Signing In..."
                  : "Sign In to Dashboard"}
              </Button>
            </form>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg flex items-start gap-3 border border-blue-200">
              <span className="text-blue-600 text-2xl">🛡️</span>
              <div>
                <div className="font-semibold text-blue-900">Secure Access</div>
                <div className="text-sm text-blue-700">
                  This is a restricted area. Only authorized administrative
                  personnel are permitted to access this system.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
