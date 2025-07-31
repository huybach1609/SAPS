import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { Package, DollarSign, Clock, FileText } from "lucide-react";
import {
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from "@/types/subscription";
import { subscriptionService } from "@/services/admin/subscription/subscriptionService";

interface AddEditSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription?: Subscription | null; // For editing
}

const AddEditSubscriptionModal: React.FC<AddEditSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subscription,
}) => {
  const [name, setName] = useState("");
  const [durationMonths, setDurationMonths] = useState(""); // Changed to months input
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [duplicateSubscription, setDuplicateSubscription] =
    useState<Subscription | null>(null);

  const isEditing = !!subscription;

  const statusOptions = [
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

  // Initialize form when editing
  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      // Convert duration from milliseconds to months
      const months = Math.round(
        subscription.duration / (30 * 24 * 60 * 60 * 1000)
      );
      setDurationMonths(months.toString());
      setDescription(subscription.description);
      setPrice(subscription.price.toString());
      setStatus(subscription.status);
    }
  }, [subscription]);

  // Validate duration input
  const validateDurationMonths = (months: string): string | null => {
    const num = parseInt(months);
    if (isNaN(num) || num <= 0) {
      return "Duration must be a positive number";
    }
    if (num > 60) {
      return "Duration cannot exceed 60 months";
    }
    return null;
  };

  // Check for duplicate subscriptions
  const checkForDuplicate = async (
    name: string,
    durationInMs: number
  ): Promise<Subscription | null> => {
    try {
      const response = await subscriptionService.getAllSubscriptions();
      if (response.success && response.data) {
        const duplicate = response.data.find(
          (sub) =>
            sub.name.toLowerCase() === name.toLowerCase() &&
            sub.duration === durationInMs &&
            (!isEditing || sub.id !== subscription?.id)
        );
        return duplicate || null;
      }
    } catch (error) {
      console.error("Error checking for duplicates:", error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate duration
    const durationError = validateDurationMonths(durationMonths);
    if (durationError) {
      setError(durationError);
      return;
    }

    // Convert months to milliseconds
    const durationInMs = parseInt(durationMonths) * 30 * 24 * 60 * 60 * 1000;

    // Check for duplicates only when creating new subscription or editing name/duration
    if (
      !isEditing ||
      (subscription &&
        (subscription.name !== name || subscription.duration !== durationInMs))
    ) {
      const duplicate = await checkForDuplicate(name, durationInMs);
      if (duplicate) {
        setDuplicateSubscription(duplicate);
        setShowDuplicateConfirm(true);
        return;
      }
    }

    await submitSubscription(false);
  };

  const submitSubscription = async (replaceDuplicate: boolean = false) => {
    setIsLoading(true);
    setShowDuplicateConfirm(false);

    try {
      const durationInMs = parseInt(durationMonths) * 30 * 24 * 60 * 60 * 1000;

      const subscriptionData = {
        name,
        duration: durationInMs,
        description,
        price: parseFloat(price),
        status: status as "active" | "inactive",
      };

      // If replacing duplicate, set the old one to inactive
      if (replaceDuplicate && duplicateSubscription) {
        await subscriptionService.updateSubscriptionStatus(
          duplicateSubscription.id,
          "inactive"
        );
      }

      let result;
      if (isEditing && subscription) {
        const updateData: UpdateSubscriptionDto = {
          name: subscriptionData.name,
          description: subscriptionData.description,
          price: subscriptionData.price,
          status: subscriptionData.status,
        };
        result = await subscriptionService.updateSubscription(
          subscription.id,
          updateData
        );
      } else {
        const createData: CreateSubscriptionDto = subscriptionData;
        result = await subscriptionService.createSubscription(createData);
      }

      if (result.success) {
        onSuccess();
        handleClose();
      } else {
        setError(
          result.error ||
            `Failed to ${isEditing ? "update" : "create"} subscription`
        );
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
    setName("");
    setDurationMonths("");
    setDescription("");
    setPrice("");
    setStatus("active");
    setError(null);
    setShowDuplicateConfirm(false);
    setDuplicateSubscription(null);
    onClose();
  };

  const getDurationLabel = (durationMs: number): string => {
    const months = Math.round(durationMs / (30 * 24 * 60 * 60 * 1000));
    return `${months} Month(s)`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      className="rounded-b-lg"
    >
      <ModalContent className="overflow-hidden">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Subscription" : "Add New Subscription"}
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            {isEditing
              ? "Update the subscription details below"
              : "Create a new subscription plan with the details below"}
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-6">
              <div className="flex items-center text-blue-900 mb-2">
                <Package className="mr-2" size={20} />
                <h3 className="text-lg font-medium">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Subscription Name"
                  placeholder="Enter subscription name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  variant="bordered"
                />

                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  variant="bordered"
                  startContent={
                    <DollarSign size={16} className="text-gray-400" />
                  }
                />
              </div>
            </div>

            {/* Duration and Status */}
            <div className="mb-6">
              <div className="flex items-center text-blue-900 mb-2">
                <Clock className="mr-2" size={20} />
                <h3 className="text-lg font-medium">Duration & Status</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEditing ? (
                  <Input
                    label="Duration"
                    value={getDurationLabel(subscription?.duration || 0)}
                    isReadOnly
                    variant="bordered"
                    description="Duration cannot be changed. Create a new subscription for different duration."
                  />
                ) : (
                  <Input
                    label="Duration (months)"
                    type="number"
                    min="1"
                    max="60"
                    placeholder="Enter number of months"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    required
                    variant="bordered"
                    description="Enter duration in months (1-60 months)"
                    startContent={<Clock size={16} className="text-gray-400" />}
                  />
                )}

                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={[status]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setStatus(selectedKey);
                  }}
                  required
                  variant="bordered"
                >
                  {statusOptions.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center text-blue-900 mb-2">
                <FileText className="mr-2" size={20} />
                <h3 className="text-lg font-medium">Description</h3>
              </div>

              <Textarea
                label="Description"
                placeholder="Enter subscription description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                variant="bordered"
                minRows={3}
                maxRows={5}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>
                      Subscription duration cannot be modified once created
                    </li>
                    <li>To change duration, create a new subscription plan</li>
                    <li>
                      Only active subscriptions are available for purchase
                    </li>
                    <li>Price changes will affect new subscriptions only</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="light"
                onPress={handleClose}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isLoading}
                startContent={!isLoading && <Package size={16} />}
                className="text-white"
              >
                {isLoading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Subscription"
                    : "Create Subscription"}
              </Button>
            </div>
          </form>
        </div>
      </ModalContent>

      {/* Duplicate Confirmation Dialog */}
      {showDuplicateConfirm && (
        <Modal
          isOpen={showDuplicateConfirm}
          onClose={() => setShowDuplicateConfirm(false)}
          placement="center"
          size="md"
        >
          <ModalContent>
            <div className="bg-orange-900 text-white px-6 py-4">
              <h3 className="text-lg font-semibold">
                Duplicate Subscription Found
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-3">
                  A subscription with the same name and duration already exists:
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="font-medium text-orange-800">
                    {duplicateSubscription?.name}
                  </div>
                  <div className="text-sm text-orange-600">
                    Duration:{" "}
                    {getDurationLabel(duplicateSubscription?.duration || 0)}
                  </div>
                  <div className="text-sm text-orange-600">
                    Status: {duplicateSubscription?.status}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Do you want to set the existing subscription to inactive and
                create this new one?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="light"
                  onPress={() => setShowDuplicateConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="warning"
                  onPress={() => submitSubscription(true)}
                  isLoading={isLoading}
                >
                  {isLoading ? "Processing..." : "Yes, Replace"}
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Modal>
  );
};

export default AddEditSubscriptionModal;
