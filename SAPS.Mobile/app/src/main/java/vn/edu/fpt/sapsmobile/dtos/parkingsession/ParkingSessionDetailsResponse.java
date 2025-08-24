package vn.edu.fpt.sapsmobile.dtos.parkingsession;

import com.google.gson.annotations.SerializedName;

public class ParkingSessionDetailsResponse {
    @SerializedName("message")
    private String message;
    
    @SerializedName("data")
    private ParkingSessionData data;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public ParkingSessionData getData() {
        return data;
    }

    public void setData(ParkingSessionData data) {
        this.data = data;
    }

    public static class ParkingSessionData {
        @SerializedName("id")
        private String id;
        
        @SerializedName("licensePlate")
        private String licensePlate;
        
        @SerializedName("entryDateTime")
        private String entryDateTime;
        
        @SerializedName("exitDateTime")
        private String exitDateTime;
        
        @SerializedName("cost")
        private double cost;
        
        @SerializedName("status")
        private String status;
        
        @SerializedName("paymentStatus")
        private String paymentStatus;
        
        @SerializedName("parkingLotName")
        private String parkingLotName;
        
        @SerializedName("parkingLot")
        private ParkingLotDetails parkingLot;

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

        public String getEntryDateTime() {
            return entryDateTime;
        }

        public void setEntryDateTime(String entryDateTime) {
            this.entryDateTime = entryDateTime;
        }

        public String getExitDateTime() {
            return exitDateTime;
        }

        public void setExitDateTime(String exitDateTime) {
            this.exitDateTime = exitDateTime;
        }

        public double getCost() {
            return cost;
        }

        public void setCost(double cost) {
            this.cost = cost;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }

        public String getParkingLotName() {
            return parkingLotName;
        }

        public void setParkingLotName(String parkingLotName) {
            this.parkingLotName = parkingLotName;
        }

        public ParkingLotDetails getParkingLot() {
            return parkingLot;
        }

        public void setParkingLot(ParkingLotDetails parkingLot) {
            this.parkingLot = parkingLot;
        }
    }

    public static class ParkingLotDetails {
        @SerializedName("id")
        private String id;
        
        @SerializedName("name")
        private String name;
        
        @SerializedName("address")
        private String address;

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

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }
    }
}
