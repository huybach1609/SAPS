import React, { useState } from "react";
import { Modal, ModalContent, Button, Input } from "@heroui/react";
import { X } from "lucide-react";
import { adminService, CreateAdminDto } from "@/services/admin/adminService";

// Hàm tạo ID ngắn gọn, đảm bảo tối đa 20 ký tự
const generateShortId = () => {
  // Tạo chuỗi ngẫu nhiên có độ dài 20 ký tự
  return "xxxxxxxxxxxxxxxxxxxx".replace(/[x]/g, function () {
    const r = Math.floor(Math.random() * 36);
    return r.toString(36); // Sử dụng base 36 (0-9, a-z) để tạo ID ngắn hơn
  });
};

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddAdminModal: React.FC<AddAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Tạo AdminId ngắn gọn và mật khẩu mặc định
      const adminId = generateShortId();
      const defaultPassword = "TempPassword123@";

      // Gửi thông tin admin bao gồm cả AdminId và Password
      const adminDto: CreateAdminDto = {
        adminId,
        fullName,
        email,
        phone,
        password: defaultPassword,
      };

      const result = await adminService.createAdmin(adminDto);

      if (result.success) {
        onSuccess();
        handleClose();
      } else {
        setError(result.error || "Failed to create admin");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setError(null);
    onClose();
  };

  console.log("AddAdminModal render - isOpen:", isOpen);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      className="rounded-b-lg"
    >
      <ModalContent className="overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add New Administrator</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Create a new admin account with system access
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-6">
              <div className="flex items-center text-blue-900 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <span className="text-blue-900 text-sm">👤</span>
                </div>
                <h3 className="font-medium">Personal Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter administrator's full name"
                    className="w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="admin@sapls.com"
                      className="w-full"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Will be used for login and notifications
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm mb-6">
              <div className="flex items-start">
                <div className="mr-3 mt-1 text-blue-500 flex items-center justify-center bg-blue-100 rounded-full w-8 h-8">
                  <span className="text-lg">🔑</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">
                    Password & Access:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">•</span> System will auto-generate
                      a secure temporary password
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span> Login credentials will be
                      sent to the admin's email address
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span> Admin will be required to
                      change password on first login
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span> Email will include login
                      instructions and system access details
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Notice Box */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 shadow-sm mb-6">
              <div className="flex items-start">
                <div className="mr-3 mt-1 text-amber-500 flex items-center justify-center bg-amber-100 rounded-full w-8 h-8">
                  <span className="text-lg">⚠️</span>
                </div>
                <div>
                  <h4 className="font-medium text-amber-900 mb-2">
                    Important Notice:
                  </h4>
                  <ul className="text-sm text-amber-800 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">•</span> Only Head Administrators
                      can create new admin accounts
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span> New admin will have access
                      to sensitive system functions
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span> All admin actions are
                      logged for security auditing
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span> Admin accounts can be
                      modified or deactivated later
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 mb-2">
              <Button
                variant="flat"
                color="default"
                onClick={handleClose}
                className="rounded-md"
                startContent={<X size={18} />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                className="bg-blue-600 text-white rounded-md"
                isLoading={isLoading}
                isDisabled={isLoading}
              >
                Create Admin
              </Button>
            </div>
          </form>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default AddAdminModal;
