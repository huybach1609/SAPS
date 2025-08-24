package vn.edu.fpt.sapsmobile.dtos.sharevehicle;

import com.google.gson.annotations.SerializedName;

public class ShareInvitationRequest {
    
    @SerializedName("vehicleId")
    private String vehicleId;
    
    @SerializedName("ownerId")
    private String ownerId;
    
    @SerializedName("note")
    private String note;
    
    @SerializedName("sharedPersonId")
    private String sharedPersonId;

    public ShareInvitationRequest(String vehicleId, String ownerId, String note, String sharedPersonId) {
        this.vehicleId = vehicleId;
        this.ownerId = ownerId;
        this.note = note;
        this.sharedPersonId = sharedPersonId;
    }

    // Getters and Setters
    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getSharedPersonId() { return sharedPersonId; }
    public void setSharedPersonId(String sharedPersonId) { this.sharedPersonId = sharedPersonId; }
}
