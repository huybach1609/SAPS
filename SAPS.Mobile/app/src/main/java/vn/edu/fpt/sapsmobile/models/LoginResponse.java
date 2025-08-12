package vn.edu.fpt.sapsmobile.models;

public class LoginResponse {
    private String token;
    private String refreshToken;
    private User user;

    public String getAccessToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public User getUser() { return user; }
}

