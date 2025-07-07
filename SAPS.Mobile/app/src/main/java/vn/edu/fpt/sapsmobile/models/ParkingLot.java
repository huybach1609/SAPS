package vn.edu.fpt.sapsmobile.models;

import java.io.Serializable;

public class ParkingLot implements Serializable {
    private String id;
    private String name;
    private String description;
    private String address;
    private int totalParkingSlot;
    private String createdAt;
    private String updatedAt;
    private String status;
    private String parkingLotOwnerId;

    public ParkingLot() {
    }

    public ParkingLot(String id, String name, String description, String address, int totalParkingSlot,
                      String createdAt, String updatedAt, String status, String parkingLotOwnerId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.address = address;
        this.totalParkingSlot = totalParkingSlot;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
        this.parkingLotOwnerId = parkingLotOwnerId;
    }

    // Getters & Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public int getTotalParkingSlot() {
        return totalParkingSlot;
    }

    public void setTotalParkingSlot(int totalParkingSlot) {
        this.totalParkingSlot = totalParkingSlot;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getParkingLotOwnerId() {
        return parkingLotOwnerId;
    }

    public void setParkingLotOwnerId(String parkingLotOwnerId) {
        this.parkingLotOwnerId = parkingLotOwnerId;
    }
}
