import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  FileText,
  Camera,
  Download,
  User,
  Calendar,
  Clock,
  FolderOpen,
  FileSearch,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Button, Card, CardFooter, Link } from "@heroui/react";

import {
  ModalImageInfo,
  ModalImageInfoContent,
} from "../ParkingHistory/HistoryManagement/ParkingHistoryDetail";

import {
  IncidentReport,
  IncidentStatus,
  IncidentPriority,
  FileType,
} from "@/types/IncidentReport";

import {
  fetchIncidentById,
  updateIncidentStatus,
} from "@/services/parkinglot/incidentService";
import { formatDate, formatTime } from "@/components/utils/stringUtils";

const IncidentDetail: React.FC = () => {
  const { parkingLotId, incidentId } = useParams();

  const [incident, setIncident] = useState<IncidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<IncidentStatus | null>(
    null
  );
  const [modalImageInfo, setModalImageInfo] =
    useState<ModalImageInfoContent | null>(null);

  useEffect(() => {
    const loadIncident = async () => {
      if (!parkingLotId || !incidentId) {
        setError("Missing parking lot ID or incident ID");
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        const incidentData = await fetchIncidentById(parkingLotId, incidentId);

        setIncident(incidentData);
        setCurrentStatus(incidentData.status);
      } catch (err) {
        console.error("Error loading incident:", err);
        setError("Failed to load incident details");
      } finally {
        setLoading(false);
      }
    };

    loadIncident();
  }, [parkingLotId, incidentId]);

  // Show loading state
  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading incident details...</p>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error || !incident) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Incident
            </h2>
            <p className="text-gray-600">{error || "Incident not found"}</p>
          </div>
        </div>
      </>
    );
  }

  const getPriorityColor = (priority: IncidentPriority): string => {
    switch (priority) {
      case IncidentPriority.Low:
        return "bg-green-100 text-green-800";
      case IncidentPriority.Medium:
        return "bg-yellow-100 text-yellow-800";
      case IncidentPriority.High:
        return "bg-orange-100 text-orange-800";
      case IncidentPriority.Critical:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: IncidentPriority): string => {
    return IncidentPriority[priority];
  };

  const getStatusColor = (status: IncidentStatus): string => {
    switch (status) {
      case IncidentStatus.Open:
        return "bg-red-100 text-red-800";
      case IncidentStatus.InProgress:
        return "bg-blue-100 text-blue-800";
      case IncidentStatus.Resolved:
        return "bg-green-100 text-green-800";
      case IncidentStatus.Closed:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: IncidentStatus): string => {
    switch (status) {
      case IncidentStatus.InProgress:
        return "Under Investigation";
      default:
        return IncidentStatus[status];
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";

    return Math.round(bytes / (1024 * 1024)) + " MB";
  };

  const formatUploadTime = (isoString: string): string => {
    const date = new Date(isoString);

    return date.toLocaleTimeString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!parkingLotId || !incidentId) {
      console.error("Missing parking lot ID or incident ID");

      return;
    }

    try {
      const updatedIncident = await updateIncidentStatus(
        parkingLotId,
        incidentId,
        newStatus
      );

      setCurrentStatus(newStatus);
      setIncident(updatedIncident);
      console.log(`Status changed to: ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error("Error updating incident status:", error);
    }
  };

  const imageFiles =
    incident.incidentEvidences?.filter((e) => e.fileType === FileType.Image) ??
    [];
  const documentFiles =
    incident.incidentEvidences?.filter(
      (e) => e.fileType === FileType.Document
    ) ?? [];

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900">Incident Details</h1>
        </div>
        <p className="text-gray-600">
          Complete information about incident {incident.id}
        </p>
      </div>

      {/* Incident Overview */}
      <div className=" rounded-lg shadow-sm border  mb-3">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              Incident Overview
            </h2>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              {/* <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                                <div className="text-white text-2xl">🚗</div>
                            </div> */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {incident.header}
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Incident ID</p>
                    <p className="font-semibold text-gray-900">{incident.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Priority</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(incident.priority)}`}
                    >
                      {getPriorityText(incident.priority)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus || IncidentStatus.Open)}`}
                    >
                      {getStatusText(currentStatus || IncidentStatus.Open)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Information */}
      <div className=" rounded-lg shadow-sm border  mb-3">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              Incident Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">
                  {formatDate(incident.reportedDate)}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-primary-900/80">
                  {formatTime(incident.reportedDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reported By
            </label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">
                {incident.reporter.name} ({incident.reporter.role})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Incident Description
            </label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 leading-relaxed">
                {incident.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Files & Documentation */}
      <div className="rounded-lg shadow-sm border  mb-3">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              Evidence Files & Documentation
            </h2>
          </div>

          {/* Photo Evidence */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Photo Evidence ({imageFiles.length} files)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {imageFiles.map((file, index) => (
                <Card
                  key={file.id}
                  isFooterBlurred
                  className="border-none relative "
                  radius="lg"
                >
                  <div className="absolute top-2 left-2 bg-blue-500/20 backdrop-blur-md text-xs px-3 py-1 rounded z-20 text-white font-semibold shadow">
                    {file.fileName}
                  </div>
                  <Button
                    isIconOnly
                    aria-label="View full size exit image"
                    className="focus:outline-none w-full h-48 md:h-64 block"
                    type="button"
                    onPress={() =>
                      setModalImageInfo({
                        imageUrl: file.fileUrl || "",
                        time: file.uploadAt || "",
                        licensePlate: file.fileName || "",
                      })
                    }
                  >
                    <img
                      alt={`Image ${index + 1}`}
                      className="object-cover w-full  rounded-t-lg"
                      src={file.fileUrl || ""}
                    />
                  </Button>
                  <CardFooter className="justify-between before:bg-white/40 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {/* {imageDescriptions[index] || `Image ${index + 1}`} */}
                    </div>
                    <div className="text-xs text-gray-500">
                      Uploaded: {formatUploadTime(file.uploadAt)}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Documents & Reports */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary-500/80" />
              <h3 className="text-lg font-medium text-foreground">
                Documents & Reports ({documentFiles.length} files)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4  rounded-lg border border-primary-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-background" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground-500">
                        {file.fileName.includes("incident_report")
                          ? "Incident Report Form"
                          : "Customer Statement"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {file.fileName}
                      </div>
                      <div className="text-xs text-gray-500">
                        Size: {formatFileSize(file.fileSize)} | Uploaded:{" "}
                        {formatUploadTime(file.uploadAt)}
                      </div>
                    </div>
                  </div>
                  <Link
                    download
                    className="text-primary"
                    href={file.fileUrl}
                    rel="noopener noreferrer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Information */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">
                  Evidence Information:
                </p>
                <p className="text-sm text-blue-800">
                  All evidence files are automatically timestamped and stored
                  securely. Files can be downloaded for insurance claims or
                  legal proceedings. Original files are preserved in their
                  uploaded format.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Management */}
      <div className="rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            {/* <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div> */}
            <h2 className="text-xl font-semibold text-gray-900">
              Status Management
            </h2>
          </div>

          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Current Status
            </p>
            <div className="inline-block">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(currentStatus || IncidentStatus.Open)}`}
              >
                {getStatusText(currentStatus || IncidentStatus.Open)}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Change Status To:
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Button
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                onPress={() => handleStatusChange(IncidentStatus.Open)}
              >
                <FolderOpen className="w-4 h-4 " /> Open
              </Button>
              <Button
                className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                onPress={() => handleStatusChange(IncidentStatus.InProgress)}
              >
                <FileSearch className="w-4 h-4 " /> Under Investigation
              </Button>
              <Button
                className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                onPress={() => handleStatusChange(IncidentStatus.Resolved)}
              >
                <CheckCircle className="w-4 h-4 " /> Resolved
              </Button>
              <Button
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                onPress={() => handleStatusChange(IncidentStatus.Closed)}
              >
                <Lock className="w-4 h-4 " /> Closed
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">
                  Status Change Notice:
                </p>
                <p className="text-sm text-blue-800">
                  Changing the incident status will update the record and notify
                  relevant staff members. Please ensure all necessary actions
                  have been completed before marking as resolved or closed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalImageInfo
        imageUrl={modalImageInfo?.imageUrl || ""}
        isOpen={!!modalImageInfo}
        licensePlate={modalImageInfo?.licensePlate || ""}
        time={modalImageInfo?.time || ""}
        onClose={() => setModalImageInfo(null)}
      />
    </>
  );
};

export default IncidentDetail;
