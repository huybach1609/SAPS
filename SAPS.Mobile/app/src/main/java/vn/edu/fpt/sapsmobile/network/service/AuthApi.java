package vn.edu.fpt.sapsmobile.network.service;

import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.Header;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import vn.edu.fpt.sapsmobile.dtos.auth.AuthResponse;
import vn.edu.fpt.sapsmobile.dtos.auth.GoogleAuthRequest;
import vn.edu.fpt.sapsmobile.dtos.auth.GoogleTokenRequest;
import vn.edu.fpt.sapsmobile.dtos.auth.LoginRequest;
import vn.edu.fpt.sapsmobile.dtos.auth.LoginResponse;
import vn.edu.fpt.sapsmobile.dtos.auth.RefreshTokenRequest;
import vn.edu.fpt.sapsmobile.dtos.auth.RegisterRequest;
import vn.edu.fpt.sapsmobile.dtos.auth.RegisterResponse;
import vn.edu.fpt.sapsmobile.dtos.profile.UserRegisterRequest;
import vn.edu.fpt.sapsmobile.dtos.profile.UserRegisterResponse;

public interface AuthApi {  // or AuthService, if it fits the rest of your project
    @POST("api/auth/google")
    Call<LoginResponse> authenticateWithGoogle(@Body GoogleAuthRequest request);

    @POST("api/auth/google/verify")
    Call<AuthResponse> verifyGoogleToken(@Body GoogleTokenRequest request);

    @POST("api/auth/refresh-token")
    Call<LoginResponse> refreshToken(@Body RefreshTokenRequest request);

    @POST("api/auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("api/auth/register")
    Call<RegisterResponse> register(@Body RegisterRequest request);

    @Multipart
    @POST("api/client/register")
    Call<UserRegisterResponse> registerUser(
            @Part("Email") RequestBody email,
            @Part("Password") RequestBody password,
            @Part("FullName") RequestBody fullName,
            @Part("Phone") RequestBody phone
    );

    @FormUrlEncoded
    @POST("/auth/reset-password")
    Call<Void> resetPassword(@Field("email") String email);
}
