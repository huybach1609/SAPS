package vn.edu.fpt.sapsmobile.dtos.auth;

import com.google.gson.annotations.SerializedName;

public class GoogleAuthRequest {
    @SerializedName("accessToken")
    private String accessToken;

    public GoogleAuthRequest(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }
}
