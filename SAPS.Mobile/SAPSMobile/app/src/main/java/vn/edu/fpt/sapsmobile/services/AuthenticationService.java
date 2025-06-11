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
import vn.edu.fpt.sapsmobile.API.AuthService;
import vn.edu.fpt.sapsmobile.BuildConfig;
import vn.edu.fpt.sapsmobile.models.AuthResponse;
import vn.edu.fpt.sapsmobile.models.GoogleTokenRequest;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.utils.TokenManager;


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

    public AuthenticationService(Context context, AuthCallback callback) {
        this.context = context;
        this.authCallback = callback;
        this.tokenManager = new TokenManager(context);
        setupGoogleSignIn();
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

    public boolean isLoggedIn() {
        return tokenManager.isLoggedIn();
    }

    public User getCurrentUser() {
        return tokenManager.getUserData();
    }
}