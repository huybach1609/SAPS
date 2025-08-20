package vn.edu.fpt.sapsmobile.dtos.auth;

public class LoginRequest {
    private String email;
    private String password;
    private boolean rememberMe;

    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
        this.rememberMe =true;
    }

}
