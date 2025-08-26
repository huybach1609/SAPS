package vn.edu.fpt.sapsmobile.dtos.sharevehicle;

import com.google.gson.annotations.SerializedName;

public class SharedVehicleDetails {
    @SerializedName("id")
    private String id;

    @SerializedName("licensePlate")
    private String licensePlate;

    @SerializedName("brand")
    private String brand;

    @SerializedName("model")
    private String model;

    @SerializedName("color")
    private String color;

    @SerializedName("status")
    private String status;

    @SerializedName("sharingStatus")
    private String sharingStatus;

    @SerializedName("engineNumber")
    private String engineNumber;

    @SerializedName("chassisNumber")
    private String chassisNumber;

    @SerializedName("ownerVehicleFullName")
    private String ownerVehicleFullName;

    @SerializedName("createdAt")
    private String createdAt;

    @SerializedName("updatedAt")
    private String updatedAt;

    @SerializedName("ownerId")
    private String ownerId;

    @SerializedName("accessDuration")
    private int accessDuration;

    @SerializedName("inviteAt")
    private String inviteAt;

    @SerializedName("expirationDate")
    private String expirationDate;

    @SerializedName("ownerName")
    private String ownerName;

    @SerializedName("note")
    private String note;

    @SerializedName("vehicleId")
    private String vehicleId;

    // Default constructor
    public SharedVehicleDetails() {}

    // Constructor with all fields
    public SharedVehicleDetails(String id, String licensePlate, String brand, String model, String color,
                               String status, String sharingStatus, String engineNumber, String chassisNumber,
                               String ownerVehicleFullName, String createdAt, String updatedAt, String ownerId,
                               int accessDuration, String inviteAt, String expirationDate, String ownerName,
                               String note, String vehicleId) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.brand = brand;
        this.model = model;
        this.color = color;
        this.status = status;
        this.sharingStatus = sharingStatus;
        this.engineNumber = engineNumber;
        this.chassisNumber = chassisNumber;
        this.ownerVehicleFullName = ownerVehicleFullName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ownerId = ownerId;
        this.accessDuration = accessDuration;
        this.inviteAt = inviteAt;
        this.expirationDate = expirationDate;
        this.ownerName = ownerName;
        this.note = note;
        this.vehicleId = vehicleId;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public int getAccessDuration() {
        return accessDuration;
    }

    public void setAccessDuration(int accessDuration) {
        this.accessDuration = accessDuration;
    }

    public String getInviteAt() {
        return inviteAt;
    }

    public void setInviteAt(String inviteAt) {
        this.inviteAt = inviteAt;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    @Override
    public String toString() {
        return "SharedVehicleDetails{" +
                "id='" + id + '\'' +
                ", licensePlate='" + licensePlate + '\'' +
                ", brand='" + brand + '\'' +
                ", model='" + model + '\'' +
                ", color='" + color + '\'' +
                ", status='" + status + '\'' +
                ", sharingStatus='" + sharingStatus + '\'' +
                ", engineNumber='" + engineNumber + '\'' +
                ", chassisNumber='" + chassisNumber + '\'' +
                ", ownerVehicleFullName='" + ownerVehicleFullName + '\'' +
                ", createdAt='" + createdAt + '\'' +
                ", updatedAt='" + updatedAt + '\'' +
                ", ownerId='" + ownerId + '\'' +
                ", accessDuration=" + accessDuration +
                ", inviteAt='" + inviteAt + '\'' +
                ", expirationDate='" + expirationDate + '\'' +
                ", ownerName='" + ownerName + '\'' +
                ", note='" + note + '\'' +
                ", vehicleId='" + vehicleId + '\'' +
                '}';
    }
}
