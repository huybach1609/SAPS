package vn.edu.fpt.sapsmobile.dtos.auth;

public class LoginRequest {
    private String emailOrCitizenIdNo;
    private String password;
    private boolean rememberMe;

    public LoginRequest(String emailOrCitizenIdNo, String password) {
        this.emailOrCitizenIdNo = emailOrCitizenIdNo;
        this.password = password;
        this.rememberMe =true;
    }

}
