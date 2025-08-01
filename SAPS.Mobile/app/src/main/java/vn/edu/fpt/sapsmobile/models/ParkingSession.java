package vn.edu.fpt.sapsmobile.models;

import java.io.Serializable;

public class ParkingSession implements Serializable {

    private String id;
    private String vehicleId;
    private String parkingLotId;

    private String entryDateTime;         // not null
    private String exitDateTime;          // nullable
    private String checkOutTime;          // nullable

    private String entryFrontCaptureUrl;  // not null
    private String entryBackCaptureUrl;   // not null
    private String exitFrontCaptureUrl;   // nullable
    private String exitBackCaptureUrl;    // nullable

    private String transactionId;         // nullable
    private String paymentMethod;         // not null
    private double cost;                  // not null

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getParkingLotId() { return parkingLotId; }
    public void setParkingLotId(String parkingLotId) { this.parkingLotId = parkingLotId; }

    public String getEntryDateTime() { return entryDateTime; }
    public void setEntryDateTime(String entryDateTime) { this.entryDateTime = entryDateTime; }

    public String getExitDateTime() { return exitDateTime; }
    public void setExitDateTime(String exitDateTime) { this.exitDateTime = exitDateTime; }

    public String getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(String checkOutTime) { this.checkOutTime = checkOutTime; }

    public String getEntryFrontCaptureUrl() { return entryFrontCaptureUrl; }
    public void setEntryFrontCaptureUrl(String entryFrontCaptureUrl) { this.entryFrontCaptureUrl = entryFrontCaptureUrl; }

    public String getEntryBackCaptureUrl() { return entryBackCaptureUrl; }
    public void setEntryBackCaptureUrl(String entryBackCaptureUrl) { this.entryBackCaptureUrl = entryBackCaptureUrl; }

    public String getExitFrontCaptureUrl() { return exitFrontCaptureUrl; }
    public void setExitFrontCaptureUrl(String exitFrontCaptureUrl) { this.exitFrontCaptureUrl = exitFrontCaptureUrl; }

    public String getExitBackCaptureUrl() { return exitBackCaptureUrl; }
    public void setExitBackCaptureUrl(String exitBackCaptureUrl) { this.exitBackCaptureUrl = exitBackCaptureUrl; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public double getCost() { return cost; }
    public void setCost(double cost) { this.cost = cost; }

    @Override
    public String toString() {
        return "ParkingSession{" +
                "id='" + id + '\'' +
                ", vehicleId='" + vehicleId + '\'' +
                ", parkingLotId='" + parkingLotId + '\'' +
                ", entryDateTime='" + entryDateTime + '\'' +
                ", exitDateTime='" + exitDateTime + '\'' +
                ", checkOutTime='" + checkOutTime + '\'' +
                ", entryFrontCaptureUrl='" + entryFrontCaptureUrl + '\'' +
                ", entryBackCaptureUrl='" + entryBackCaptureUrl + '\'' +
                ", exitFrontCaptureUrl='" + exitFrontCaptureUrl + '\'' +
                ", exitBackCaptureUrl='" + exitBackCaptureUrl + '\'' +
                ", transactionId='" + transactionId + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", cost=" + cost +
                '}';
    }
}
