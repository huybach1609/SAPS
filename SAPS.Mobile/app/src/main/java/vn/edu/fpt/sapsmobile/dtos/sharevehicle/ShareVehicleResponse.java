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
    
    @SerializedName("engineNumber")
    private String engineNumber;
    
    @SerializedName("chassisNumber")
    private String chassisNumber;
    
    @SerializedName("color")
    private String color;
    
    @SerializedName("ownerVehicleFullName")
    private String ownerVehicleFullName;
    
    @SerializedName("registrationDate")
    private String registrationDate;
    
    @SerializedName("vehicleType")
    private String vehicleType;

    // Default constructor
    public ShareVehicleResponse() {}

    // Constructor with all fields


    public ShareVehicleResponse(String shareVehicleId, String licensePlate, String brand, String model, String engineNumber, String chassisNumber, String color, String ownerVehicleFullName, String registrationDate, String vehicleType) {
        this.shareVehicleId = shareVehicleId;
        this.licensePlate = licensePlate;
        this.brand = brand;
        this.model = model;
        this.engineNumber = engineNumber;
        this.chassisNumber = chassisNumber;
        this.color = color;
        this.ownerVehicleFullName = ownerVehicleFullName;
        this.registrationDate = registrationDate;
        this.vehicleType = vehicleType;
    }

    public String getShareVehicleId() {
        return shareVehicleId;
    }

    public void setShareVehicleId(String shareVehicleId) {
        this.shareVehicleId = shareVehicleId;
    }

    // Getters and setters
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

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
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
                ", engineNumber='" + engineNumber + '\'' +
                ", chassisNumber='" + chassisNumber + '\'' +
                ", color='" + color + '\'' +
                ", ownerVehicleFullName='" + ownerVehicleFullName + '\'' +
                ", registrationDate='" + registrationDate + '\'' +
                ", vehicleType='" + vehicleType + '\'' +
                '}';
    }
}
