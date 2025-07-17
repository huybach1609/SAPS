import React, { useState } from "react";
import { Button, Card, Input, Checkbox, Textarea } from "@heroui/react";
import {
  Building2,
  CreditCard,
  Settings,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";

interface PaymentSourceInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branchName: string;
  swiftCode: string;
}

const AddParkingLotOwner: React.FC<{
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enableWhitelist, setEnableWhitelist] = useState(false);
  const [parkingInfo, setParkingInfo] = useState({
    name: "",
    address: "",
    totalSlots: "",
    hourlyRate: "",
    dailyRate: "",
    operatingHours: "Select operating hours",
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentSourceInfo>({
    bankName: "",
    accountNumber: "",
    accountName: "",
    branchName: "",
    swiftCode: "",
  });
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 1500);
  };

  const operatingHoursOptions = [
    "Select operating hours",
    "24/7 operation",
    "6AM-10PM",
    "8AM-8PM",
    "7AM-11PM",
    "Custom hours",
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto mt-">
      <div className="w-full max-w-3xl mx-4 my-8">
        <Card className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Building2 size={24} className="mr-2 text-blue-600" />
              <h2 className="text-xl font-bold">Add New Parking Lot Owner</h2>
            </div>
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              className="text-gray-500"
            >
              <X size={24} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Parking Lot Information */}
            <div className="space-y-4">
              <div className="flex items-center text-blue-600 font-semibold border-b pb-2">
                <Building2 size={20} className="mr-2" />
                <h3 className="text-lg">Parking Lot Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parking Lot Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={parkingInfo.name}
                    onChange={(e) =>
                      setParkingInfo({ ...parkingInfo, name: e.target.value })
                    }
                    placeholder="Enter parking lot name"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={parkingInfo.address}
                    onChange={(e) =>
                      setParkingInfo({
                        ...parkingInfo,
                        address: e.target.value,
                      })
                    }
                    placeholder="Include street number, street name, district, city, and postal code"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Parking Slots <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={parkingInfo.totalSlots}
                    onChange={(e) =>
                      setParkingInfo({
                        ...parkingInfo,
                        totalSlots: e.target.value,
                      })
                    }
                    placeholder="150"
                    type="number"
                    min="1"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Operating Hours <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={parkingInfo.operatingHours}
                    onChange={(e) =>
                      setParkingInfo({
                        ...parkingInfo,
                        operatingHours: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    {operatingHoursOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Hourly Rate ($) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={parkingInfo.hourlyRate}
                    onChange={(e) =>
                      setParkingInfo({
                        ...parkingInfo,
                        hourlyRate: e.target.value,
                      })
                    }
                    placeholder="5.00"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Daily Rate ($)
                  </label>
                  <Input
                    value={parkingInfo.dailyRate}
                    onChange={(e) =>
                      setParkingInfo({
                        ...parkingInfo,
                        dailyRate: e.target.value,
                      })
                    }
                    placeholder="25.00"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">
                    Optional - leave empty if not applicable
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Source Information */}
            <div className="space-y-4">
              <div className="flex items-center text-blue-600 font-semibold border-b pb-2">
                <CreditCard size={20} className="mr-2" />
                <h3 className="text-lg">Payment Source Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={paymentInfo.bankName}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        bankName: e.target.value,
                      })
                    }
                    placeholder="Enter bank name (e.g., Vietcombank, BIDV, Techcombank)"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={paymentInfo.accountNumber}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="12345678901234"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={paymentInfo.accountName}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        accountName: e.target.value,
                      })
                    }
                    placeholder="Account holder's full name"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Branch Name
                  </label>
                  <Input
                    value={paymentInfo.branchName}
                    onChange={(e) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        branchName: e.target.value,
                      })
                    }
                    placeholder="Branch name (e.g., Downtown)"
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">
                    Optional - specify if required by bank
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Swift Code / Bank Code
                </label>
                <Input
                  value={paymentInfo.swiftCode}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      swiftCode: e.target.value,
                    })
                  }
                  placeholder="BFTVVNVX"
                  className="w-full"
                />
                <span className="text-xs text-gray-500">
                  Optional - for international transfers
                </span>
              </div>

              {/* Payment Processing Note */}
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    <AlertTriangle size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-blue-800">
                      Payment Processing:
                    </h4>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>
                        • This account will receive payments from parking fees
                      </li>
                      <li>
                        • Account information will be verified before activation
                      </li>
                      <li>• Payment processing may take 1-2 business days</li>
                      <li>
                        • Owner can update payment details later through their
                        dashboard
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Initial Settings */}
            <div className="space-y-4">
              <div className="flex items-center text-blue-600 font-semibold border-b pb-2">
                <Settings size={20} className="mr-2" />
                <h3 className="text-lg">Initial Settings</h3>
              </div>

              <div className="flex items-start">
                <Checkbox
                  checked={enableWhitelist}
                  onChange={() => setEnableWhitelist(!enableWhitelist)}
                  className="mr-2"
                />
                <div>
                  <label className="text-sm font-medium">
                    Enable Whitelist Feature
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    When enabled, only pre-approved vehicles can park at this
                    facility
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (Optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the parking facility, special features, location highlights..."
                  className="w-full min-h-[100px]"
                />
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  <AlertTriangle size={16} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800">
                    Important Notice:
                  </h4>
                  <ul className="text-sm text-blue-700 mt-1">
                    <li>
                      • All information will be verified before account
                      activation
                    </li>
                    <li>
                      • The owner will receive login credentials via email
                    </li>
                    <li>
                      • Required fields are marked with{" "}
                      <span className="text-red-500">*</span>
                    </li>
                    <li>
                      • Changes to address and rates can be modified later by
                      the owner
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="flat"
                onPress={onClose}
                className="rounded-full"
                startContent={<X size={16} />}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                variant="flat"
                className="rounded-full"
                isLoading={isSubmitting}
                startContent={<Check size={16} />}
              >
                Add Owner
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddParkingLotOwner;
