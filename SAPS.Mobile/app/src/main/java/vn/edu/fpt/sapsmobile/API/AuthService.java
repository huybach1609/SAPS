package vn.edu.fpt.sapsmobile.API;// API/AuthService.java

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;
import vn.edu.fpt.sapsmobile.models.AuthResponse;
import vn.edu.fpt.sapsmobile.models.GoogleTokenRequest;


public interface AuthService {
    @POST("api/auth/google/verify")
    Call<AuthResponse> verifyGoogleToken(@Body GoogleTokenRequest request);

    @POST("api/auth/refresh")
    Call<AuthResponse> refreshToken(@Header("Authorization") String bearerToken);
}
