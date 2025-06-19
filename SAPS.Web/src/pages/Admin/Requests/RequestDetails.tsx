import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Button, Textarea } from "@heroui/react";
import { ArrowLeft, CheckCircle, XCircle, FileText } from "lucide-react";
import { Request } from "@/types/index";

interface RequestDetails extends Request {
  requesterName: string;
  requesterType: "user" | "owner";
  attachments: {
    id: string;
    name: string;
    url: string;
  }[];
}

const mockRequestDetails: RequestDetails = {
  id: "1",
  header: "Account Verification Request",
  description:
    "Request for account verification with submitted documents including business registration and ID card.",
  status: "pending",
  submittedAt: new Date("2023-06-18"),
  updatedAt: new Date("2023-06-18"),
  internalNote: "",
  responseMessage: "",
  lastUpdatePersonId: "admin1",
  requesterName: "John Owner",
  requesterType: "owner",
  attachments: [
    {
      id: "att1",
      name: "business_registration.pdf",
      url: "#",
    },
    {
      id: "att2",
      name: "id_card.jpg",
      url: "#",
    },
  ],
};

const RequestDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request] = useState<RequestDetails>(mockRequestDetails);
  const [response, setResponse] = useState("");
  const [showConfirm, setShowConfirm] = useState<"approve" | "reject" | null>(
    null
  );

  const handleApprove = () => {
    // Implement approve logic
    setShowConfirm(null);
  };

  const handleReject = () => {
    // Implement reject logic
    setShowConfirm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => navigate("/admin/requests")}
          className="text-default-900"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-2xl font-bold">Request Details</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Request Info Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">{request.header}</h2>
                <p className="text-default-600 mt-1">
                  From: {request.requesterName}
                  <span
                    className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                      request.requesterType === "owner"
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary/20 text-secondary"
                    }`}
                  >
                    {request.requesterType === "owner" ? "Owner" : "User"}
                  </span>
                </p>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  request.status === "pending"
                    ? "bg-warning/20 text-warning"
                    : request.status === "approved"
                      ? "bg-success/20 text-success"
                      : "bg-danger/20 text-danger"
                }`}
              >
                {request.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-default-600">
                  Description
                </label>
                <p className="mt-1">{request.description}</p>
              </div>

              {request.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-default-600">
                    Attachments
                  </label>
                  <div className="mt-2 space-y-2">
                    {request.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 p-2 bg-default-100 rounded"
                      >
                        <FileText size={20} className="text-default-600" />
                        <span>{file.name}</span>
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          className="ml-auto"
                          onPress={() => window.open(file.url, "_blank")}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Response Section */}
          {request.status === "pending" && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Response</h3>
              <Textarea
                placeholder="Enter your response message..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="mb-4"
                minRows={4}
              />
              <div className="flex gap-3 justify-end">
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<XCircle />}
                  onPress={() => setShowConfirm("reject")}
                >
                  Reject Request
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  startContent={<CheckCircle />}
                  onPress={() => setShowConfirm("approve")}
                >
                  Approve Request
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Timeline Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Request Timeline</h3>
          <div className="space-y-4">
            <div className="relative pl-6 pb-4 border-l-2 border-default-200">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
              <p className="font-medium">Request Submitted</p>
              <p className="text-sm text-default-600">
                {request.submittedAt.toLocaleString()}
              </p>
            </div>
            {request.status !== "pending" && (
              <div className="relative pl-6 pb-4 border-l-2 border-default-200">
                <div
                  className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-4 border-background ${
                    request.status === "approved" ? "bg-success" : "bg-danger"
                  }`}
                />
                <p className="font-medium">
                  Request{" "}
                  {request.status === "approved" ? "Approved" : "Rejected"}
                </p>
                <p className="text-sm text-default-600">
                  {request.updatedAt.toLocaleString()}
                </p>
                {request.responseMessage && (
                  <p className="mt-2 text-sm">{request.responseMessage}</p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">
              {showConfirm === "approve" ? "Approve Request" : "Reject Request"}
            </h3>
            <p className="text-default-600 mb-6">
              Are you sure you want to {showConfirm} this request?
              {response && (
                <>
                  <br />
                  <br />
                  Response message:
                  <br />
                  {response}
                </>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="flat" onPress={() => setShowConfirm(null)}>
                Cancel
              </Button>
              <Button
                color={showConfirm === "approve" ? "success" : "danger"}
                onPress={
                  showConfirm === "approve" ? handleApprove : handleReject
                }
              >
                {showConfirm === "approve" ? "Approve" : "Reject"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RequestDetails;
