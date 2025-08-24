package vn.edu.fpt.sapsmobile.dtos.profile;

import com.google.gson.annotations.SerializedName;

public class IdCardBase64Request {
    @SerializedName("frontImageBase64")
    private String frontImageBase64;
    
    @SerializedName("backImageBase64") 
    private String backImageBase64;
    
    @SerializedName("frontImageFormat")
    private String frontImageFormat;
    
    @SerializedName("backImageFormat")
    private String backImageFormat;
    
    // Constructor
    public IdCardBase64Request(String frontImageBase64, String backImageBase64, 
                              String frontImageFormat, String backImageFormat) {
        this.frontImageBase64 = frontImageBase64;
        this.backImageBase64 = backImageBase64;
        this.frontImageFormat = frontImageFormat;
        this.backImageFormat = backImageFormat;
    }
    
    // Getters and setters
    // ... add getters and setters for all fields
}