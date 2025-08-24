using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SAPS.Api.Models.Generated;

public partial class SapsContext : DbContext
{
    public SapsContext()
    {
    }

    public SapsContext(DbContextOptions<SapsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AttachedFile> AttachedFiles { get; set; }

    public virtual DbSet<ClientProfile> ClientProfiles { get; set; }

    public virtual DbSet<IncidenceEvidence> IncidenceEvidences { get; set; }

    public virtual DbSet<IncidenceReport> IncidenceReports { get; set; }

    public virtual DbSet<ParkingFeeSchedule> ParkingFeeSchedules { get; set; }

    public virtual DbSet<ParkingLot> ParkingLots { get; set; }

    public virtual DbSet<ParkingLotOwnerProfile> ParkingLotOwnerProfiles { get; set; }

    public virtual DbSet<ParkingSession> ParkingSessions { get; set; }

    public virtual DbSet<PaymentSource> PaymentSources { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Request> Requests { get; set; }

    public virtual DbSet<RequestAttachedFile> RequestAttachedFiles { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<SharedVehicle> SharedVehicles { get; set; }

    public virtual DbSet<SharedVehicleRequest> SharedVehicleRequests { get; set; }

    public virtual DbSet<ShiftDiary> ShiftDiaries { get; set; }

    public virtual DbSet<StaffProfile> StaffProfiles { get; set; }

    public virtual DbSet<Subscription> Subscriptions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    public virtual DbSet<WhiteList> WhiteLists { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:Default");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AttachedFile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Attached__3214EC07C444EF70");

            entity.ToTable("AttachedFile");

            entity.HasIndex(e => e.Name, "IX_AttachedFile_Name");

            entity.HasIndex(e => e.UploadAt, "IX_AttachedFile_UploadAt");

            entity.HasIndex(e => e.Id, "UQ__Attached__3214EC0649199929").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.UploadAt).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<ClientProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__ClientPr__1788CC4C81318ABF");

            entity.ToTable("ClientProfile");

            entity.HasIndex(e => e.CitizenId, "IX_ClientProfile_CitizenId");

            entity.HasIndex(e => e.UserId, "UQ__ClientPr__1788CC4D7F333486").IsUnique();

            entity.HasIndex(e => e.CitizenId, "UQ__ClientPr__6E49FA0D4D84C3DC").IsUnique();

            entity.Property(e => e.UserId).HasMaxLength(36);
            entity.Property(e => e.CitizenId).HasMaxLength(50);
            entity.Property(e => e.Nationality).HasMaxLength(100);
            entity.Property(e => e.PlaceOfOrigin).HasMaxLength(255);
            entity.Property(e => e.PlaceOfResidence).HasMaxLength(255);
            entity.Property(e => e.Sex).HasDefaultValue(true);

            entity.HasOne(d => d.User).WithOne(p => p.ClientProfile)
                .HasForeignKey<ClientProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ClientProfile_fk0");
        });

        modelBuilder.Entity<IncidenceEvidence>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Incidenc__3214EC07B987AA87");

            entity.ToTable("IncidenceEvidence");

            entity.HasIndex(e => e.Id, "UQ__Incidenc__3214EC06806DC73A").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.IncidenceReportId).HasMaxLength(36);
            entity.Property(e => e.Name).HasMaxLength(255);

            entity.HasOne(d => d.IdNavigation).WithOne(p => p.IncidenceEvidence)
                .HasForeignKey<IncidenceEvidence>(d => d.Id)
                .HasConstraintName("IncidenceEvidence_fk0");

            entity.HasOne(d => d.IncidenceReport).WithMany(p => p.IncidenceEvidences)
                .HasForeignKey(d => d.IncidenceReportId)
                .HasConstraintName("IncidenceEvidence_fk1");
        });

        modelBuilder.Entity<IncidenceReport>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Incidenc__3214EC074AA23399");

            entity.ToTable("IncidenceReport");

            entity.HasIndex(e => e.Priority, "IX_IncidenceReport_Priority");

            entity.HasIndex(e => e.ReportedDate, "IX_IncidenceReport_ReportedDate");

            entity.HasIndex(e => e.ReporterId, "IX_IncidenceReport_ReporterId");

            entity.HasIndex(e => e.Status, "IX_IncidenceReport_Status");

            entity.HasIndex(e => e.Id, "UQ__Incidenc__3214EC0683525416").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Header).HasMaxLength(255);
            entity.Property(e => e.Priority)
                .HasMaxLength(20)
                .HasDefaultValue("Medium");
            entity.Property(e => e.ReportedDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.ReporterId).HasMaxLength(36);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Open");

            entity.HasOne(d => d.Reporter).WithMany(p => p.IncidenceReports)
                .HasForeignKey(d => d.ReporterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("IncidenceReport_fk6");
        });

        modelBuilder.Entity<ParkingFeeSchedule>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ParkingF__3214EC07379B2434");

            entity.ToTable("ParkingFeeSchedule");

            entity.HasIndex(e => e.ForVehicleType, "IX_ParkingFeeSchedule_ForVehicleType");

            entity.HasIndex(e => e.IsActive, "IX_ParkingFeeSchedule_IsActive");

            entity.HasIndex(e => e.ParkingLotId, "IX_ParkingFeeSchedule_ParkingLotId");

            entity.HasIndex(e => e.Id, "UQ__ParkingF__3214EC06185310F1").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.AdditionalFee).HasColumnType("decimal(8, 2)");
            entity.Property(e => e.AdditionalMinutes).HasDefaultValue(60);
            entity.Property(e => e.DayOfWeeks)
                .HasMaxLength(20)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.ForVehicleType)
                .HasMaxLength(20)
                .HasDefaultValue("Car");
            entity.Property(e => e.InitialFee).HasColumnType("decimal(8, 2)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.ParkingFeeSchedules)
                .HasForeignKey(d => d.ParkingLotId)
                .HasConstraintName("ParkingFeeSchedule_fk10");
        });

        modelBuilder.Entity<ParkingLot>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ParkingL__3214EC07FE14D341");

            entity.ToTable("ParkingLot");

            entity.HasIndex(e => e.Status, "IX_ParkingLot_Status");

            entity.HasIndex(e => e.Id, "UQ__ParkingL__3214EC061EBB5568").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.Description)
                .HasMaxLength(1000)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Active");
        });

        modelBuilder.Entity<ParkingLotOwnerProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__ParkingL__1788CC4CB67A4B24");

            entity.ToTable("ParkingLotOwnerProfile");

            entity.HasIndex(e => e.ParkingLotOwnerId, "IX_ParkingLotOwnerProfile_ParkingLotOwnerId");

            entity.HasIndex(e => e.UserId, "UQ__ParkingL__1788CC4D318ACDDE").IsUnique();

            entity.HasIndex(e => e.ParkingLotOwnerId, "UQ__ParkingL__F2333F3F12DDCF80").IsUnique();

            entity.Property(e => e.UserId).HasMaxLength(36);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.ParkingLotOwnerId).HasMaxLength(20);

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.ParkingLotOwnerProfiles)
                .HasForeignKey(d => d.ParkingLotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ParkingLotOwnerProfile_fk3");

            entity.HasOne(d => d.User).WithOne(p => p.ParkingLotOwnerProfile)
                .HasForeignKey<ParkingLotOwnerProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ParkingLotOwnerProfile_fk0");
        });

        modelBuilder.Entity<ParkingSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ParkingS__3214EC07D649D348");

            entity.ToTable("ParkingSession");

            entity.HasIndex(e => e.EntryDateTime, "IX_ParkingSession_EntryDateTime");

            entity.HasIndex(e => e.ExitDateTime, "IX_ParkingSession_ExitDateTime");

            entity.HasIndex(e => e.ParkingLotId, "IX_ParkingSession_ParkingLotId");

            entity.HasIndex(e => e.PaymentMethod, "IX_ParkingSession_PaymentMethod");

            entity.HasIndex(e => e.VehicleId, "IX_ParkingSession_VehicleId");

            entity.HasIndex(e => e.Id, "UQ__ParkingS__3214EC0675434317").IsUnique();

            entity.HasIndex(e => e.TransactionId, "UQ__ParkingS__55433A6A4A858662").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(40);
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
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(20)
                .HasDefaultValue("Cash");
            entity.Property(e => e.TransactionId)
                .HasMaxLength(36)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.VehicleId).HasMaxLength(36);

            entity.HasOne(d => d.Driver).WithMany(p => p.ParkingSessions).HasForeignKey(d => d.DriverId);

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.ParkingSessions)
                .HasForeignKey(d => d.ParkingLotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ParkingSession_fk2");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.ParkingSessions)
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ParkingSession_fk1");
        });

        modelBuilder.Entity<PaymentSource>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__PaymentS__3214EC07D57E4735");

            entity.ToTable("PaymentSource");

            entity.HasIndex(e => e.ParkingLotOwnerId, "IX_PaymentSource_ParkingLotOwnerId");

            entity.HasIndex(e => e.Id, "UQ__PaymentS__3214EC06E0EB9208").IsUnique();

            entity.Property(e => e.AccountName).HasMaxLength(255);
            entity.Property(e => e.AccountNumber).HasMaxLength(50);
            entity.Property(e => e.BankName).HasMaxLength(100);
            entity.Property(e => e.ParkingLotOwnerId).HasMaxLength(36);

            entity.HasOne(d => d.ParkingLotOwner).WithMany(p => p.PaymentSources)
                .HasForeignKey(d => d.ParkingLotOwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("PaymentSource_fk4");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("Permission");

            entity.HasIndex(e => e.Name, "UQ_Permission_Name").IsUnique();

            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Request>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Request__3214EC0707F59D1E");

            entity.ToTable("Request");

            entity.HasIndex(e => e.LastUpdatePersonId, "IX_Request_LastUpdatePersonId");

            entity.HasIndex(e => e.SenderId, "IX_Request_SenderId");

            entity.HasIndex(e => e.Status, "IX_Request_Status");

            entity.HasIndex(e => e.Id, "UQ__Request__3214EC06365CAE2C").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Header).HasMaxLength(255);
            entity.Property(e => e.InternalNote)
                .HasMaxLength(1000)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.LastUpdatePersonId).HasMaxLength(36);
            entity.Property(e => e.ResponseMessage)
                .HasMaxLength(2000)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.SenderId).HasMaxLength(36);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Open");

            entity.HasOne(d => d.Sender).WithMany(p => p.Requests)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Request_fk8");
        });

        modelBuilder.Entity<RequestAttachedFile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RequestA__3214EC073A8D4A09");

            entity.ToTable("RequestAttachedFile");

            entity.HasIndex(e => e.Id, "UQ__RequestA__3214EC0649810416").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.RequestId).HasMaxLength(36);

            entity.HasOne(d => d.IdNavigation).WithOne(p => p.RequestAttachedFile)
                .HasForeignKey<RequestAttachedFile>(d => d.Id)
                .HasConstraintName("RequestAttachedFile_fk0");

            entity.HasOne(d => d.Request).WithMany(p => p.RequestAttachedFiles)
                .HasForeignKey(d => d.RequestId)
                .HasConstraintName("RequestAttachedFile_fk1");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Role");

            entity.HasIndex(e => e.Name, "UQ_Role_Name").IsUnique();

            entity.Property(e => e.Name).HasMaxLength(100);

            entity.HasMany(d => d.Permissions).WithMany(p => p.Roles)
                .UsingEntity<Dictionary<string, object>>(
                    "RolePermission",
                    r => r.HasOne<Permission>().WithMany()
                        .HasForeignKey("PermissionId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_RolePermission_Permission"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_RolePermission_Role"),
                    j =>
                    {
                        j.HasKey("RoleId", "PermissionId");
                        j.ToTable("RolePermission");
                    });
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
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("SharedVehicle_fk7");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.SharedVehicles)
                .HasForeignKey(d => d.VehicleId)
                .HasConstraintName("SharedVehicle_fk1");
        });

        modelBuilder.Entity<SharedVehicleRequest>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__SharedVe__3213E83F4B8E7FA6");

            entity.ToTable("SharedVehicleRequest");

            entity.HasIndex(e => e.Id, "UQ__SharedVe__3213E83E4A841D30").IsUnique();

            entity.Property(e => e.Id)
                .HasMaxLength(36)
                .HasColumnName("id");
            entity.Property(e => e.AccessDuration).HasMaxLength(20);
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.SharedPersonId).HasMaxLength(36);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.VehicleId).HasMaxLength(36);

            entity.HasOne(d => d.SharedPerson).WithMany(p => p.SharedVehicleRequests)
                .HasForeignKey(d => d.SharedPersonId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("SharedVehicleRequest_fk7");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.SharedVehicleRequests)
                .HasForeignKey(d => d.VehicleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("SharedVehicleRequest_fk1");
        });

        modelBuilder.Entity<ShiftDiary>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__ShiftDia__3214EC07A40521F2");

            entity.ToTable("ShiftDiary");

            entity.HasIndex(e => e.ParkingLotId, "IX_ShiftDiary_ParkingLotId");

            entity.HasIndex(e => e.SenderId, "IX_ShiftDiary_SenderId");

            entity.HasIndex(e => e.Id, "UQ__ShiftDia__3214EC061F2E929F").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Body).HasMaxLength(2000);
            entity.Property(e => e.Header).HasMaxLength(255);
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.SenderId).HasMaxLength(36);

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.ShiftDiaries)
                .HasForeignKey(d => d.ParkingLotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ShiftDiary_fk3");

            entity.HasOne(d => d.Sender).WithMany(p => p.ShiftDiaries)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ShiftDiary_fk4");
        });

        modelBuilder.Entity<StaffProfile>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__StaffPro__1788CC4C93F5040D");

            entity.ToTable("StaffProfile");

            entity.HasIndex(e => e.ParkingLotId, "IX_StaffProfile_ParkingLotId");

            entity.HasIndex(e => e.StaffId, "IX_StaffProfile_StaffId");

            entity.HasIndex(e => e.UserId, "UQ__StaffPro__1788CC4DEF756951").IsUnique();

            entity.HasIndex(e => e.StaffId, "UQ__StaffPro__96D4AB168E1C5E86").IsUnique();

            entity.Property(e => e.UserId).HasMaxLength(36);
            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.StaffId).HasMaxLength(20);
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.StaffProfiles)
                .HasForeignKey(d => d.ParkingLotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("StaffProfile_fk2");

            entity.HasOne(d => d.User).WithOne(p => p.StaffProfile)
                .HasForeignKey<StaffProfile>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("StaffProfile_fk0");
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Subscrip__3214EC07CA950E4F");

            entity.ToTable("Subscription");

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.LastUpdatedBy)
                .HasMaxLength(36)
                .HasColumnName("lastUpdatedBy");
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);

            entity.HasOne(d => d.LastUpdatedByNavigation).WithMany(p => p.Subscriptions)
                .HasForeignKey(d => d.LastUpdatedBy)
                .HasConstraintName("FK_Subscription_User_LastUpdatedBy");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__User__3214EC07470C3514");

            entity.ToTable("User");

            entity.HasIndex(e => e.CreatedAt, "IX_User_CreatedAt");

            entity.HasIndex(e => e.Email, "IX_User_Email");

            entity.HasIndex(e => e.Id, "UQ__User__3214EC06749BF777").IsUnique();

            entity.HasIndex(e => e.Phone, "UQ__User__5C7E359EF6F363EF").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__User__A9D105342B6A43B6").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(255);
            entity.Property(e => e.GoogleId).HasMaxLength(50);
            entity.Property(e => e.Password).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.ProfileImageUrl)
                .HasMaxLength(500)
                .HasDefaultValueSql("(NULL)");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");

            entity.HasMany(d => d.Roles).WithMany(p => p.Accounts)
                .UsingEntity<Dictionary<string, object>>(
                    "AccountRole",
                    r => r.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_AccountRole_Role"),
                    l => l.HasOne<User>().WithMany()
                        .HasForeignKey("AccountId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_AccountRole_User"),
                    j =>
                    {
                        j.HasKey("AccountId", "RoleId");
                        j.ToTable("AccountRole");
                        j.IndexerProperty<string>("AccountId").HasMaxLength(36);
                    });
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Vehicle__3214EC0724C3FAAA");

            entity.ToTable("Vehicle");

            entity.HasIndex(e => e.LicensePlate, "IX_Vehicle_LicensePlate");

            entity.HasIndex(e => e.OwnerId, "IX_Vehicle_OwnerId");

            entity.HasIndex(e => e.Status, "IX_Vehicle_Status");

            entity.HasIndex(e => e.LicensePlate, "UQ__Vehicle__026BC15C7585941A").IsUnique();

            entity.HasIndex(e => e.Id, "UQ__Vehicle__3214EC068F63410E").IsUnique();

            entity.Property(e => e.Id).HasMaxLength(36);
            entity.Property(e => e.Brand).HasMaxLength(50);
            entity.Property(e => e.ChassisNumber).HasMaxLength(50);
            entity.Property(e => e.Color).HasMaxLength(50);
            entity.Property(e => e.EngineNumber).HasMaxLength(50);
            entity.Property(e => e.LicensePlate).HasMaxLength(20);
            entity.Property(e => e.Model).HasMaxLength(50);
            entity.Property(e => e.OwnerId).HasMaxLength(36);
            entity.Property(e => e.OwnerVehicleFullName).HasMaxLength(255);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Inactive");

            entity.HasOne(d => d.Owner).WithMany(p => p.Vehicles)
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Vehicle_fk12");
        });

        modelBuilder.Entity<WhiteList>(entity =>
        {
            entity.HasKey(e => new { e.ParkingLotId, e.ClientId }).HasName("PK__WhiteLis__3140FF2BC071FB38");

            entity.ToTable("WhiteList");

            entity.HasIndex(e => e.ClientId, "IX_WhiteList_ClientId");

            entity.Property(e => e.ParkingLotId).HasMaxLength(36);
            entity.Property(e => e.ClientId).HasMaxLength(36);

            entity.HasOne(d => d.Client).WithMany(p => p.WhiteLists)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("WhiteList_fk1");

            entity.HasOne(d => d.ParkingLot).WithMany(p => p.WhiteLists)
                .HasForeignKey(d => d.ParkingLotId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("WhiteList_fk0");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
