package vn.edu.fpt.sapsmobile.dtos.vehicle;

import com.google.gson.annotations.SerializedName;

public class MessageServerResponse {

    @SerializedName("message")
    private String message;  // e.g. "Vehicle created successfully"

    // --- Getters & Setters ---
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
