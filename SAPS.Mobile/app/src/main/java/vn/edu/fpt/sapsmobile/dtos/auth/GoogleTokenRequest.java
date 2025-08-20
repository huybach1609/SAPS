package vn.edu.fpt.sapsmobile.dtos.auth;

// Models/GoogleTokenRequest.java
public class GoogleTokenRequest {
    private String idToken;

    public GoogleTokenRequest(String idToken) {
        this.idToken = idToken;
    }

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
}