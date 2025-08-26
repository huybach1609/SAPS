package vn.edu.fpt.sapsmobile.dtos.profile;

import com.google.gson.annotations.SerializedName;

public class VerificationResponse {
    @SerializedName("message")
    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
