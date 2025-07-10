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
    priority: IncidentPriority;
    description: string;
    descriptionNote?: string;
    status: IncidentStatus;
    reporter: ReporterInfo;
    incidentEvidences?: IncidentEvidence[];
    
}
export interface ReporterInfo
{
    id: string;
    name?: string;
    role?: string;
}

// Incident evidence DTO
export interface IncidentEvidence {
    id: string;
    incidentReportId: string;
    fileName: string;
    uploadAt: string; // ISO string
    fileType: FileType;
    fileSize: number;
    fileUrl: string;
} 