import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import carIcon from "@/assets/Default/car-icon.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement actual login logic
    setTimeout(() => {
      setIsLoading(false);
      navigate("/admin/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background gradient and logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#023E8A] to-[#0077B6] flex-col items-center justify-center p-12 text-white">
        <div className="w-32 h-32 bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <img src={carIcon} alt="SAPLS Logo" className="w-full h-full" />
        </div>
        <h1 className="text-4xl font-bold mt-8 mb-4">SAPLS</h1>
        <p className="text-xl mb-2">Semi-Automatic Parking Lot System</p>
        <p className="text-center text-white/80 max-w-md">
          Advanced parking management platform with automated license plate
          recognition, real-time monitoring, and comprehensive analytics.
        </p>

        <div className="grid grid-cols-4 gap-8 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-sm">AI Recognition</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm">Analytics</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <p className="text-sm">Secure</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-sm">Fast</p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
          <p className="text-gray-600 mb-8">
            Access the administrative dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your admin ID or email"
                size="lg"
                required
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50",
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                size="lg"
                required
                classNames={{
                  input: "bg-gray-50",
                  inputWrapper: "bg-gray-50",
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <Checkbox defaultSelected>
                <span className="text-sm">Remember me</span>
              </Checkbox>
              {/* <a
                href="#"
                className="text-sm text-[#023E8A] hover:text-[#0077B6]"
                onClick={(e) => e.preventDefault()}
              >
                Forgot Password?
              </a> */}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#023E8A] text-white"
              size="lg"
              isLoading={isLoading}
            >
              🔐 Log in to Dashboard
            </Button>
          </form>

          <div className="mt-6 p-4 bg-[#E7F4F7] rounded-lg">
            <div className="flex items-center gap-2 text-sm text-[#023E8A]">
              <span className="text-lg">🛡️</span>
              <p>
                <strong>Secure Access</strong>
                <br />
                This is a restricted area. Only authorized administrative
                personnel are permitted to access this system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
