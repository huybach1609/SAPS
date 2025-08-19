package vn.edu.fpt.sapsmobile.dtos;

import vn.edu.fpt.sapsmobile.models.User;

// Models/AuthResponse.java
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private User user;
    private String expiresAt;

    // Getters and setters
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }
}
