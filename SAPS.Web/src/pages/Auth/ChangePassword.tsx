import React, { useState } from "react";
import { Card, Button, Input } from "@heroui/react";
import { Key, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/services/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { parseJwt } from "@/components/utils/jwtUtils";
import { apiUrl } from "@/config/base";

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { getUserRole } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Get user ID from token
  const getUserId = (): string => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      try {
        const claims = parseJwt(accessToken) as any;
        return claims[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];
      } catch (error) {
        console.error("Error extracting user ID from token:", error);
      }
    }
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate old password
    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = "Current password is required";
    }

    // Validate new password
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.newPassword
      )
    ) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, number and special character";
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Check if new password is same as old password
    if (
      formData.oldPassword === formData.newPassword &&
      formData.oldPassword.trim()
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error("Unable to get user ID");
      }

      const response = await fetch(`${apiUrl}/api/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          id: userId,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Failed to change password";

        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors) {
            // Handle validation errors from API
            const apiErrors: Record<string, string> = {};
            for (const [field, messages] of Object.entries(errorData.errors)) {
              if (Array.isArray(messages)) {
                apiErrors[field.toLowerCase()] = messages[0];
              }
            }
            setErrors(apiErrors);
            return;
          }
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        if (response.status === 400) {
          setErrors({ oldPassword: "Current password is incorrect" });
        } else {
          setErrors({ general: errorMessage });
        }
        return;
      }

      // Success
      setSuccessMessage("Password changed successfully!");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect after success
      setTimeout(() => {
        const role = getUserRole();
        if (role === "admin") {
          navigate("/admin/requests");
        } else {
          navigate("/owner/parking-info");
        }
      }, 2000);
    } catch (error) {
      console.error("Change password error:", error);
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 justify-items-center p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="bg-blue-100 p-3 rounded-full">
          <Key className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-600">Update your account password</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl w-full">
        <Card className="p-8">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Current Password */}
            <div>
              <Input
                label="Current Password"
                type={showOldPassword ? "text" : "password"}
                value={formData.oldPassword}
                onChange={(e) =>
                  handleInputChange("oldPassword", e.target.value)
                }
                isInvalid={!!errors.oldPassword}
                errorMessage={errors.oldPassword}
                placeholder="Enter your current password"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? (
                      <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <Eye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                required
              />
            </div>

            {/* New Password */}
            <div>
              <Input
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                isInvalid={!!errors.newPassword}
                errorMessage={errors.newPassword}
                placeholder="Enter your new password"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <Eye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters with uppercase,
                lowercase, number and special character
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
                placeholder="Confirm your new password"
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <Eye className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              color="primary"
              className="w-full text-white"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Security Note */}
      <div className="max-w-4xl w-full">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Security Tip:</strong> Use a strong password that you don't
            use for other accounts. After changing your password, you may need
            to log in again on other devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
