package vn.edu.fpt.sapsmobile.API;// API/AuthService.java

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.Header;
import retrofit2.http.POST;
import vn.edu.fpt.sapsmobile.models.AuthResponse;
import vn.edu.fpt.sapsmobile.models.GoogleTokenRequest;
import vn.edu.fpt.sapsmobile.models.LoginRequest;
import vn.edu.fpt.sapsmobile.models.LoginResponse;
import vn.edu.fpt.sapsmobile.models.RegisterRequest;
import vn.edu.fpt.sapsmobile.models.RegisterResponse;


public interface AuthService {
    @POST("api/auth/google/verify")
    Call<AuthResponse> verifyGoogleToken(@Body GoogleTokenRequest request);

    @POST("api/auth/refresh")
    Call<AuthResponse> refreshToken(@Header("Authorization") String bearerToken);

    @POST("login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("register")
    Call<RegisterResponse> register(@Body RegisterRequest request);
    @FormUrlEncoded
    @POST("/auth/reset-password")
    Call<Void> resetPassword(@Field("email") String email);

}
