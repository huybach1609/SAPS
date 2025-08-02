import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, Button, Textarea } from "@heroui/react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import { requestService, RequestDetail } from "@/services/admin/requestService";

const RequestDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState<"approve" | "reject" | null>(
    null
  );

  // Fetch request details
  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await requestService.getRequestById(id);
        if (response.success && response.data) {
          setRequest(response.data as RequestDetail);
          setAdminNote(response.data.adminNotes || "");
          setResponseMessage(response.data.responseMessage || "");
        } else {
          setError("Failed to load request details");
        }
      } catch (err) {
        setError("Request not found or an error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id]);

  // Handle approve/reject actions
  const handleApproveReject = async (status: "Approved" | "Rejected") => {
    if (!id || !request) return;

    try {
      setLoading(true);
      const response = await requestService.updateRequestStatus(
        id,
        status,
        responseMessage,
        adminNote
      );

      if (response.success) {
        setRequest(response.data);
        setShowConfirm(null);
      } else {
        setError(`Failed to ${status.toLowerCase()} request`);
      }
    } catch (err) {
      setError("An error occurred while updating the request");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-blue-700">Loading request details...</span>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error || "Request details not available"}</p>
        <Button
          color="primary"
          className="mt-4"
          onPress={() => navigate("/admin/requests")}
        >
          Back to Request List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div>
        <Link
          to="/admin/requests"
          className="flex items-center text-blue-600 hover:underline mb-4"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Request List
        </Link>
        <div className="flex items-center">
          <FileText className="w-6 h-6 mr-2 text-indigo-900" />
          <h1 className="text-2xl font-bold text-indigo-900">
            Request Details
          </h1>
        </div>
        <p className="text-gray-500 mt-1">
          Review and manage request information
        </p>
      </div>

      {/* Request Overview Card */}
      <Card className="p-6 border border-blue-100 bg-blue-50">
        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <span className="mr-2">📋</span> Request Overview
        </h2>

        <div className="bg-blue-100 rounded-lg p-6">
          <div className="flex items-start">
            <div className="bg-blue-600 rounded-lg p-3 mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">
                {request.header}
              </h3>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Request ID</p>
                  <p className="font-medium">{request.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <p
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      request.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {request.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Request Information */}
      <Card className="p-6 border border-blue-100 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📝</span> Request Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Sender</p>
            <div className="border border-gray-200 rounded-md bg-white p-3">
              <p className="font-medium">
                {request.senderName} ({request.senderId})
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Sender Email</p>
            <div className="border border-gray-200 rounded-md bg-white p-3">
              <p className="font-medium">{request.senderEmail}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Submitted Date</p>
            <div className="border border-gray-200 rounded-md bg-white p-3">
              <p className="font-medium">
                {request.submittedDate} - {request.submittedTime}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Last Updated</p>
            <div className="border border-gray-200 rounded-md bg-white p-3">
              <p className="font-medium">{request.lastUpdated}</p>
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Request Category</p>
            <div className="border border-gray-200 rounded-md bg-white p-3">
              <p className="font-medium">{request.type}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Request Description */}
      <Card className="p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📄</span> Request Description
        </h2>

        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            Detailed Description
          </h3>
          <p className="text-gray-800 whitespace-pre-line">
            {request.detailedDescription}
          </p>
        </div>

        {request.changes && request.changes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">
              The specific changes I need to make are:
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              {request.changes.map((change, index) => (
                <li key={index} className="text-gray-800">
                  {change}
                </li>
              ))}
            </ul>
          </div>
        )}

        {request.detailedDescription &&
          request.detailedDescription.includes("attached") && (
            <div className="mt-4">
              <p className="text-gray-800 italic">
                I have attached my new identity card and utility bill as proof
                of address change. Please let me know if any additional
                documentation is required.
              </p>
            </div>
          )}
      </Card>

      {/* Uploaded Files */}
      {request.attachedFiles && request.attachedFiles.length > 0 && (
        <Card className="p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📎</span> Uploaded Files
          </h2>

          <div className="space-y-3">
            {request.attachedFiles.map((file) => (
              <div key={file.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center">
                  {/* File icon and basic info */}
                  <div
                    className={`p-2.5 rounded-md mr-4 ${file.fileFormat.includes("PDF") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{file.fileName}</h4>
                    <p className="text-sm text-gray-500">{file.fileType}</p>
                  </div>

                  {/* File metadata */}
                  <div className="hidden md:block text-right text-sm text-gray-500">
                    <div>{file.fileSize}</div>
                    <div>
                      {file.uploadDate} · {file.uploadTime}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="ml-4 flex">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="mr-2"
                      startContent={<Eye size={16} />}
                      onPress={() => window.open(file.url, "_blank")}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      startContent={<Download size={16} />}
                      onPress={() => window.open(file.url, "_blank")}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
            <p className="flex items-center text-sm">
              <CheckCircle size={16} className="mr-2" />
              <span className="font-semibold">File Verification:</span> All
              uploaded files have been scanned for security. Click "View" to
              preview or "Download" to save files locally for detailed review.
            </p>
          </div>
        </Card>
      )}

      {/* Admin Notes */}
      <Card className="p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🔒</span> Admin Notes
        </h2>

        <div>
          <p className="text-sm text-gray-600 mb-2">
            Internal Notes (visible to admins only):
          </p>
          <Textarea
            placeholder="Add internal notes about this request (visible to admins only)..."
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="w-full min-h-[100px] mb-4"
            disabled={request.status !== "Pending"}
          />
          <p className="text-xs text-gray-500 italic">
            These notes are for internal use and not visible to the user
          </p>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-2">
            Response Message (Optional):
          </p>
          <Textarea
            placeholder="Message to send to the user when processing this request..."
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            className="w-full min-h-[100px]"
            disabled={request.status !== "Pending"}
          />
          <p className="text-xs text-gray-500 italic mt-1">
            This message will be sent to the user along with the decision
          </p>
        </div>
      </Card>

      {/* Request Actions */}
      {request.status === "Pending" && (
        <Card className="p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚡</span> Request Actions
          </h2>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              color="danger"
              variant="flat"
              className="flex-1 md:flex-none"
              startContent={<XCircle size={20} />}
              onPress={() => setShowConfirm("reject")}
            >
              Reject Request
            </Button>
            <Button
              size="lg"
              color="success"
              variant="flat"
              className="flex-1 md:flex-none"
              startContent={<CheckCircle size={20} />}
              onPress={() => setShowConfirm("approve")}
            >
              Approve Request
            </Button>
          </div>

          <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-md">
            <p className="font-semibold">Action Required:</p>
            <p className="mt-1">
              This request requires review of uploaded documents before
              approval. Verify that all provided documents are valid and support
              the requested changes.
            </p>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">
              {showConfirm === "approve" ? "Approve Request" : "Reject Request"}
            </h3>
            <p className="text-default-600 mb-6">
              Are you sure you want to {showConfirm} this request?
              {responseMessage && (
                <>
                  <br />
                  <br />
                  <span className="font-medium">Response message:</span>
                  <br />
                  {responseMessage}
                </>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="flat" onPress={() => setShowConfirm(null)}>
                Cancel
              </Button>
              <Button
                color={showConfirm === "approve" ? "success" : "danger"}
                onPress={() =>
                  handleApproveReject(
                    showConfirm === "approve" ? "Approved" : "Rejected"
                  )
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
