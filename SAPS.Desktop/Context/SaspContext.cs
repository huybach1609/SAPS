using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using SAPS.Desktop.Models;

namespace SAPS.Desktop.Entity;

public partial class SaspContext : DbContext
{
    public SaspContext()
    {
    }

    public SaspContext(DbContextOptions<SaspContext> options)
        : base(options)
    {
    }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("server =localhost; database = SASP_Auth;uid=sa;pwd=123;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4CDA77DFBC");

            entity.HasIndex(e => e.Username, "UQ__Users__536C85E4134A33D6").IsUnique();

            entity.HasIndex(e => e.GoogleId, "UQ__Users__A6FBF2FBF48866D9").IsUnique();

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.GoogleId).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.Password).HasMaxLength(100);
            entity.Property(e => e.ProfilePictureUrl).HasMaxLength(500);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.Username).HasMaxLength(100);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
