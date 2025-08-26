// Incident status
export enum IncidentStatus {
    Open = 0,
    InProgress = 1,
    Resolved = 2,
    Closed = 3,
}

export enum IncidentPriority {
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3,
}

export enum FileType {
    Image = 0,
    Document = 1,
    Video = 2,
    Other = 3,
}

// Incident report DTO
export interface IncidentReport {
    id: string;
    header: string;
    reportedDate: string; // ISO string
    priority: string; // API returns string
    status: string; // API returns string
    description: string;
    attachments?: Attachment[];
    reporter: ReporterInfo;
}

export interface ReporterInfo {
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    createdAt: string; // ISO string
    status: string;
    parkingLotId: string;
}

// Attachment DTO
export interface Attachment {
    id: string;
    originalFileName: string;
    fileSize: number;
    fileExtension: string;
    downloadUrl: string;
    uploadedAt: string; // ISO string
}

// Legacy types for backward compatibility
export interface IncidentEvidence {
    id: string;
    incidentReportId: string;
    fileName: string;
    uploadAt: string; // ISO string
    fileType: FileType;
    fileSize: number;
    fileUrl: string;
} 