package vn.edu.fpt.sapsmobile.dtos.auth;

import vn.edu.fpt.sapsmobile.models.User;

public class RegisterResponse {
    private String message;
    private String accessToken;
    private User user;

    public String getMessage() {
        return message;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public User getUser() {
        return user;
    }
}
