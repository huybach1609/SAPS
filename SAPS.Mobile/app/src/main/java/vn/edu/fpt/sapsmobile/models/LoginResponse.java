package vn.edu.fpt.sapsmobile.models;

import com.google.gson.annotations.SerializedName;

public class LoginResponse {
    @SerializedName("accessToken")
    private String token;
    @SerializedName("refreshToken")
    private String refreshToken;

    @SerializedName("tokenType")
    private String tokenType;

    @SerializedName("expiresAt")
    private String expiresAt;

    private User user;

    public String getAccessToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public User getUser() { return user; }
}

