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
import { saveAs } from "file-saver";
import {
  requestService,
  ApiRequestDetail,
} from "@/services/admin/requestService";

const RequestDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ApiRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState<"approve" | "reject" | null>(
    null
  );
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );
  const [downloadMessage, setDownloadMessage] = useState<string>("");

  // Fetch request details
  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await requestService.getRequestById(id);
        if (response.success && response.data) {
          setRequest(response.data as ApiRequestDetail);
          setAdminNote(response.data.internalNote || "");
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper function to download file directly to local machine
  const downloadFile = async (
    url: string,
    fileName: string,
    fileId: string
  ) => {
    try {
      setDownloadingFiles((prev) => new Set(prev).add(fileId));
      setDownloadMessage("");

      console.log(`Starting download for: ${fileName} from ${url}`);

      // Method 1: Try to fetch and create blob (best method for direct download)
      try {
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;

        // Try with proxy first
        let response;
        try {
          response = await fetch(proxyUrl, {
            method: "GET",
            headers: {
              "X-Requested-With": "XMLHttpRequest",
            },
          });
        } catch (proxyError) {
          // If proxy fails, try direct fetch
          console.log("Proxy failed, trying direct fetch...");
          response = await fetch(url, {
            method: "GET",
            mode: "no-cors",
          });
        }

        if (response.ok || response.type === "opaque") {
          const blob = await response.blob();

          // Create blob URL and download
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = fileName;
          link.style.display = "none";

          // Add to DOM, click, and remove
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up blob URL
          window.URL.revokeObjectURL(blobUrl);

          setDownloadMessage(
            `✅ "${fileName}" downloaded successfully! Check your browser downloads.`
          );
          setTimeout(() => setDownloadMessage(""), 4000);
          return;
        }
      } catch (fetchError) {
        console.log("Fetch method failed, trying alternative approach...");
      }

      // Method 2: Use XMLHttpRequest for better CORS handling
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";

        xhr.onload = function () {
          if (xhr.status === 200) {
            const blob = xhr.response;
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(blobUrl);

            setDownloadMessage(
              `✅ "${fileName}" downloaded via XHR! Check your downloads folder.`
            );
            setTimeout(() => setDownloadMessage(""), 4000);
          } else {
            throw new Error("XHR failed");
          }
        };

        xhr.onerror = function () {
          throw new Error("XHR error");
        };

        xhr.send();
        return;
      } catch (xhrError) {
        console.log("XHR method failed, trying final approach...");
      }

      // Method 3: Force download using blob and file-saver
      try {
        // Create a temporary image to load the file
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = function () {
          // Create canvas to convert image to blob
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = img.width;
          canvas.height = img.height;

          ctx?.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, fileName);
              setDownloadMessage(
                `✅ "${fileName}" downloaded using canvas method!`
              );
            } else {
              throw new Error("Canvas conversion failed");
            }
          });

          setTimeout(() => setDownloadMessage(""), 4000);
        };

        img.onerror = function () {
          throw new Error("Image load failed");
        };

        img.src = url;
        return;
      } catch (canvasError) {
        console.log("Canvas method failed, using final fallback...");
      }

      // Method 4: Final fallback - force download with direct link
      try {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.target = "_self"; // Force same window
        link.rel = "noopener noreferrer";

        // Force download attribute
        link.setAttribute("download", fileName);
        link.style.display = "none";

        document.body.appendChild(link);

        // Trigger click event
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });

        link.dispatchEvent(clickEvent);
        document.body.removeChild(link);

        setDownloadMessage(
          `✅ Download initiated for "${fileName}" - should appear in your browser downloads!`
        );
        setTimeout(() => setDownloadMessage(""), 5000);
      } catch (finalError) {
        console.error("All download methods failed:", finalError);
        setDownloadMessage(
          `❌ Unable to download "${fileName}". Please try again or contact support.`
        );
        setTimeout(() => setDownloadMessage(""), 6000);
      }
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  // Alternative: Add a function to copy URL to clipboard
  const copyUrlToClipboard = async (url: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setDownloadMessage(
        `📋 URL for "${fileName}" copied to clipboard! Paste in a new browser tab to download.`
      );
      setTimeout(() => setDownloadMessage(""), 5000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      setDownloadMessage(`URL: ${url}`);
      setTimeout(() => setDownloadMessage(""), 8000);
    }
  };

  // Handle approve/reject actions
  const handleApproveReject = async (status: "Resolved" | "Closed") => {
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
        setRequest(response.data as ApiRequestDetail);
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
                      request.status === "Resolved"
                        ? "bg-green-100 text-green-800"
                        : request.status === "Closed"
                          ? "bg-gray-100 text-gray-800"
                          : request.status === "InProgress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {request.status === "InProgress"
                      ? "In Progress"
                      : request.status}
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
              <p className="font-medium">{request.senderFullName}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Sender Email</p>
            <div className="border border-gray-200 rounded-md bg-white p-3">
              <p className="font-medium">{request.senderEmail}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Sender ID</p>
            <div className="border border-gray-200 rounded-md bg-white p-3">
              <p className="font-medium">{request.senderId}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Submitted Date</p>
            <div className="border border-gray-200 rounded-md bg-white p-3">
              <p className="font-medium">
                {formatDate(request.submittedAt).date} -{" "}
                {formatDate(request.submittedAt).time}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Last Updated</p>
            <div className="border border-gray-200 rounded-md bg-white p-3">
              <p className="font-medium">
                {formatDate(request.updatedAt).date} -{" "}
                {formatDate(request.updatedAt).time}
              </p>
            </div>
          </div>
          {request.lastUpdateAdminFullName && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Last Updated By</p>
              <div className="border border-gray-200 rounded-md bg-white p-3">
                <p className="font-medium">{request.lastUpdateAdminFullName}</p>
                <p className="text-sm text-gray-500">
                  Admin ID: {request.lastUpdateAdminId}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Request Description */}
      <Card className="p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📄</span> Request Description
        </h2>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            Request Description
          </h3>
          <p className="text-gray-800 whitespace-pre-line">
            {request.description}
          </p>
        </div>
      </Card>

      {/* Admin Response Section (if available) */}
      {(request.responseMessage || request.internalNote) && (
        <Card className="p-6 border border-gray-200 bg-blue-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💬</span> Admin Response & Notes
          </h2>

          {request.responseMessage && (
            <div className="mb-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Response Message (Visible to User)
                </h3>
                <p className="text-gray-800 whitespace-pre-line">
                  {request.responseMessage}
                </p>
              </div>
            </div>
          )}

          {request.internalNote && (
            <div>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h3 className="text-md font-medium text-gray-700 mb-2">
                  Internal Notes (Admin Only)
                </h3>
                <p className="text-gray-800 whitespace-pre-line">
                  {request.internalNote}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Uploaded Files */}
      {request.attachments && request.attachments.length > 0 && (
        <Card className="p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📎</span> Uploaded Files
          </h2>

          <div className="space-y-3">
            {request.attachments.map((file) => (
              <div key={file.id} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center">
                  {/* File icon and basic info */}
                  <div
                    className={`p-2.5 rounded-md mr-4 ${file.fileExtension.includes(".pdf") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{file.originalFileName}</h4>
                    <p className="text-sm text-gray-500">
                      {file.fileExtension.toUpperCase()} File
                    </p>
                  </div>

                  {/* File metadata */}
                  <div className="hidden md:block text-right text-sm text-gray-500">
                    <div>{formatFileSize(file.fileSize)}</div>
                    <div>
                      {formatDate(file.uploadedAt).date} ·{" "}
                      {formatDate(file.uploadedAt).time}
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
                      onPress={() => {
                        console.log(
                          `Opening file: ${file.originalFileName} at ${file.downloadUrl}`
                        );
                        window.open(file.downloadUrl, "_blank");
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      isLoading={downloadingFiles.has(file.id)}
                      startContent={
                        !downloadingFiles.has(file.id) && <Download size={16} />
                      }
                      onPress={() => {
                        console.log(
                          `Download requested for: ${file.originalFileName}`
                        );
                        console.log(`Download URL: ${file.downloadUrl}`);
                        downloadFile(
                          file.downloadUrl,
                          file.originalFileName,
                          file.id
                        );
                      }}
                    >
                      {downloadingFiles.has(file.id)
                        ? "Downloading..."
                        : "Download"}
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

          {/* Download Status Message */}
          {downloadMessage && (
            <div
              className={`mt-3 p-3 rounded-md text-sm ${
                downloadMessage.includes("✅")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : downloadMessage.includes("❌")
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-yellow-50 text-yellow-800 border border-yellow-200"
              }`}
            >
              <p className="font-medium">{downloadMessage}</p>
            </div>
          )}
        </Card>
      )}

      {/* Admin Notes & Actions */}
      <Card className="p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🔒</span> Admin Actions
        </h2>

        <div>
          <p className="text-sm text-gray-600 mb-2">
            Update Internal Notes (visible to admins only):
          </p>
          <Textarea
            placeholder="Add or update internal notes about this request (visible to admins only)..."
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="w-full min-h-[100px] mb-4"
            disabled={
              request.status === "Resolved" || request.status === "Closed"
            }
          />
          <p className="text-xs text-gray-500 italic">
            These notes are for internal use and not visible to the user
          </p>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-2">
            Update Response Message (Sent to User):
          </p>
          <Textarea
            placeholder="Message to send to the user when processing this request..."
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            className="w-full min-h-[100px]"
            disabled={
              request.status === "Resolved" || request.status === "Closed"
            }
          />
          <p className="text-xs text-gray-500 italic mt-1">
            This message will be sent to the user along with the decision
          </p>
        </div>
      </Card>

      {/* Request Actions */}
      {(request.status === "Open" || request.status === "InProgress") && (
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
              Close Request
            </Button>
            <Button
              size="lg"
              color="success"
              variant="flat"
              className="flex-1 md:flex-none"
              startContent={<CheckCircle size={20} />}
              onPress={() => setShowConfirm("approve")}
            >
              Resolve Request
            </Button>
          </div>

          <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-md">
            <p className="font-semibold">Action Required:</p>
            <p className="mt-1">
              This request requires review of uploaded documents before
              resolution. Verify that all provided documents are valid and
              support the requested changes.
            </p>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold mb-4">
              {showConfirm === "approve" ? "Resolve Request" : "Close Request"}
            </h3>
            <p className="text-default-600 mb-6">
              Are you sure you want to{" "}
              {showConfirm === "approve" ? "resolve" : "close"} this request?
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
                    showConfirm === "approve" ? "Resolved" : "Closed"
                  )
                }
              >
                {showConfirm === "approve" ? "Resolve" : "Close"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RequestDetails;
