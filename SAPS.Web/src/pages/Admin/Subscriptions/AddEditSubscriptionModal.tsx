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
  subscriptionService,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from "../../../services/subscription/subscriptionService";

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
  const [note, setNote] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({}); // For field-specific errors

  const isEditing = !!subscription;

  const statusOptions = [
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

  // Initialize form when editing
  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      // Convert duration from days to months (assuming duration is in days)
      setDurationMonths(subscription.duration.toString());
      setNote(subscription.note || subscription.description || "");
      setPrice(subscription.price.toString());
      setStatus(subscription.status.toLowerCase());
    }
    // Clear errors when editing a different subscription
    setError(null);
    setFieldErrors({});
  }, [subscription]);

  // Validate duration input
  const validateDuration = (days: string): string | null => {
    const num = parseInt(days);
    if (isNaN(num) || num <= 0) {
      return "Duration must be a positive number";
    }
    if (num > 1825) {
      // 5 years max
      return "Duration cannot exceed 1825 days";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({}); // Clear previous field errors

    // Validate duration
    const durationError = validateDuration(durationMonths);
    if (durationError) {
      setError(durationError);
      return;
    }

    setIsLoading(true);

    try {
      const subscriptionData = {
        name,
        duration: parseInt(durationMonths),
        price: parseFloat(price),
        status: status,
        note,
      };

      if (isEditing && subscription) {
        // Update subscription
        const updateData: UpdateSubscriptionRequest = {
          ...subscriptionData,
          id: subscription.id,
        };
        await subscriptionService.updateSubscription(updateData);
      } else {
        // Create subscription
        const createData: CreateSubscriptionRequest = subscriptionData;
        await subscriptionService.createSubscription(createData);
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error("Error saving subscription:", err);

      // Handle different types of errors
      if (err.response?.data) {
        const responseData = err.response.data;

        // Check for field-specific errors
        if (responseData.errors && typeof responseData.errors === "object") {
          setFieldErrors(responseData.errors);
          setError(null); // Clear general error when we have field errors
        } else {
          // General error message
          setError(
            responseData.message ||
              responseData.title ||
              `Failed to ${isEditing ? "update" : "create"} subscription`
          );
        }
      } else {
        setError(`Failed to ${isEditing ? "update" : "create"} subscription`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setName("");
    setDurationMonths("");
    setNote("");
    setPrice("");
    setStatus("active");
    setError(null);
    setFieldErrors({}); // Clear field errors
    onClose();
  };

  // Helper function to clear specific field error
  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Helper function to get field error message
  const getFieldError = (fieldName: string): string | undefined => {
    const errors = fieldErrors[fieldName];
    return errors && errors.length > 0 ? errors[0] : undefined;
  };

  // Helper function to render field-specific errors
  const renderFieldErrors = () => {
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;
    if (!hasFieldErrors) return null;

    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 text-red-700">
        <p className="font-medium mb-2">Please fix the following errors:</p>
        <ul className="list-disc list-inside space-y-1">
          {Object.entries(fieldErrors).map(([field, errors]) => (
            <li key={field}>
              <span className="font-medium">{field}:</span> {errors.join(", ")}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      className="rounded-b-lg"
      classNames={{
        body: "overflow-y-auto max-h-[80vh]",
        base: "max-h-[90vh]",
      }}
    >
      <ModalContent className="overflow-scroll">
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

          {/* Field-specific errors */}
          {renderFieldErrors()}

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
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError("Name");
                  }}
                  required
                  variant="bordered"
                  isInvalid={!!getFieldError("Name")}
                  errorMessage={getFieldError("Name")}
                />

                <Input
                  label="Price ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    clearFieldError("Price");
                  }}
                  required
                  variant="bordered"
                  isInvalid={!!getFieldError("Price")}
                  errorMessage={getFieldError("Price")}
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
                <Input
                  label="Duration (days)"
                  type="number"
                  min="1"
                  max="1825"
                  placeholder="Enter number of days"
                  value={durationMonths}
                  onChange={(e) => {
                    setDurationMonths(e.target.value);
                    clearFieldError("Duration");
                  }}
                  required
                  variant="bordered"
                  description="Enter duration in days (1-1825 days)"
                  isInvalid={!!getFieldError("Duration")}
                  errorMessage={getFieldError("Duration")}
                  startContent={<Clock size={16} className="text-gray-400" />}
                />

                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={[status]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    setStatus(selectedKey);
                    clearFieldError("Status");
                  }}
                  required
                  variant="bordered"
                  isInvalid={!!getFieldError("Status")}
                  errorMessage={getFieldError("Status")}
                >
                  {statusOptions.map((option) => (
                    <SelectItem key={option.key}>{option.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Note */}
            <div className="mb-6">
              <div className="flex items-center text-blue-900 mb-2">
                <FileText className="mr-2" size={20} />
                <h3 className="text-lg font-medium">Note</h3>
              </div>

              <Textarea
                label="Note"
                placeholder="Enter subscription note"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  clearFieldError("Note");
                }}
                required
                variant="bordered"
                minRows={3}
                maxRows={5}
                isInvalid={!!getFieldError("Note")}
                errorMessage={getFieldError("Note")}
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
                      Duration can be modified for both new and existing
                      subscriptions
                    </li>
                    <li>
                      Only active subscriptions are available for purchase
                    </li>
                    <li>Price changes will affect new subscriptions only</li>
                    <li>
                      Changes to existing subscriptions will apply immediately
                    </li>
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
    </Modal>
  );
};

export default AddEditSubscriptionModal;
