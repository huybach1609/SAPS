package vn.edu.fpt.sapsmobile.network.interceptor;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.NonNull;

import com.google.gson.Gson;

import java.io.IOException;
import java.time.ZonedDateTime;

import okhttp3.HttpUrl;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import vn.edu.fpt.sapsmobile.activities.auth.LoginActivity;
import vn.edu.fpt.sapsmobile.dtos.auth.AuthenticateUserResponse;
import vn.edu.fpt.sapsmobile.dtos.auth.RefreshTokenRequest;
import vn.edu.fpt.sapsmobile.network.ssl.SSLHelper;
import vn.edu.fpt.sapsmobile.utils.DateTimeHelper;
import vn.edu.fpt.sapsmobile.utils.JwtUtils;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class TokenInterceptor implements Interceptor {
    private static final int LEEWAY_SECONDS = 30;
    private final Context context;
    private final String baseUrl;
    private final TokenManager tokenManager;
    private final Gson gson;
    private final String TAG = "TokenInterceptor";

    // Synchronization objects
    private final Object refreshLock = new Object();
    private volatile boolean isRefreshing = false;
    private volatile String refreshingToken = null; // Track which token is being refreshed

    public TokenInterceptor(Context context, String baseUrl) {
        this.context = context;
        this.baseUrl = baseUrl;
        this.tokenManager = new TokenManager(context);
        this.gson = new Gson();
    }

    @NonNull
    @Override
    public Response intercept(Chain chain) throws IOException {
        Request originalRequest = chain.request();
        String accessToken = tokenManager.getAccessToken();

        if (accessToken != null) {
            // Add token to request if available
            Request requestWithToken = addTokenToRequest(originalRequest, accessToken);
            Response response = chain.proceed(requestWithToken);

            try {
                String expiredAt = JwtUtils.getExpired(accessToken);
                ZonedDateTime expireAtUTC7 = DateTimeHelper.changeToUCT7Flexible(expiredAt);
                Log.i(TAG, "intercept: expired at " + expireAtUTC7);
            } catch (Exception e) {
                Log.w(TAG, "Failed to parse token expiration", e);
            }

            // Handle 401 - try refresh token once with synchronization
            if (response.code() == 401) {
                HttpUrl url = originalRequest.url();
                Log.w(TAG, "Request returned 401: " + url);
                response.close(); // Close the original response

                String refreshToken = tokenManager.getRefreshToken();
                if (refreshToken != null) {
                    // Use synchronized block to prevent concurrent refresh attempts
                    synchronized (refreshLock) {
                        if (isRefreshing && refreshToken.equals(refreshingToken)) {
                            Log.i(TAG, "Already refreshing token, waiting...");
                            try {
                                // Wait for the ongoing refresh to complete
                                refreshLock.wait(30000); // 30 second timeout
                            } catch (InterruptedException e) {
                                Thread.currentThread().interrupt();
                                Log.w(TAG, "Thread interrupted while waiting for token refresh");
                                return createUnauthorizedResponse(originalRequest);
                            }
                        }

                        // Check if token was refreshed while waiting
                        String currentAccessToken = tokenManager.getAccessToken();
                        if (currentAccessToken != null && !currentAccessToken.equals(accessToken)) {
                            Log.i(TAG, "Token was refreshed by another thread, retrying request");
                            Request retryRequest = addTokenToRequest(originalRequest, currentAccessToken);
                            return chain.proceed(retryRequest);
                        }

                        // Check if we should attempt refresh
                        String currentRefreshToken = tokenManager.getRefreshToken();
                        if (currentRefreshToken != null && !isRefreshing) {
                            isRefreshing = true;
                            refreshingToken = currentRefreshToken;

                            try {
                                if (tryRefreshToken(currentRefreshToken, accessToken)) {
                                    // Refresh successful, retry with new token
                                    String newAccessToken = tokenManager.getAccessToken();
                                    Request retryRequest = addTokenToRequest(originalRequest, newAccessToken);
                                    return chain.proceed(retryRequest);
                                } else {
                                    // Refresh failed, redirect to login
                                    redirectToLogin();
                                    return createUnauthorizedResponse(originalRequest);
                                }
                            } finally {
                                isRefreshing = false;
                                refreshingToken = null;
                                refreshLock.notifyAll(); // Wake up waiting threads
                            }
                        } else {
                            // No refresh token or already refreshing, redirect to login
                            redirectToLogin();
                            return createUnauthorizedResponse(originalRequest);
                        }
                    }
                } else {
                    // No refresh token, redirect to login
                    redirectToLogin();
                    return createUnauthorizedResponse(originalRequest);
                }
            }

            return response; // Return the original response if no 401

        } else {
            // No access token available - proceed without token
            Log.w(TAG, "No access token available, proceeding without authentication");
            return chain.proceed(originalRequest);
        }
    }

    private Request addTokenToRequest(Request request, String accessToken) {
        if (accessToken != null && !JwtUtils.isExpired(accessToken, LEEWAY_SECONDS)) {
            String cleanToken = accessToken.replaceFirst("(?i)^Bearer\\s+", "");
            return request.newBuilder()
                    .header("Authorization", "Bearer " + cleanToken)
                    .build();
        }
        return request;
    }

    private boolean tryRefreshToken(String refreshToken, String accessToken) {
        try {
            OkHttpClient refreshClient = new OkHttpClient.Builder()
                    .sslSocketFactory(SSLHelper.getSSLContext().getSocketFactory(), SSLHelper.getTrustManager())
                    .hostnameVerifier((hostname, session) -> true)
                    .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                    .writeTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
                    .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
                    .build();

            String json = gson.toJson(new RefreshTokenRequest(refreshToken));
            RequestBody body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json);

            // Build the request first
            Request.Builder requestBuilder = new Request.Builder()
                    .url(baseUrl + "api/auth/refresh-token")
                    .post(body);

            // Add access token to header if available and not expired
            if (accessToken != null) {
                String cleanToken = accessToken.replaceFirst("(?i)^Bearer\\s+", "");
                String bearerToken = "Bearer " + cleanToken;
                Log.i(TAG, "bearer: " + bearerToken );
                requestBuilder.header("Authorization", bearerToken);
            } else {
                return false;
            }

            Request refreshRequest = requestBuilder.build();

            Log.i(TAG, "tryRefreshToken: " + refreshToken);
            Log.i(TAG, "tryHeaderToken: " + refreshRequest.header("Authorization"));

            try (Response refreshResponse = refreshClient.newCall(refreshRequest).execute()) {
                if (refreshResponse.isSuccessful() && refreshResponse.body() != null) {
                    String responseBody = refreshResponse.body().string();
                    AuthenticateUserResponse authenticateUserResponse = gson.fromJson(responseBody, AuthenticateUserResponse.class);
                    if (authenticateUserResponse != null && authenticateUserResponse.getAccessToken() != null) {
                        Log.i(TAG, "get new refreshToken: " + authenticateUserResponse.getRefreshToken());

                        tokenManager.saveTokens(authenticateUserResponse.getAccessToken(), authenticateUserResponse.getRefreshToken());
                        return true;
                    }
                } else {
                    Log.i(TAG, "ErrorResult:tryRefreshToken " + refreshResponse.code() + " - " +
                            (refreshResponse.body() != null ? refreshResponse.body().string() : "No body"));
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in tryRefreshToken", e);
        }
        return false;
    }

    private void redirectToLogin() {
        tokenManager.clearTokens();
        Intent loginIntent = new Intent(context, LoginActivity.class);
        loginIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        context.startActivity(loginIntent);
    }

    private Response createUnauthorizedResponse(Request request) {
        return new Response.Builder()
                .request(request)
                .protocol(okhttp3.Protocol.HTTP_1_1)
                .code(401)
                .message("Unauthorized")
                .body(okhttp3.ResponseBody.create(MediaType.parse("application/json"), "{}"))
                .build();
    }
}