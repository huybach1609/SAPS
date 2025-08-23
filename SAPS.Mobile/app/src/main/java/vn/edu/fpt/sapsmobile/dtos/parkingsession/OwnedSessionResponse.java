package vn.edu.fpt.sapsmobile.dtos.parkingsession;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class OwnedSessionResponse {
    @SerializedName("message")
    private String message;

    @SerializedName("data")
    private List<OwnedParkingSessionDto> data;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<OwnedParkingSessionDto> getData() {
        return data;
    }

    public void setData(List<OwnedParkingSessionDto> data) {
        this.data = data;
    }

    public static class OwnedParkingSessionDto {
        @SerializedName("id")
        private String id;
        @SerializedName("parkingLotName")
        private String parkingLotName;
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

        public String getId() { return id; }
        public String getParkingLotName() { return parkingLotName; }
        public String getLicensePlate() { return licensePlate; }
        public String getEntryDateTime() { return entryDateTime; }
        public String getExitDateTime() { return exitDateTime; }
        public double getCost() { return cost; }
        public String getStatus() { return status; }
        public String getPaymentStatus() { return paymentStatus; }
    }
}


