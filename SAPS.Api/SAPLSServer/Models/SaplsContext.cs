using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SAPLSServer.Models;

public partial class SaplsContext : DbContext
{
    public SaplsContext()
    {
    }

    public SaplsContext(DbContextOptions<SaplsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AdminProfile> AdminProfiles { get; set; }

    public virtual DbSet<AttachedFile> AttachedFiles { get; set; }

    public virtual DbSet<ClientProfile> ClientProfiles { get; set; }

    public virtual DbSet<IncidenceEvidence> IncidenceEvidences { get; set; }

    public virtual DbSet<IncidenceReport> IncidenceReports { get; set; }

    public virtual DbSet<ParkingFeeSchedule> ParkingFeeSchedules { get; set; }

    public virtual DbSet<ParkingLot> ParkingLots { get; set; }

    public virtual DbSet<ParkingLotOwnerProfile> ParkingLotOwnerProfiles { get; set; }

    public virtual DbSet<ParkingLotShift> ParkingLotShifts { get; set; }

    public virtual DbSet<ParkingSession> ParkingSessions { get; set; }

    public virtual DbSet<Request> Requests { get; set; }

    public virtual DbSet<RequestAttachedFile> RequestAttachedFiles { get; set; }

    public virtual DbSet<SharedVehicle> SharedVehicles { get; set; }

    public virtual DbSet<ShiftDiary> ShiftDiaries { get; set; }

    public virtual DbSet<StaffProfile> StaffProfiles { get; set; }

    public virtual DbSet<Subscription> Subscriptions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    public virtual DbSet<WhiteList> WhiteLists { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AdminProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__AdminPro__1788CC4CE4751A99");

            entity.ToTable("AdminProfile");

            entity.HasIndex(e => e.AdminId, "IX_AdminProfile_AdminId");

            entity.HasIndex(e => e.Role, "IX_AdminProfile_Role");

            entity.HasIndex(e => e.UserId, "UQ__AdminPro__1788CC4DD8C91BA2").IsUnique();

            entity.HasIndex(e => e.AdminId, "UQ__AdminPro__719FE4893278F34A").IsUnique();

            entity.Property(e => e.UserId).HasMaxLength(36);
            entity.Property(e => e.AdminId).HasMaxLength(20);
            entity.Property(e => e.CreatedBy).HasMaxLength(36);
            entity.Property(e => e.Role).HasMaxLength(20);
            entity.Property(e => e.UpdatedBy).HasMaxLength(36);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.InverseCreatedByNavigation)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_AdminProfile_CreatedBy");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.InverseUpdatedByNavigation)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK_AdminProfile_UpdatedBy");

            entity.HasOne(d => d.User).WithOne(p => p.AdminProfile)
                .HasForeignKey<AdminProfile>(d => d.UserId)
                .HasConstraintName("FK__AdminProfile_UserId");
        });

        modelBuilder.Entity<AttachedFile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Attached__3214EC07E4AB6E4D");

            entity.ToTable("AttachedFile");

            entity.HasIndex(e => e.OriginalFileName, "IX_AttachedFile_Name");

            entity.HasIndex(e => e.UploadAt, "IX_AttachedFile_UploadAt");

            entity.HasIndex(e => e.Id, "UQ__Attached__3214EC069CF63EC4").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.FileExtension).HasMaxLength(10);
            entity.Property(e => e.FileHash).HasMaxLength(64);
            entity.Property(e => e.OriginalFileName).HasMaxLength(255);
            entity.Property(e => e.StorageFileName).HasMaxLength(255);
            entity.Property(e => e.UploadAt).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<ClientProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__ClientPr__1788CC4C088F8864");

            entity.ToTable("ClientProfile");

            entity.HasIndex(e => e.CitizenId, "IX_ClientProfile_CitizenId");

            entity.HasIndex(e => e.ShareCode, "IX_ClientProfile_ShareCode");

            entity.HasIndex(e => e.UserId, "UQ__ClientPr__1788CC4D922DF55A").IsUnique();

            entity.HasIndex(e => e.ShareCode, "UQ__ClientPr__208770411C2E5E47").IsUnique();

            entity.HasIndex(e => e.CitizenId, "UQ__ClientPr__6E49FA0D3E44AD25").IsUnique();

            entity.Property(e => e.UserId).HasMaxLength(36);
            entity.Property(e => e.BackCitizenIdCardImageUrl).HasMaxLength(500);
            entity.Property(e => e.CitizenId).HasMaxLength(50);
            entity.Property(e => e.DeviceToken).HasMaxLength(255);
            entity.Property(e => e.FrontCitizenIdCardImageUrl).HasMaxLength(500);
            entity.Property(e => e.Nationality).HasMaxLength(100);
            entity.Property(e => e.PlaceOfOrigin).HasMaxLength(255);
            entity.Property(e => e.PlaceOfResidence).HasMaxLength(255);
            entity.Property(e => e.Sex).HasDefaultValue(true);
            entity.Property(e => e.ShareCode).HasMaxLength(20);
            entity.Property(e => e.UpdatedBy).HasMaxLength(36);

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.ClientProfiles)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK_ClientProfile_UpdatedBy");

            entity.HasOne(d => d.User).WithOne(p => p.ClientProfile)
                .HasForeignKey<ClientProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ClientProfile_UserId");
        });

        modelBuilder.Entity<IncidenceEvidence>(entity =>
        {
            entity.HasKey(e => e.AttachedFileId).HasName("PK__Incidenc__4A7D88DD9CF4CF40");

            entity.ToTable("IncidenceEvidence");

            entity.HasIndex(e => e.AttachedFileId, "UQ__Incidenc__4A7D88DC1153EED6").IsUnique();

            entity.Property(e => e.AttachedFileId).HasMaxLength(36);
            entity.Property(e => e.IncidenceReportId).HasMaxLength(36);

            entity.HasOne(d => d.AttachedFile).WithOne(p => p.IncidenceEvidence)
                .HasForeignKey<IncidenceEvidence>(d => d.AttachedFileId)
                .HasConstraintName("FK_IncidenceEvidence_AttachedFileId");

            entity.HasOne(d => d.IncidenceReport).WithMany(p => p.IncidenceEvidences)
                .HasForeignKey(d => d.IncidenceReportId)
                .HasConstraintName("FK_IncidenceEvidence_IncidenceReportId");
        });

        modelBuilder.Entity<IncidenceReport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Incidenc__3214EC07D412DE08");

            entity.ToTable("IncidenceReport");

            entity.HasIndex(e => e.Priority, "IX_IncidenceReport_Priority");

            entity.HasIndex(e => e.ReportedDate, "IX_IncidenceReport_ReportedDate");

            entity.HasIndex(e => e.ReporterId, "IX_IncidenceReport_ReporterId");

            entity.HasIndex(e => e.Status, "IX_IncidenceReport_Status");

            entity.HasIndex(e => e.Id, "UQ__Incidenc__3214EC06DE213DDD").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Header).HasMaxLength(255);
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.Priority)
                .HasMaxLength(20)
                .HasDefaultValue("Medium");
            entity.Property(e => e.ReportedDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ReporterId).HasMaxLength(36);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Open");

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.IncidenceReports)
                .HasForeignKey(d => d.ParkingLotId)
                .HasConstraintName("FK_IncidenceReport_ParkingLot");

            entity.HasOne(d => d.Reporter).WithMany(p => p.IncidenceReports)
                .HasForeignKey(d => d.ReporterId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_IncidenceReport_ReporterId");
        });

        modelBuilder.Entity<ParkingFeeSchedule>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ParkingF__3214EC07FB93CA07");

            entity.ToTable("ParkingFeeSchedule");

            entity.HasIndex(e => e.ForVehicleType, "IX_ParkingFeeSchedule_ForVehicleType");

            entity.HasIndex(e => e.IsActive, "IX_ParkingFeeSchedule_IsActive");

            entity.HasIndex(e => e.ParkingLotId, "IX_ParkingFeeSchedule_ParkingLotId");

            entity.HasIndex(e => e.Id, "UQ__ParkingF__3214EC06AC9140F0").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.AdditionalFee).HasColumnType("decimal(8, 2)");
            entity.Property(e => e.AdditionalMinutes).HasDefaultValue(60);
            entity.Property(e => e.DayOfWeeks)
                .HasMaxLength(50)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.ForVehicleType)
                .HasMaxLength(20)
                .HasDefaultValue("Car");
            entity.Property(e => e.InitialFee).HasColumnType("decimal(8, 2)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.ParkingFeeSchedules)
                .HasForeignKey(d => d.ParkingLotId)
                .HasConstraintName("ParkingFeeSchedule_fk10");
        });

        modelBuilder.Entity<ParkingLot>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ParkingL__3214EC07D98A3F04");

            entity.ToTable("ParkingLot");

            entity.HasIndex(e => e.CreatedAt, "IX_ParkingLot_CreatedAt");

            entity.HasIndex(e => e.ParkingLotOwnerId, "IX_ParkingLot_ParkingLotOwnerId");

            entity.HasIndex(e => e.Status, "IX_ParkingLot_Status");

            entity.HasIndex(e => e.Id, "UQ__ParkingL__3214EC066134085F").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CreatedBy).HasMaxLength(36);
            entity.Property(e => e.Description)
                .HasMaxLength(1000)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.ParkingLotOwnerId).HasMaxLength(36);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Active");
            entity.Property(e => e.SubscriptionId).HasMaxLength(36);
            entity.Property(e => e.TempSubscriptionId).HasMaxLength(36);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedBy).HasMaxLength(36);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ParkingLotCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_ParkingLot_CreatedBy");

            entity.HasOne(d => d.ParkingLotOwner).WithMany(p => p.ParkingLots)
                .HasForeignKey(d => d.ParkingLotOwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ParkingLot_fk8");

            entity.HasOne(d => d.Subscription).WithMany(p => p.ParkingLots)
                .HasForeignKey(d => d.SubscriptionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_ParkingLot_SubscriptionId");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.ParkingLotUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK_ParkingLot_UpdatedBy");
        });

        modelBuilder.Entity<ParkingLotOwnerProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__ParkingL__1788CC4C6E170A53");

            entity.ToTable("ParkingLotOwnerProfile");

            entity.HasIndex(e => e.ParkingLotOwnerId, "IX_ParkingLotOwnerProfile_ParkingLotOwnerId");

            entity.HasIndex(e => e.UserId, "UQ__ParkingL__1788CC4D0B965F24").IsUnique();

            entity.HasIndex(e => e.ParkingLotOwnerId, "UQ__ParkingL__F2333F3FF0F8151B").IsUnique();

            entity.Property(e => e.UserId).HasMaxLength(36);
            entity.Property(e => e.ApiKey).HasMaxLength(255);
            entity.Property(e => e.CheckSumKey).HasMaxLength(255);
            entity.Property(e => e.ClientKey).HasMaxLength(255);
            entity.Property(e => e.CreatedBy).HasMaxLength(36);
            entity.Property(e => e.ParkingLotOwnerId).HasMaxLength(20);
            entity.Property(e => e.UpdatedBy).HasMaxLength(36);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ParkingLotOwnerProfileCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_ParkingLotOwnerProfile_CreatedBy");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.ParkingLotOwnerProfileUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK_ParkingLotOwnerProfile_UpdatedBy");

            entity.HasOne(d => d.User).WithOne(p => p.ParkingLotOwnerProfile)
                .HasForeignKey<ParkingLotOwnerProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ParkingLotOwnerProfile_fk0");
        });

        modelBuilder.Entity<ParkingLotShift>(entity =>
        {
            entity.ToTable("ParkingLotShift");

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.DayOfWeeks).HasMaxLength(20);
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.ShiftType).HasMaxLength(50);
            entity.Property(e => e.Status)
                .HasMaxLength(10)
                .IsFixedLength();

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.ParkingLotShifts)
                .HasForeignKey(d => d.ParkingLotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ParkingLotShift_ParkingLot_fk1");
        });

        modelBuilder.Entity<ParkingSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ParkingS__3214EC076244C9DD");

            entity.ToTable("ParkingSession");

            entity.HasIndex(e => e.EntryDateTime, "IX_ParkingSession_EntryDateTime");

            entity.HasIndex(e => e.ExitDateTime, "IX_ParkingSession_ExitDateTime");

            entity.HasIndex(e => e.ParkingLotId, "IX_ParkingSession_ParkingLotId");

            entity.HasIndex(e => e.PaymentMethod, "IX_ParkingSession_PaymentMethod");

            entity.HasIndex(e => e.VehicleId, "IX_ParkingSession_VehicleId");

            entity.HasIndex(e => e.Id, "UQ__ParkingS__3214EC06ED8B4805").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.CheckInStaffId).HasMaxLength(36);
            entity.Property(e => e.CheckOutDateTime).HasDefaultValueSql("(NULL)");
            entity.Property(e => e.CheckOutStaffId).HasMaxLength(36);
            entity.Property(e => e.Cost).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.DriverId).HasMaxLength(36);
            entity.Property(e => e.EntryBackCaptureUrl).HasMaxLength(500);
            entity.Property(e => e.EntryDateTime).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.EntryFrontCaptureUrl).HasMaxLength(500);
            entity.Property(e => e.ExitBackCaptureUrl)
                .HasMaxLength(500)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.ExitDateTime).HasDefaultValueSql("(NULL)");
            entity.Property(e => e.ExitFrontCaptureUrl)
                .HasMaxLength(500)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.LicensePlate).HasMaxLength(20);
            entity.Property(e => e.ParkingFeeSchedule).HasMaxLength(36);
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(20)
                .HasDefaultValue("Cash");
            entity.Property(e => e.PaymentStatus)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.TransactionId).HasDefaultValueSql("(NULL)");
            entity.Property(e => e.VehicleId).HasMaxLength(36);
            entity.Property(e => e.VehicleType).HasMaxLength(50);

            entity.HasOne(d => d.CheckInStaff).WithMany(p => p.ParkingSessionCheckInStaffs)
                .HasForeignKey(d => d.CheckInStaffId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ParkingSession_fk3");

            entity.HasOne(d => d.CheckOutStaff).WithMany(p => p.ParkingSessionCheckOutStaffs)
                .HasForeignKey(d => d.CheckOutStaffId)
                .HasConstraintName("ParkingSession_fk4");

            entity.HasOne(d => d.Driver).WithMany(p => p.ParkingSessions)
                .HasForeignKey(d => d.DriverId)
                .HasConstraintName("FK_ParkingSession_DriverId");

            entity.HasOne(d => d.ParkingFeeScheduleNavigation).WithMany(p => p.ParkingSessions)
                .HasForeignKey(d => d.ParkingFeeSchedule)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_ParkingSession_ParkingFeeSchedule");

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.ParkingSessions)
                .HasForeignKey(d => d.ParkingLotId)
                .HasConstraintName("ParkingSession_fk2");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.ParkingSessions)
                .HasForeignKey(d => d.VehicleId)
                .HasConstraintName("ParkingSession_fk1");
        });

        modelBuilder.Entity<Request>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Request__3214EC07B2ACCA82");

            entity.ToTable("Request");

            entity.HasIndex(e => e.UpdatedBy, "IX_Request_LastUpdatePersonId");

            entity.HasIndex(e => e.SenderId, "IX_Request_SenderId");

            entity.HasIndex(e => e.Status, "IX_Request_Status");

            entity.HasIndex(e => e.SubmittedAt, "IX_Request_SubmittedAt");

            entity.HasIndex(e => e.Id, "UQ__Request__3214EC06DDE85BED").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.DataType).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Header).HasMaxLength(255);
            entity.Property(e => e.InternalNote)
                .HasMaxLength(1000)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.ResponseMessage)
                .HasMaxLength(2000)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.SenderId).HasMaxLength(36);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Open");
            entity.Property(e => e.SubmittedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedBy).HasMaxLength(36);

            entity.HasOne(d => d.Sender).WithMany(p => p.Requests)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("Request_fk_Sender");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.Requests)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("Request_fk8");
        });

        modelBuilder.Entity<RequestAttachedFile>(entity =>
        {
            entity.HasKey(e => e.AttachedFileId).HasName("PK__RequestA__3214EC07B9EE57B9");

            entity.ToTable("RequestAttachedFile");

            entity.HasIndex(e => e.AttachedFileId, "UQ__RequestA__3214EC06152DDA3B").IsUnique();

            entity.Property(e => e.AttachedFileId).HasMaxLength(36);
            entity.Property(e => e.RequestId).HasMaxLength(36);

            entity.HasOne(d => d.AttachedFile).WithOne(p => p.RequestAttachedFile)
                .HasForeignKey<RequestAttachedFile>(d => d.AttachedFileId)
                .HasConstraintName("RequestAttachedFile_fk0");

            entity.HasOne(d => d.Request).WithMany(p => p.RequestAttachedFiles)
                .HasForeignKey(d => d.RequestId)
                .HasConstraintName("RequestAttachedFile_fk1");
        });

        modelBuilder.Entity<SharedVehicle>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__SharedVe__3214EC07EDA49C12");

            entity.ToTable("SharedVehicle");

            entity.HasIndex(e => e.AcceptAt, "IX_SharedVehicle_AcceptAt");

            entity.HasIndex(e => e.ExpireAt, "IX_SharedVehicle_ExpireAt");

            entity.HasIndex(e => e.InviteAt, "IX_SharedVehicle_InviteAt");

            entity.HasIndex(e => e.SharedPersonId, "IX_SharedVehicle_SharedPersonId");

            entity.HasIndex(e => e.VehicleId, "IX_SharedVehicle_VehicleId");

            entity.HasIndex(e => e.Id, "UQ__SharedVe__3214EC065D8B45A9").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.SharedPersonId).HasMaxLength(36);
            entity.Property(e => e.VehicleId).HasMaxLength(36);

            entity.HasOne(d => d.SharedPerson).WithMany(p => p.SharedVehicles)
                .HasForeignKey(d => d.SharedPersonId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("SharedVehicle_fk7");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.SharedVehicles)
                .HasForeignKey(d => d.VehicleId)
                .HasConstraintName("SharedVehicle_fk1");
        });

        modelBuilder.Entity<ShiftDiary>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ShiftDia__3214EC0708509E2F");

            entity.ToTable("ShiftDiary");

            entity.HasIndex(e => e.CreatedAt, "IX_ShiftDiary_CreatedAt");

            entity.HasIndex(e => e.ParkingLotId, "IX_ShiftDiary_ParkingLotId");

            entity.HasIndex(e => e.SenderId, "IX_ShiftDiary_SenderId");

            entity.HasIndex(e => e.Id, "UQ__ShiftDia__3214EC06C45A8081").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Body).HasMaxLength(2000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Header).HasMaxLength(255);
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.SenderId).HasMaxLength(36);

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.ShiftDiaries)
                .HasForeignKey(d => d.ParkingLotId)
                .HasConstraintName("ShiftDiary_fk4");

            entity.HasOne(d => d.Sender).WithMany(p => p.ShiftDiaries)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("ShiftDiary_fk5");
        });

        modelBuilder.Entity<StaffProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__StaffPro__1788CC4CACF4A0F8");

            entity.ToTable("StaffProfile");

            entity.HasIndex(e => e.ParkingLotId, "IX_StaffProfile_ParkingLotId");

            entity.HasIndex(e => e.StaffId, "IX_StaffProfile_StaffId");

            entity.HasIndex(e => e.UserId, "UQ__StaffPro__1788CC4D3B12EFC1").IsUnique();

            entity.HasIndex(e => e.StaffId, "UQ__StaffPro__96D4AB161AE0F057").IsUnique();

            entity.Property(e => e.UserId).HasMaxLength(36);
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.StaffId).HasMaxLength(20);

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.StaffProfiles)
                .HasForeignKey(d => d.ParkingLotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("StaffProfile_fk2");

            entity.HasOne(d => d.User).WithOne(p => p.StaffProfile)
                .HasForeignKey<StaffProfile>(d => d.UserId)
                .HasConstraintName("StaffProfile_fk0");

            entity.HasMany(d => d.ParkingLotShifts).WithMany(p => p.StaffUsers)
                .UsingEntity<Dictionary<string, object>>(
                    "StaffShift",
                    r => r.HasOne<ParkingLotShift>().WithMany()
                        .HasForeignKey("ParkingLotShiftId")
                        .HasConstraintName("FK_StaffShift_ParkingLotShiftId_fk2"),
                    l => l.HasOne<StaffProfile>().WithMany()
                        .HasForeignKey("StaffUserId")
                        .HasConstraintName("FK_StaffShift_Staff_fk1"),
                    j =>
                    {
                        j.HasKey("StaffUserId", "ParkingLotShiftId");
                        j.ToTable("StaffShift");
                        j.IndexerProperty<string>("StaffUserId").HasMaxLength(36);
                        j.IndexerProperty<string>("ParkingLotShiftId").HasMaxLength(36);
                    });
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.ToTable("Subscription");

            entity.HasIndex(e => e.CreatedBy, "IX_Subscription_CreatedById");

            entity.HasIndex(e => e.Name, "IX_Subscription_Name").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.CreatedBy).HasMaxLength(36);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.UpdatedBy).HasMaxLength(36);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.SubscriptionCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .HasConstraintName("FK_Subscription_CreatedBy_fk1");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.SubscriptionUpdatedByNavigations)
                .HasForeignKey(d => d.UpdatedBy)
                .HasConstraintName("FK_Subscription_UpdatedBy_fk1");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__User__3214EC0786524D8F");

            entity.ToTable("User");

            entity.HasIndex(e => e.CreatedAt, "IX_User_CreatedAt");

            entity.HasIndex(e => e.Email, "IX_User_Email");

            entity.HasIndex(e => e.Status, "IX_User_Status");

            entity.HasIndex(e => e.Id, "UQ__User__3214EC06366C8D89").IsUnique();

            entity.HasIndex(e => e.Phone, "UQ__User__5C7E359E4EC59181").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__User__A9D1053456547DAC").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.GoogleId).HasMaxLength(255);
            entity.Property(e => e.OneTimePassword).HasMaxLength(64);
            entity.Property(e => e.Password).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.ProfileImageUrl)
                .HasMaxLength(500)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.RefreshToken)
                .HasMaxLength(64)
                .IsFixedLength();
            entity.Property(e => e.Role).HasMaxLength(50);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Inactive");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Vehicle__3214EC073BBDFC5B");

            entity.ToTable("Vehicle");

            entity.HasIndex(e => e.CreatedAt, "IX_Vehicle_CreatedAt");

            entity.HasIndex(e => e.LicensePlate, "IX_Vehicle_LicensePlate");

            entity.HasIndex(e => e.OwnerId, "IX_Vehicle_OwnerId");

            entity.HasIndex(e => e.SharingStatus, "IX_Vehicle_SharingStatus");

            entity.HasIndex(e => e.Status, "IX_Vehicle_Status");

            entity.HasIndex(e => e.LicensePlate, "UQ__Vehicle__026BC15CAE30AED6").IsUnique();

            entity.HasIndex(e => e.Id, "UQ__Vehicle__3214EC0678F92770").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.BackVehicleRegistrationCertificateUrl).HasMaxLength(500);
            entity.Property(e => e.Brand).HasMaxLength(50);
            entity.Property(e => e.ChassisNumber).HasMaxLength(50);
            entity.Property(e => e.Color).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.CurrentHolderId).HasMaxLength(36);
            entity.Property(e => e.EngineNumber).HasMaxLength(50);
            entity.Property(e => e.FrontVehicleRegistrationCertificateUrl).HasMaxLength(500);
            entity.Property(e => e.LicensePlate).HasMaxLength(20);
            entity.Property(e => e.Model).HasMaxLength(50);
            entity.Property(e => e.OwnerId).HasMaxLength(36);
            entity.Property(e => e.OwnerVehicleFullName).HasMaxLength(255);
            entity.Property(e => e.SharingStatus)
                .HasMaxLength(20)
                .HasDefaultValue("Unavailable");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Inactive");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.UpdatedBy).HasMaxLength(36);
            entity.Property(e => e.VehicleType).HasMaxLength(50);

            entity.HasOne(d => d.CurrentHolder).WithMany(p => p.VehicleCurrentHolders)
                .HasForeignKey(d => d.CurrentHolderId)
                .HasConstraintName("Vehicle_fk13");

            entity.HasOne(d => d.Owner).WithMany(p => p.VehicleOwners)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Vehicle_fk12");

            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.Vehicles)
                .HasForeignKey(d => d.UpdatedBy)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Vehicle_UpdatedBy");
        });

        modelBuilder.Entity<WhiteList>(entity =>
        {
            entity.HasKey(e => new { e.ParkingLotId, e.ClientId });

            entity.ToTable("WhiteList");

            entity.HasIndex(e => e.AddedAt, "IX_WhiteList_AddedDate");

            entity.HasIndex(e => e.ClientId, "IX_WhiteList_ClientId");

            entity.HasIndex(e => e.ExpireAt, "IX_WhiteList_ExpiredDate");

            entity.HasIndex(e => new { e.ParkingLotId, e.ClientId }, "UQ_WhiteList_ParkingLot_Client").IsUnique();

            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.ClientId).HasMaxLength(36);
            entity.Property(e => e.AddedAt).HasDefaultValueSql("(CONVERT([date],getdate()))");
            entity.Property(e => e.ExpireAt).HasDefaultValueSql("(NULL)");

            entity.HasOne(d => d.Client).WithMany(p => p.WhiteLists)
                .HasForeignKey(d => d.ClientId)
                .HasConstraintName("FK_WhiteList_fk1");

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.WhiteLists)
                .HasForeignKey(d => d.ParkingLotId)
                .HasConstraintName("FK_WhiteList_fk0");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
