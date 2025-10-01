using System;
using System.Collections.Generic;

namespace SAPLSServer.Models;

public partial class ParkingSession
{
    public string Id { get; set; } = null!;

    public string? VehicleId { get; set; }

    public string? DriverId { get; set; }

    public string? ParkingLotId { get; set; }

    public string LicensePlate { get; set; } = null!;

    public string? VehicleType { get; set; }

    public string CheckInStaffId { get; set; } = null!;

    public string? CheckOutStaffId { get; set; }

    public DateTime EntryDateTime { get; set; }

    public DateTime? ExitDateTime { get; set; }

    public DateTime? CheckOutDateTime { get; set; }

    public string? EntryFrontCaptureUrl { get; set; }

    public string? EntryBackCaptureUrl { get; set; }

    public string? ExitFrontCaptureUrl { get; set; }

    public string? ExitBackCaptureUrl { get; set; }

    public int? TransactionId { get; set; }

    public int? TransactionCount { get; set; }

    public string? PaymentInformation { get; set; }

    public string? PaymentMethod { get; set; }

    public decimal Cost { get; set; }

    public string Status { get; set; } = null!;

    public string PaymentStatus { get; set; } = null!;

    public string? ParkingFeeSchedule { get; set; }

    public virtual StaffProfile CheckInStaff { get; set; } = null!;

    public virtual StaffProfile? CheckOutStaff { get; set; }

    public virtual ClientProfile? Driver { get; set; }

    public virtual ParkingFeeSchedule? ParkingFeeScheduleNavigation { get; set; }

    public virtual ParkingLot? ParkingLot { get; set; }

    public virtual Vehicle? Vehicle { get; set; }
}
