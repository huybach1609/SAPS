package vn.edu.fpt.sapsmobile.network.service;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.Header;
import retrofit2.http.POST;
import vn.edu.fpt.sapsmobile.dtos.AuthResponse;
import vn.edu.fpt.sapsmobile.dtos.GoogleTokenRequest;
import vn.edu.fpt.sapsmobile.dtos.LoginRequest;
import vn.edu.fpt.sapsmobile.dtos.LoginResponse;
import vn.edu.fpt.sapsmobile.dtos.RegisterRequest;
import vn.edu.fpt.sapsmobile.dtos.RegisterResponse;
import vn.edu.fpt.sapsmobile.dtos.UserRegisterRequest;
import vn.edu.fpt.sapsmobile.dtos.UserRegisterResponse;

public interface AuthApi {  // or AuthService, if it fits the rest of your project
    @POST("api/auth/google/verify")
    Call<AuthResponse> verifyGoogleToken(@Body GoogleTokenRequest request);

    @POST("api/auth/refresh")
    Call<AuthResponse> refreshToken(@Header("Authorization") String bearerToken);

    @POST("api/auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("api/auth/register")
    Call<RegisterResponse> register(@Body RegisterRequest request);

    @POST("api/user/register")
    Call<UserRegisterResponse> registerUser(@Body UserRegisterRequest request);

    @FormUrlEncoded
    @POST("/auth/reset-password")
    Call<Void> resetPassword(@Field("email") String email);
}
