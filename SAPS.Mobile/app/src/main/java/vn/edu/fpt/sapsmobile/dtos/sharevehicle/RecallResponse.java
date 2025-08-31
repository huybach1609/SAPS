package vn.edu.fpt.sapsmobile.dtos.sharevehicle;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class RecallResponse {
    @SerializedName("message")
    private String message;

    // Default constructor
    public RecallResponse() {}

    // Constructor with message
    public RecallResponse(String message) {
        this.message = message;
    }

    // Getters and setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "RecallResponse{" +
                "message='" + message + '\'' +
                '}';
    }
}
