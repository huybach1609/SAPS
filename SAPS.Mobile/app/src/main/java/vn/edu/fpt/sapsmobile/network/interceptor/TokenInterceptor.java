package vn.edu.fpt.sapsmobile.network.interceptor;

import android.content.Context;
import android.content.Intent;
import androidx.annotation.NonNull;
import com.google.gson.Gson;
import java.io.IOException;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import vn.edu.fpt.sapsmobile.activities.auth.LoginActivity;
import vn.edu.fpt.sapsmobile.dtos.auth.LoginResponse;
import vn.edu.fpt.sapsmobile.dtos.auth.RefreshTokenRequest;
import vn.edu.fpt.sapsmobile.network.ssl.SSLHelper;
import vn.edu.fpt.sapsmobile.utils.JwtUtils;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class TokenInterceptor implements Interceptor {
    private static final int LEEWAY_SECONDS = 30;
    private final Context context;
    private final String baseUrl;
    private final TokenManager tokenManager;
    private final Gson gson;

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

        // Add token to request if available and not expired
        Request requestWithToken = addTokenToRequest(originalRequest, accessToken);
        Response response = chain.proceed(requestWithToken);

        // Handle 401 - try refresh token once
        if (response.code() == 401) {
            response.close();
            
            String refreshToken = tokenManager.getRefreshToken();
            if (refreshToken != null && tryRefreshToken(refreshToken)) {
                // Refresh successful, retry with new token
                String newAccessToken = tokenManager.getAccessToken();
                Request retryRequest = addTokenToRequest(originalRequest, newAccessToken);
                return chain.proceed(retryRequest);
            } else {
                // Refresh failed, redirect to login
                redirectToLogin();
                return createUnauthorizedResponse(originalRequest);
            }
        }

        return response;
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

    private boolean tryRefreshToken(String refreshToken) {
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

            Request refreshRequest = new Request.Builder()
                    .url(baseUrl + "api/auth/refresh-token")
                    .post(body)
                    .build();

            try (Response refreshResponse = refreshClient.newCall(refreshRequest).execute()) {
                if (refreshResponse.isSuccessful() && refreshResponse.body() != null) {
                    String responseBody = refreshResponse.body().string();
                    LoginResponse loginResponse = gson.fromJson(responseBody, LoginResponse.class);
                    
                    if (loginResponse != null && loginResponse.getAccessToken() != null) {
                        tokenManager.saveTokens(loginResponse.getAccessToken(), loginResponse.getRefreshToken());
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            // Log error if needed
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