using SAPLDesktopApp.Models;
using System;

namespace SAPLDesktopApp.DTOs.Concrete.IncidenceReportDtos
{
    public class CreateIncidentReportRequest
    {
        public string Header { get; set; } = null!;
        public string Priority { get; set; } = null!;
        public string Description { get; set; } = null!;
        
        [Obsolete("Use UploadedEvidences instead")]
        public string[]? EvidenceFilePaths { get; set; }
        
        public UploadedIncidenceReportEvidence[]? UploadedEvidences { get; set; }
    }
}
