package vn.edu.fpt.sapsmobile.dtos.vehicle;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class VehicleSummaryDto implements Serializable {
    
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

    // Default constructor
    public VehicleSummaryDto() {}

    // Constructor with all fields
    public VehicleSummaryDto(String id, String licensePlate, String brand, String model, 
                           String color, String status, String sharingStatus) {
        this.id = id;
        this.licensePlate = licensePlate;
        this.brand = brand;
        this.model = model;
        this.color = color;
        this.status = status;
        this.sharingStatus = sharingStatus;
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

    @Override
    public String toString() {
        return "VehicleSummaryDto{" +
                "id='" + id + '\'' +
                ", licensePlate='" + licensePlate + '\'' +
                ", brand='" + brand + '\'' +
                ", model='" + model + '\'' +
                ", color='" + color + '\'' +
                ", status='" + status + '\'' +
                ", sharingStatus='" + sharingStatus + '\'' +
                '}';
    }
}
