package vn.edu.fpt.sapsmobile.models;

import java.io.Serializable;

public class Vehicle implements Serializable {
    private String id;
    private String licensePlate;
    private String brand;
    private String model;
    private String engineNumber;
    private String chassisNumber;
    private String color;
    private String ownerVehicleFullName;
    private String certificateTitle; // Thêm trường mới từ mặt sau giấy đăng ký
    private String status;
    private String sharingStatus;
    private String createdAt;
    private String updatedAt;
    private String ownerId;

    public Vehicle(String id, String licensePlate, String brand, String model,
                   String engineNumber, String chassisNumber, String color,
                   String ownerVehicleFullName, String certificateTitle,
                   String status, String sharingStatus, String createdAt,
                   String updatedAt, String ownerId) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.brand = brand;
        this.model = model;
        this.engineNumber = engineNumber;
        this.chassisNumber = chassisNumber;
        this.color = color;
        this.ownerVehicleFullName = ownerVehicleFullName;
        this.certificateTitle = certificateTitle;
        this.status = status;
        this.sharingStatus = sharingStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ownerId = ownerId;
    }
    public Vehicle(){}

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getEngineNumber() { return engineNumber; }
    public void setEngineNumber(String engineNumber) { this.engineNumber = engineNumber; }

    public String getChassisNumber() { return chassisNumber; }
    public void setChassisNumber(String chassisNumber) { this.chassisNumber = chassisNumber; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getOwnerVehicleFullName() { return ownerVehicleFullName; }
    public void setOwnerVehicleFullName(String ownerVehicleFullName) { this.ownerVehicleFullName = ownerVehicleFullName; }

    public String getCertificateTitle() { return certificateTitle; }
    public void setCertificateTitle(String certificateTitle) { this.certificateTitle = certificateTitle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSharingStatus() { return sharingStatus; }
    public void setSharingStatus(String sharingStatus) { this.sharingStatus = sharingStatus; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    @Override
    public String toString() {
        return "Vehicle{" +
                "id='" + id + '\'' +
                ", licensePlate='" + licensePlate + '\'' +
                ", brand='" + brand + '\'' +
                ", model='" + model + '\'' +
                ", engineNumber='" + engineNumber + '\'' +
                ", chassisNumber='" + chassisNumber + '\'' +
                ", color='" + color + '\'' +
                ", ownerVehicleFullName='" + ownerVehicleFullName + '\'' +
                ", certificateTitle='" + certificateTitle + '\'' +
                ", status='" + status + '\'' +
                ", sharingStatus='" + sharingStatus + '\'' +
                ", createdAt='" + createdAt + '\'' +
                ", updatedAt='" + updatedAt + '\'' +
                ", ownerId='" + ownerId + '\'' +
                '}';

    }

}