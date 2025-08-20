package vn.edu.fpt.sapsmobile.dtos.vehicle;

import com.google.gson.annotations.SerializedName;

public class VehicleRegistrationInfo {

    @SerializedName("owner_name")
    private String ownerName;

    @SerializedName("license_plate")
    private String licensePlate;

    @SerializedName("vehicle_model")
    private String vehicleModel;

    @SerializedName("color")
    private String color;

    @SerializedName("certificate_title")
    private String certificateTitle;

    // --- Getters & Setters ---
    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getCertificateTitle() {
        return certificateTitle;
    }

    public void setCertificateTitle(String certificateTitle) {
        this.certificateTitle = certificateTitle;
    }
}
