import React, { useEffect, useState } from "react";
import { Card, Button, Input, Textarea } from "@heroui/react";
import {
  Building2,
  CreditCard,
  X,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import {
  parkingLotOwnerService,
  CreateOwnerRequest,
  CreateParkingLotRequest,
  Subscription,
} from "../../../services/parkingLotOwner/parkingLotOwnerService";

interface ParkingLotForm {
  id: string;
  name: string;
  description: string;
  address: string;
  totalParkingSlot: number;
  subscriptionId: string;
}

const AddParkingLotOwner: React.FC<{
  onClose: () => void;
  onSuccess?: () => void;
}> = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // Owner Information
  const [ownerForm, setOwnerForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    clientKey: "",
    apiKey: "",
    checkSumKey: "",
  });

  // Parking Lots
  const [parkingLots, setParkingLots] = useState<ParkingLotForm[]>([
    {
      id: Date.now().toString(),
      name: "",
      description: "",
      address: "",
      totalParkingSlot: 1,
      subscriptionId: "",
    },
  ]);

  // Load active subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subs = await parkingLotOwnerService.getActiveSubscriptions();
        setSubscriptions(subs);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    fetchSubscriptions();
  }, []);

  // Generate UUID for parkingLotOwnerId (max 20 characters)
  const generateUUID = (): string => {
    // Generate a short UUID with timestamp + random chars (20 chars max)
    const timestamp = Date.now().toString(36); // Convert timestamp to base36
    const randomPart = Math.random().toString(36).substring(2, 8); // 6 random chars
    const shortId = `${timestamp}-${randomPart}`.substring(0, 20);
    return shortId;
  };

  // Helper function to convert milliseconds to days for display
  const millisecondsTodays = (milliseconds: number): number => {
    return Math.round(milliseconds / (1000 * 60 * 60 * 24));
  };

  // Add new parking lot
  const addParkingLot = () => {
    setParkingLots([
      ...parkingLots,
      {
        id: Date.now().toString(),
        name: "",
        description: "",
        address: "",
        totalParkingSlot: 1,
        subscriptionId: "",
      },
    ]);
  };

  // Remove parking lot
  const removeParkingLot = (id: string) => {
    if (parkingLots.length > 1) {
      setParkingLots(parkingLots.filter((lot) => lot.id !== id));
    }
  };

  // Update parking lot
  const updateParkingLot = (
    id: string,
    field: keyof ParkingLotForm,
    value: any
  ) => {
    setParkingLots(
      parkingLots.map((lot) =>
        lot.id === id ? { ...lot, [field]: value } : lot
      )
    );
  };

  // Form validation
  const validateForm = (): boolean => {
    // Validate owner info
    if (!ownerForm.email || !ownerForm.fullName || !ownerForm.phone) {
      alert("Please fill in all required owner information fields.");
      return false;
    }

    if (!ownerForm.clientKey || !ownerForm.apiKey || !ownerForm.checkSumKey) {
      alert("Please fill in all API configuration keys.");
      return false;
    }

    // Validate parking lots
    for (const lot of parkingLots) {
      if (
        !lot.name ||
        !lot.address ||
        !lot.subscriptionId ||
        lot.totalParkingSlot < 1
      ) {
        alert("Please fill in all required parking lot information.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate parkingLotOwnerId
      const parkingLotOwnerId = generateUUID();

      // 1. Register the owner
      const ownerData: CreateOwnerRequest = {
        email: ownerForm.email,
        password: "TempPassword123@", // Fixed password
        fullName: ownerForm.fullName,
        phone: ownerForm.phone,
        profileImage: null, // Empty profile image
        parkingLotOwnerId: parkingLotOwnerId,
        clientKey: ownerForm.clientKey,
        apiKey: ownerForm.apiKey,
        checkSumKey: ownerForm.checkSumKey,
      };

      await parkingLotOwnerService.registerOwner(ownerData);

      // 2. Create parking lots
      const parkingLotPromises = parkingLots.map((lot) => {
        const lotData: CreateParkingLotRequest = {
          parkingLotOwnerId: parkingLotOwnerId,
          subscriptionId: lot.subscriptionId,
          name: lot.name,
          description: lot.description,
          address: lot.address,
          totalParkingSlot: lot.totalParkingSlot,
        };
        return parkingLotOwnerService.createParkingLot(lotData);
      });

      await Promise.all(parkingLotPromises);

      alert("Owner and parking lots created successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating owner:", error);
      alert("Failed to create owner. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed mt-0 inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto ">
      <div className="w-full max-w-4xl mx-4 my-8">
        <Card className="p-6 max-h-[90vh] overflow-y-auto">
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
            {/* Owner Information */}
            <div className="space-y-4">
              <div className="flex items-center text-blue-600 font-semibold border-b pb-2">
                <User size={20} className="mr-2" />
                <h3 className="text-lg">Owner Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={ownerForm.email}
                    onChange={(e) =>
                      setOwnerForm({ ...ownerForm, email: e.target.value })
                    }
                    placeholder="owner@example.com"
                    type="email"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={ownerForm.fullName}
                    onChange={(e) =>
                      setOwnerForm({ ...ownerForm, fullName: e.target.value })
                    }
                    placeholder="John Doe"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  value={ownerForm.phone}
                  onChange={(e) =>
                    setOwnerForm({ ...ownerForm, phone: e.target.value })
                  }
                  placeholder="+1234567890"
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* API Configuration Keys */}
            <div className="space-y-4">
              <div className="flex items-center text-blue-600 font-semibold border-b pb-2">
                <CreditCard size={20} className="mr-2" />
                <h3 className="text-lg">API Configuration Keys</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Client Key <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={ownerForm.clientKey}
                    onChange={(e) =>
                      setOwnerForm({ ...ownerForm, clientKey: e.target.value })
                    }
                    placeholder="Enter client key"
                    required
                    className="w-full font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={ownerForm.apiKey}
                    onChange={(e) =>
                      setOwnerForm({ ...ownerForm, apiKey: e.target.value })
                    }
                    placeholder="Enter API key"
                    required
                    className="w-full font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Checksum Key <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={ownerForm.checkSumKey}
                    onChange={(e) =>
                      setOwnerForm({
                        ...ownerForm,
                        checkSumKey: e.target.value,
                      })
                    }
                    placeholder="Enter checksum key"
                    required
                    className="w-full font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Parking Lots */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-blue-600 font-semibold border-b pb-2">
                <div className="flex items-center">
                  <Building2 size={20} className="mr-2" />
                  <h3 className="text-lg">Parking Lots</h3>
                </div>
                <Button
                  type="button"
                  size="sm"
                  color="primary"
                  variant="light"
                  startContent={<Plus size={16} />}
                  onPress={addParkingLot}
                >
                  Add Parking Lot
                </Button>
              </div>

              {parkingLots.map((lot, index) => (
                <div
                  key={lot.id}
                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      Parking Lot #{index + 1}
                    </h4>
                    {parkingLots.length > 1 && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => removeParkingLot(lot.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Parking Lot Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={lot.name}
                        onChange={(e) =>
                          updateParkingLot(lot.id, "name", e.target.value)
                        }
                        placeholder="Downtown Parking"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Total Parking Slots{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={lot.totalParkingSlot.toString()}
                        onChange={(e) =>
                          updateParkingLot(
                            lot.id,
                            "totalParkingSlot",
                            parseInt(e.target.value) || 1
                          )
                        }
                        type="number"
                        min="1"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={lot.address}
                      onChange={(e) =>
                        updateParkingLot(lot.id, "address", e.target.value)
                      }
                      placeholder="123 Main St, City, State, ZIP"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Subscription Plan <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={lot.subscriptionId}
                      onChange={(e) =>
                        updateParkingLot(
                          lot.id,
                          "subscriptionId",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Select a subscription plan</option>
                      {subscriptions.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} - ${sub.price} (
                          {millisecondsTodays(sub.duration)} days)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <Textarea
                      value={lot.description}
                      onChange={(e) =>
                        updateParkingLot(lot.id, "description", e.target.value)
                      }
                      placeholder="Brief description of the parking facility..."
                      className="w-full"
                      minRows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <div className="flex items-start">
                <AlertTriangle
                  size={16}
                  className="text-blue-600 mr-2 mt-0.5"
                />
                <div>
                  <h4 className="font-semibold text-blue-800">
                    Important Notice:
                  </h4>
                  <ul className="text-sm text-blue-700 mt-1 list-disc list-inside">
                    <li>
                      Owner will be created with status "Active" by default
                    </li>
                    <li>
                      All parking lots will be created with their selected
                      subscription plans
                    </li>
                    <li>
                      API keys must be valid for payment processing integration
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
                Create Owner & Parking Lots
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddParkingLotOwner;
