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
import vn.edu.fpt.sapsmobile.API.ApiTest;
import vn.edu.fpt.sapsmobile.API.AuthApi;
import vn.edu.fpt.sapsmobile.API.apiinterface.UserApiService;
import vn.edu.fpt.sapsmobile.API.apiinterface.ClientApiService;
import vn.edu.fpt.sapsmobile.BuildConfig;
import vn.edu.fpt.sapsmobile.models.*;
import vn.edu.fpt.sapsmobile.utils.JwtUtils;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class AuthenticationService {
    private static final String TAG = "AuthenticationService";
    private static final String SERVER_CLIENT_ID = BuildConfig.SERVER_CLIENT_ID;

    private final Context context;
    private final GoogleSignInClient googleSignInClient;
    private final AuthApi authApi;
    private final UserApiService userApiService;
    private final ClientApiService clientApiService;
    private final TokenManager tokenManager;
    private AuthCallback authCallback;

    // Interfaces
    public interface AuthCallback {
        void onAuthSuccess(User user);
        void onAuthFailure(String error);
    }

    public interface RegisterCallback {
        void onSuccess(String message);
        void onFailure(String error);
    }

    public interface ClientProfileCallback {
        void onSuccess(User user);
        void onFailure(String error);
    }

    // Constructors
    public AuthenticationService(Context context, AuthCallback callback) {
        this(context);
        this.authCallback = callback;
    }

    public AuthenticationService(Context context) {
        this.context = context;
        this.tokenManager = new TokenManager(context);
        this.googleSignInClient = initializeGoogleSignInClient();

        Retrofit retrofit = ApiTest.getServiceLast(context);
        this.authApi = retrofit.create(AuthApi.class);
        this.userApiService = retrofit.create(UserApiService.class);
        this.clientApiService = retrofit.create(ClientApiService.class);
    }

    // Google Sign-In Setup
    private GoogleSignInClient initializeGoogleSignInClient() {
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(SERVER_CLIENT_ID)
                .requestEmail()
                .build();
        return GoogleSignIn.getClient(context, gso);
    }

    public Intent getSignInIntent() {
        return googleSignInClient.getSignInIntent();
    }

    //region Google Sign-In Flow
    public void handleSignInResult(Intent data) {
        if (authCallback == null) {
            Log.e(TAG, "AuthCallback is null");
            return;
        }

        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
        try {
            GoogleSignInAccount account = task.getResult(ApiException.class);
            processGoogleSignIn(account);
        } catch (ApiException e) {
            Log.w(TAG, "Google Sign-In failed", e);
            authCallback.onAuthFailure("Google Sign-In failed: " + getGoogleSignInErrorMessage(e.getStatusCode()));
        }
    }

    private void processGoogleSignIn(GoogleSignInAccount account) {
        if (account.getIdToken() != null) {
            verifyGoogleTokenWithBackend(account.getIdToken());
        } else {
            authCallback.onAuthFailure("Failed to get Google ID token");
        }
    }

    private void verifyGoogleTokenWithBackend(String idToken) {
        GoogleTokenRequest request = new GoogleTokenRequest(idToken);

        executeApiCall(authApi.verifyGoogleToken(request), new ApiResponseHandler<AuthResponse>() {
            @Override
            public void onSuccess(AuthResponse response) {
                handleAuthSuccess(response.getAccessToken(), response.getRefreshToken(), response.getUser());
            }

            @Override
            public void onError(String error) {
                authCallback.onAuthFailure("Google authentication failed: " + error);
            }
        });
    }

    //endregion

    // Email/Password Login
    public void loginWithEmail(String email, String password, AuthCallback callback) {
        if (!validateCredentials(email, password, callback)) return;

        LoginRequest request = new LoginRequest(email.trim(), password);
        Log.d(TAG, "Attempting login with email: " + email);

        executeApiCall(authApi.login(request), new ApiResponseHandler<LoginResponse>() {
            @Override
            public void onSuccess(LoginResponse response) {
                if (isValidLoginResponse(response)) {
                    String accessToken = response.getAccessToken();
                    String refreshToken = response.getRefreshToken();
                    User user = response.getUser();

                    tokenManager.saveTokens(accessToken, refreshToken);

                    if (user != null) {
                        tokenManager.saveUserData(user);
                        callback.onAuthSuccess(user);
                    } else {
                        fetchUserDataFromToken(accessToken, callback);
                    }
                } else {
                    callback.onAuthFailure("Invalid response from server");
                }
            }

            @Override
            public void onError(String error) {
                callback.onAuthFailure(error);
            }
        });
    }

    // Registration
    public void register(String name, String email, String password, RegisterCallback callback) {
        if (!validateRegistrationData(name, email, password, callback)) return;

        RegisterRequest request = new RegisterRequest(name.trim(), email.trim(), password);
        Log.d(TAG, "Attempting registration with email: " + email);

        executeApiCall(authApi.register(request), new ApiResponseHandler<RegisterResponse>() {
            @Override
            public void onSuccess(RegisterResponse response) {
                String message = response.getMessage();
                if (message != null && !message.trim().isEmpty()) {
                    callback.onSuccess(message);
                } else {
                    callback.onFailure("Registration completed but no confirmation received");
                }
            }

            @Override
            public void onError(String error) {
                callback.onFailure(error);
            }
        });
    }

    // Password Reset
    public void resetPassword(String email, AuthCallback callback) {
        if (!validateEmail(email)) {
            callback.onAuthFailure("Valid email is required");
            return;
        }

        executeApiCall(authApi.resetPassword(email.trim()), new ApiResponseHandler<Void>() {
            @Override
            public void onSuccess(Void response) {
                callback.onAuthSuccess(null);
            }

            @Override
            public void onError(String error) {
                callback.onAuthFailure("Password reset failed: " + error);
            }
        });
    }

    // Sign Out
    public void signOut(Runnable onComplete) {
        googleSignInClient.signOut().addOnCompleteListener(task -> {
            tokenManager.clearTokens();
            if (onComplete != null) onComplete.run();
        });
    }

    // Utility Methods
    public boolean isLoggedIn() {
        return tokenManager.isLoggedIn();
    }

    public User getCurrentUser() {
        return tokenManager.getUserData();
    }

    // Private Helper Methods
    private void fetchUserDataFromToken(String accessToken, AuthCallback callback) {
        String userId = JwtUtils.getUserIdFromToken(accessToken);

        if (userId == null) {
            Log.e(TAG, "Could not extract userId from JWT token");
            callback.onAuthFailure("Invalid token format");
            return;
        }

        Log.d(TAG, "Fetching user data for userId: " + userId);

        executeApiCall(userApiService.getUserById(userId), new ApiResponseHandler<User>() {
            @Override
            public void onSuccess(User user) {
                fetchClientProfile();
                tokenManager.saveUserData(user);
                callback.onAuthSuccess(user);
            }

            @Override
            public void onError(String error) {
                callback.onAuthFailure("Failed to fetch user data: " + error);
            }
        });
    }

    public void fetchClientProfile(ClientProfileCallback callback) {
        User currentUser = tokenManager.getUserData();
        if (currentUser == null || currentUser.getId() == null) {
            Log.e(TAG, "Cannot fetch client profile: User data is null or missing user ID");
            if (callback != null) {
                callback.onFailure("User data is null or missing user ID");
            }
            return;
        }

        Call<ClientProfileResponse> call = clientApiService.getClientProfile(currentUser.getId());
        executeApiCall(call, new ApiResponseHandler<ClientProfileResponse>() {
            @Override
            public void onSuccess(ClientProfileResponse response) {
                Log.d(TAG, "Client profile fetched successfully");
                
                // Update the current user with the fetched profile data
                if (response != null) {
                    // Create a new ClientProfile object from the response
                    ClientProfile clientProfile = new ClientProfile();
                    clientProfile.setUserId(response.getId());
                    clientProfile.setCitizenId(response.getCitizenId());
                    clientProfile.setDateOfBirth(response.getDateOfBirth());
                    clientProfile.setSex(response.isSex());
                    clientProfile.setNationality(response.getNationality());
                    clientProfile.setPlaceOfOrigin(response.getPlaceOfOrigin());
                    clientProfile.setPlaceOfResidence(response.getPlaceOfResidence());
                    clientProfile.setGoogleId(response.getGoogleId());
                    
                    // Set the client profile to the current user
                    currentUser.setClientProfile(clientProfile);
                    
                    // Save updated user data to token manager
                    tokenManager.saveUserData(currentUser);
                    Log.d(TAG, "Updated user data saved to token manager");
                    
                    if (callback != null) {
                        callback.onSuccess(currentUser);
                    }
                } else {
                    if (callback != null) {
                        callback.onFailure("Received null response from server");
                    }
                }
            }

            @Override
            public void onError(String error) {
                Log.e(TAG, "Failed to fetch client profile: " + error);
                if (callback != null) {
                    callback.onFailure(error);
                }
            }
        });
    }

    // Overloaded method without callback for backward compatibility
    public void fetchClientProfile() {
        fetchClientProfile(null);
    }

    private void handleAuthSuccess(String accessToken, String refreshToken, User user) {
        if (authCallback == null) return;

        tokenManager.saveTokens(accessToken, refreshToken);
        if (user != null) {
            tokenManager.saveUserData(user);
        }
        authCallback.onAuthSuccess(user);
    }

    // Generic API Call Handler
    private <T> void executeApiCall(Call<T> call, ApiResponseHandler<T> handler) {
        call.enqueue(new Callback<T>() {
            @Override
            public void onResponse(Call<T> call, Response<T> response) {
                if (response.isSuccessful() && response.body() != null) {
                    handler.onSuccess(response.body());
                } else {
                    String error = parseErrorResponse(response);
                    Log.e(TAG, "API call failed: " + error);
                    handler.onError(error);
                }
            }

            @Override
            public void onFailure(Call<T> call, Throwable t) {
                String error = "Network error: " + t.getMessage();
                Log.e(TAG, error, t);
                handler.onError(error);
            }
        });
    }

    // Response Handler Interface
    private interface ApiResponseHandler<T> {
        void onSuccess(T response);
        void onError(String error);
    }

    // Validation Methods
    private boolean validateCredentials(String email, String password, AuthCallback callback) {
        if (!isValidString(email) || !isValidString(password)) {
            callback.onAuthFailure("Email and password cannot be empty");
            return false;
        }
        if (!validateEmail(email)) {
            callback.onAuthFailure("Please enter a valid email address");
            return false;
        }
        return true;
    }

    private boolean validateRegistrationData(String name, String email, String password, RegisterCallback callback) {
        if (!isValidString(name) || !isValidString(email) || !isValidString(password)) {
            callback.onFailure("All fields are required");
            return false;
        }
        if (!validateEmail(email)) {
            callback.onFailure("Please enter a valid email address");
            return false;
        }
        if (password.length() < 6) {
            callback.onFailure("Password must be at least 6 characters long");
            return false;
        }
        return true;
    }

    private boolean validateEmail(String email) {
        return email != null && android.util.Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches();
    }

    private boolean isValidString(String str) {
        return str != null && !str.trim().isEmpty();
    }

    private boolean isValidLoginResponse(LoginResponse response) {
        return response != null && isValidString(response.getAccessToken());
    }

    // Error Handling
    private String parseErrorResponse(Response<?> response) {
        int code = response.code();
        switch (code) {
            case 400: return "Bad request. Please check your input.";
            case 401: return "Invalid email or password";
            case 403: return "Access forbidden";
            case 404: return "Service not found";
            case 409: return "Email already exists";
            case 422: return "Invalid data provided";
            case 500: return "Server error. Please try again later.";
            case 503: return "Service unavailable. Please try again later.";
            default: return "Request failed. Please try again.";
        }
    }

    private String getGoogleSignInErrorMessage(int statusCode) {
        switch (statusCode) {
            case 7: return "Network error occurred";
            case 8: return "Internal error occurred";
            case 10: return "Developer error in configuration";
            case 12501: return "Sign-in was cancelled";
            case 12502: return "Sign-in currently in progress";
            default: return "Unknown error occurred";
        }
    }
}