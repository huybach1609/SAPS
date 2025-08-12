package vn.edu.fpt.sapsmobile.services;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.sapsmobile.API.ApiTest;
import vn.edu.fpt.sapsmobile.API.AuthService;
import vn.edu.fpt.sapsmobile.BuildConfig;
import vn.edu.fpt.sapsmobile.models.AuthResponse;
import vn.edu.fpt.sapsmobile.models.GoogleTokenRequest;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.utils.TokenManager;
import vn.edu.fpt.sapsmobile.API.ApiClient;
import vn.edu.fpt.sapsmobile.models.LoginRequest;
import vn.edu.fpt.sapsmobile.models.LoginResponse;
import vn.edu.fpt.sapsmobile.models.RegisterRequest;
import vn.edu.fpt.sapsmobile.models.RegisterResponse;

public class AuthenticationService {
    private static final String TAG = "AuthenticationService";
    private static final String SERVER_CLIENT_ID = BuildConfig.SERVER_CLIENT_ID;
    private static final String SERVER_BASE_URL = BuildConfig.SERVER_BASE_URL;

    private Context context;
    private GoogleSignInClient mGoogleSignInClient;
    private AuthService authService;
    private TokenManager tokenManager;
    private AuthCallback authCallback;

    public interface AuthCallback {
        void onAuthSuccess(User user);
        void onAuthFailure(String error);
    }

    public interface RegisterCallback {
        void onSuccess(String message);
        void onFailure(String error);
    }

    public AuthenticationService(Context context, AuthCallback callback) {
        this.context = context;
        this.authCallback = callback;
        this.tokenManager = new TokenManager(context);
        setupGoogleSignIn();
        setupRetrofit();
    }

    public AuthenticationService(Context context) {
        this.context = context;
        this.tokenManager = new TokenManager(context);
        setupRetrofit();
    }

    private void setupGoogleSignIn() {
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(SERVER_CLIENT_ID)
                .requestEmail()
                .build();

        mGoogleSignInClient = GoogleSignIn.getClient(context, gso);
    }

    private void setupRetrofit() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(SERVER_BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        authService = retrofit.create(AuthService.class);
    }

    public Intent getSignInIntent() {
        return mGoogleSignInClient.getSignInIntent();
    }

    public void handleSignInResult(Intent data) {
        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
        try {
            GoogleSignInAccount account = task.getResult(ApiException.class);
            processSignInResult(account);
        } catch (ApiException e) {
            Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
            Log.e(TAG, "Error message: " + e.getMessage());
            authCallback.onAuthFailure("Google Sign-In failed: " + e.getMessage());
        }
    }

    private void processSignInResult(GoogleSignInAccount account) {
        if (account != null) {
            String idToken = account.getIdToken();
            if (idToken != null) {
                verifyTokenWithBackend(idToken);
            } else {
                authCallback.onAuthFailure("Failed to get ID token");
            }
        } else {
            authCallback.onAuthFailure("Google account is null");
        }
    }

    private void verifyTokenWithBackend(String idToken) {
        GoogleTokenRequest request = new GoogleTokenRequest(idToken);

        Call<AuthResponse> call = authService.verifyGoogleToken(request);
        call.enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                Log.d(TAG, "Response Code: " + response.code());
                Log.d(TAG, "Response Message: " + response.message());

                if (response.isSuccessful() && response.body() != null) {
                    AuthResponse authResponse = response.body();
                    Log.d(TAG, "Success: Access Token exists: " + (authResponse.getAccessToken() != null));
                    Log.d(TAG, "Success: User exists: " + (authResponse.getUser() != null));

                    // Save tokens and user data
                    tokenManager.saveTokens(
                            authResponse.getAccessToken(),
                            authResponse.getRefreshToken()
                    );
                    tokenManager.saveUserData(authResponse.getUser());

                    authCallback.onAuthSuccess(authResponse.getUser());
                } else {
                    Log.e(TAG, "Backend verification failed");
                    authCallback.onAuthFailure("Backend verification failed");
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                Log.e(TAG, "Network error: " + t.getMessage());
                authCallback.onAuthFailure("Network error: " + t.getMessage());
            }
        });
    }

    public void signOut(Runnable onComplete) {
        mGoogleSignInClient.signOut()
                .addOnCompleteListener(task -> {
                    tokenManager.clearTokens();
                    if (onComplete != null) {
                        onComplete.run();
                    }
                });
    }

    public void loginWithEmail(String email, String password, AuthCallback callback) {
        // Validate input
        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            callback.onAuthFailure("Email and password cannot be empty");
            return;
        }


        LoginRequest request = new LoginRequest(email.trim(), password);

//        Retrofit retrofit = new Retrofit.Builder()
//                .baseUrl(BuildConfig.MOCK_BASE_URL)
//                .addConverterFactory(GsonConverterFactory.create())
//                .build();



        Retrofit retrofit = ApiTest.getServiceMockApi(context);

        AuthService authService = retrofit.create(AuthService.class);

        Log.d(TAG, "Attempting login with email: " + email);

        authService.login(request).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                Log.d(TAG, "Login response code: " + response.code());
                Log.d(TAG, "Login response message: " + response.message());

                if (response.isSuccessful() && response.body() != null) {
                    LoginResponse loginResponse = response.body();

                    Log.d(TAG, "Access token received: " + (loginResponse.getAccessToken() != null));
                    Log.d(TAG, "User data received: " + (loginResponse.getUser() != null));

                    // Kiểm tra kỹ càng response data
                    if (isValidLoginResponse(loginResponse)) {
                        // Lưu token và user data vào TokenManager
                        tokenManager.saveTokens(loginResponse.getAccessToken(), loginResponse.getRefreshToken());
                        tokenManager.saveUserData(loginResponse.getUser());

                        Log.d(TAG, "Login successful for user: " + loginResponse.getUser().getEmail());
                        // Gọi callback thành công
                        callback.onAuthSuccess(loginResponse.getUser());
                    } else {
                        Log.e(TAG, "Invalid login response data");
                        callback.onAuthFailure("Invalid response from server");
                    }
                } else {
                    // Xử lý các mã lỗi HTTP cụ thể
                    String errorMessage = getErrorMessage(response.code());
                    Log.e(TAG, "Login failed with code: " + response.code() + ", message: " + errorMessage);
                    callback.onAuthFailure(errorMessage);
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                Log.e(TAG, "Login network error: " + t.getMessage());
                callback.onAuthFailure("Network error: " + t.getMessage());
            }
        });
    }

    // Kiểm tra response có hợp lệ không
    private boolean isValidLoginResponse(LoginResponse loginResponse) {
        if (loginResponse == null) {
            Log.e(TAG, "LoginResponse is null");
            return false;
        }

        if (loginResponse.getAccessToken() == null || loginResponse.getAccessToken().trim().isEmpty()) {
            Log.e(TAG, "Access token is null or empty");
            return false;
        }

        if (loginResponse.getUser() == null) {
            Log.e(TAG, "User data is null");
            return false;
        }

        User user = loginResponse.getUser();
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            Log.e(TAG, "User email is null or empty");
            return false;
        }

        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
            Log.e(TAG, "User name is null or empty");
            return false;
        }

        return true;
    }

    // Lấy thông điệp lỗi dựa trên HTTP status code
    private String getErrorMessage(int statusCode) {
        switch (statusCode) {
            case 400:
                return "Bad request. Please check your input.";
            case 401:
                return "Invalid email or password";
            case 403:
                return "Access forbidden";
            case 404:
                return "Service not found";
            case 422:
                return "Invalid data provided";
            case 500:
                return "Server error. Please try again later.";
            case 503:
                return "Service unavailable. Please try again later.";
            default:
                return "Login failed. Please try again.";
        }
    }

    // Đăng ký tài khoản mới - FIXED VERSION
    public void register(String name, String email, String password, RegisterCallback callback) {
        // Validate input
        if (name == null || name.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                password == null || password.trim().isEmpty()) {
            callback.onFailure("All fields are required");
            return;
        }

        RegisterRequest request = new RegisterRequest(name.trim(), email.trim(), password);

        // Sử dụng MOCK_BASE_URL để test
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(BuildConfig.MOCK_BASE_URL) // <-- Dùng MOCK_BASE_URL để test
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        AuthService authService = retrofit.create(AuthService.class);

        Log.d(TAG, "Attempting registration with email: " + email);

        authService.register(request).enqueue(new Callback<RegisterResponse>() {
            @Override
            public void onResponse(Call<RegisterResponse> call, Response<RegisterResponse> response) {
                Log.d(TAG, "Register response code: " + response.code());
                Log.d(TAG, "Register response message: " + response.message());

                if (response.isSuccessful() && response.body() != null) {
                    RegisterResponse registerResponse = response.body();

                    if (registerResponse.getMessage() != null && !registerResponse.getMessage().trim().isEmpty()) {
                        Log.d(TAG, "Registration successful: " + registerResponse.getMessage());
                        callback.onSuccess(registerResponse.getMessage());
                    } else {
                        Log.e(TAG, "Registration response message is empty");
                        callback.onFailure("Registration completed but no confirmation message received");
                    }
                } else {
                    String errorMessage = getRegisterErrorMessage(response.code());
                    Log.e(TAG, "Registration failed with code: " + response.code() + ", message: " + errorMessage);
                    callback.onFailure(errorMessage);
                }
            }

            @Override
            public void onFailure(Call<RegisterResponse> call, Throwable t) {
                Log.e(TAG, "Register network error: " + t.getMessage());
                callback.onFailure("Network error: " + t.getMessage());
            }
        });
    }


    public void resetPassword(String email, AuthCallback callback) {
        if (email == null || email.trim().isEmpty()) {
            callback.onAuthFailure("Email is required");
            return;
        }

        Call<Void> call = authService.resetPassword(email.trim());
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    callback.onAuthSuccess(null);
                } else {
                    callback.onAuthFailure("Reset failed: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                callback.onAuthFailure("Network error: " + t.getMessage());
            }
        });
    }


    // Lấy thông điệp lỗi đăng ký dựa trên HTTP status code
    private String getRegisterErrorMessage(int statusCode) {
        switch (statusCode) {
            case 400:
                return "Bad request. Please check your input.";
            case 409:
                return "Email already exists. Please use a different email.";
            case 422:
                return "Invalid data provided. Please check your information.";
            case 500:
                return "Server error. Please try again later.";
            case 503:
                return "Service unavailable. Please try again later.";
            default:
                return "Registration failed. Please try again.";
        }
    }

    public boolean isLoggedIn() {
        return tokenManager.isLoggedIn();
    }

    public User getCurrentUser() {
        return tokenManager.getUserData();
    }
}