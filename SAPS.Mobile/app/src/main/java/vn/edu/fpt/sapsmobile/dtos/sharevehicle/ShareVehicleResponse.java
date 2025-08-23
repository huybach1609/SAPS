package vn.edu.fpt.sapsmobile.dtos.sharevehicle;

import com.google.gson.annotations.SerializedName;

public class ShareVehicleResponse {
    @SerializedName("id")
    private String shareVehicleId;

    @SerializedName("licensePlate")
    private String licensePlate;

    @SerializedName("brand")
    private String brand;

    @SerializedName("model")
    private String model;

    @SerializedName("color")
    private String color;

    @SerializedName("ownerName")
    private String ownerName;

    @SerializedName("status")
    private String status;

    @SerializedName("sharingStatus")
    private String sharingStatus;

    @SerializedName("accessDuration")
    private String accessDuration;

    // Optional fields that might be used in other API endpoints
    private String engineNumber;
    private String chassisNumber;
    private String ownerVehicleFullName;
    private String registrationDate;
    private String vehicleType;

    // Default constructor
    public ShareVehicleResponse() {}

    // Constructor with main fields
    public ShareVehicleResponse(String shareVehicleId, String licensePlate, String brand, String model, String color, String ownerName, String status, String sharingStatus) {
        this.shareVehicleId = shareVehicleId;
        this.licensePlate = licensePlate;
        this.brand = brand;
        this.model = model;
        this.color = color;
        this.ownerName = ownerName;
        this.status = status;
        this.sharingStatus = sharingStatus;
    }

    // Getters and setters
    public String getShareVehicleId() {
        return shareVehicleId;
    }

    public void setShareVehicleId(String shareVehicleId) {
        this.shareVehicleId = shareVehicleId;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSharingStatus() {
        return sharingStatus;
    }

    public void setSharingStatus(String sharingStatus) {
        this.sharingStatus = sharingStatus;
    }

    public String getAccessDuration() {
        return accessDuration;
    }

    public void setAccessDuration(String accessDuration) {
        this.accessDuration = accessDuration;
    }

    // Optional fields getters/setters
    public String getEngineNumber() {
        return engineNumber;
    }

    public void setEngineNumber(String engineNumber) {
        this.engineNumber = engineNumber;
    }

    public String getChassisNumber() {
        return chassisNumber;
    }

    public void setChassisNumber(String chassisNumber) {
        this.chassisNumber = chassisNumber;
    }

    public String getOwnerVehicleFullName() {
        return ownerVehicleFullName;
    }

    public void setOwnerVehicleFullName(String ownerVehicleFullName) {
        this.ownerVehicleFullName = ownerVehicleFullName;
    }

    public String getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(String registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    @Override
    public String toString() {
        return "ShareVehicleResponse{" +
                "shareVehicleId='" + shareVehicleId + '\'' +
                ", licensePlate='" + licensePlate + '\'' +
                ", brand='" + brand + '\'' +
                ", model='" + model + '\'' +
                ", color='" + color + '\'' +
                ", ownerName='" + ownerName + '\'' +
                ", status='" + status + '\'' +
                ", sharingStatus='" + sharingStatus + '\'' +
                ", accessDuration='" + accessDuration + '\'' +
                '}';
    }
}