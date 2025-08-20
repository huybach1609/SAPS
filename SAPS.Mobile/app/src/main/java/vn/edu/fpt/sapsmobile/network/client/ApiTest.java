package vn.edu.fpt.sapsmobile.network.client;


import static androidx.core.content.ContextCompat.startActivity;

import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import okhttp3.OkHttpClient;
import okhttp3.Protocol;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.MediaType;
import okhttp3.Response;
import okhttp3.ResponseBody;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.sapsmobile.activities.auth.LoginActivity;
import vn.edu.fpt.sapsmobile.dtos.auth.RefreshTokenRequest;
import vn.edu.fpt.sapsmobile.dtos.auth.LoginResponse;
import vn.edu.fpt.sapsmobile.network.interceptor.LogoutOnUnauthorizedAuthenticator;
import vn.edu.fpt.sapsmobile.utils.JwtUtils;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class ApiTest {
    private static final String BASE_URL = "https://192.168.1.25:3001/";
    private static final String BASE_URL_MOCKAPI = "https://192.168.1.25:7136/";
    private static final String BASE_URL_LAST = "https://192.168.1.25:7040/";
    private static Retrofit retrofit;
    private static Retrofit mockApiRetrofit; // Separate instance

    private static Retrofit mockApiLast;

    private static TokenManager tokenManager;
    private static final int LEEWAY_SECONDS = 30;

    public static Retrofit getService(Context context) {
        if (retrofit == null) {
            retrofit = createRetrofitInstance(BASE_URL, context);
        }
        return retrofit;
    }

    public static Retrofit getServiceMockApi(Context context) {
        if (mockApiRetrofit == null) {
            mockApiRetrofit = createRetrofitInstance(BASE_URL_MOCKAPI, context);
        }
        return mockApiRetrofit;
    }

    public static Retrofit getServiceLast(Context context) {
        if (mockApiLast == null) {
            mockApiLast = createRetrofitInstance(BASE_URL_LAST, context);
        }
        return mockApiLast;
    }


    private static Retrofit createRetrofitInstance(String baseUrl, Context context) {
        // Your SSL trust manager code here
        TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    @Override
                    public void checkClientTrusted(X509Certificate[] chain, String authType) {}
                    @Override
                    public void checkServerTrusted(X509Certificate[] chain, String authType) {}
                    @Override
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                }
        };

        try {
            // create logging
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            // bypass ssl
            SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, trustAllCerts, new SecureRandom());

            OkHttpClient.Builder clientBuilder = new OkHttpClient.Builder();

            clientBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
            clientBuilder.hostnameVerifier((hostname, session) -> true);

            // Add timeouts
            clientBuilder.connectTimeout(30, TimeUnit.SECONDS);
            clientBuilder.writeTimeout(60, TimeUnit.SECONDS);
            clientBuilder.readTimeout(60, TimeUnit.SECONDS);

            clientBuilder.addInterceptor(logging);

            tokenManager = new TokenManager(context);

            // Add token header with auto-refresh if expired
            clientBuilder.addInterceptor(chain -> {
                Request original = chain.request();

                String accessToken = tokenManager.getAccessToken();
                String refreshToken = tokenManager.getRefreshToken();

                // If access token exists and is expired (with leeway), try to refresh synchronously
                if (accessToken != null && JwtUtils.isExpired(accessToken, LEEWAY_SECONDS) && refreshToken != null) {
                    try {
                        OkHttpClient refreshClient = new OkHttpClient.Builder()
                                .sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
                                .hostnameVerifier((hostname, session) -> true)
                                .connectTimeout(30, TimeUnit.SECONDS)
                                .writeTimeout(60, TimeUnit.SECONDS)
                                .readTimeout(60, TimeUnit.SECONDS)
                                .build();

                        Gson gsonLocal = new Gson();
                        String json = gsonLocal.toJson(new RefreshTokenRequest(refreshToken));
                        RequestBody body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json);

                        Request refreshRequest = new Request.Builder()
                                .url(baseUrl + "api/auth/refresh-token")
                                .post(body)
                                .build();

                        Response refreshResponse = refreshClient.newCall(refreshRequest).execute();
                        if (refreshResponse.isSuccessful() && refreshResponse.body() != null) {
                            String responseBody = refreshResponse.body().string();
                            LoginResponse loginResponse = gsonLocal.fromJson(responseBody, LoginResponse.class);
                            // if != null => update to token manager
                            if (loginResponse != null && loginResponse.getAccessToken() != null) {
                                tokenManager.saveTokens(loginResponse.getAccessToken(), loginResponse.getRefreshToken());
                                accessToken = loginResponse.getAccessToken();
                            }
                        }
                        if (refreshResponse != null) refreshResponse.close();
                    } catch (Exception ignored) {
                        // If refresh fails, proceed without modifying the request; server may return 401
                        Intent login = new Intent(context, LoginActivity.class);
                        context.getApplicationContext().startActivity(login);
                    }
                }

                // Avoid attaching an expired token if refresh failed
                if (accessToken != null && !JwtUtils.isExpired(accessToken, LEEWAY_SECONDS)) {
                    String rawAccess = accessToken.replaceFirst("(?i)^Bearer\\s+", "");
                    Request request = original.newBuilder()
                            .header("Authorization", "Bearer " + rawAccess)
                            .method(original.method(), original.body())
                            .build();
                    return chain.proceed(request);
                }

                return chain.proceed(original);
            });

            // Add 401 unauthorized response interceptor
            clientBuilder.addInterceptor(chain -> {
                Request request = chain.request();
                Response response = chain.proceed(request);

                // Check for 401 unauthorized
                if (response.code() == 401) {
                    response.close(); // Close the original response

                    String refreshToken = tokenManager.getRefreshToken();

                    // Try to refresh token if available
                    if (refreshToken != null) {
                        try {
                            OkHttpClient refreshClient = new OkHttpClient.Builder()
                                    .sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
                                    .hostnameVerifier((hostname, session) -> true)
                                    .connectTimeout(30, TimeUnit.SECONDS)
                                    .writeTimeout(60, TimeUnit.SECONDS)
                                    .readTimeout(60, TimeUnit.SECONDS)
                                    .build();

                            Gson gsonLocal = new Gson();
                            String json = gsonLocal.toJson(new RefreshTokenRequest(refreshToken));
                            RequestBody body = RequestBody.create(MediaType.parse("application/json; charset=utf-8"), json);

                            Request refreshRequest = new Request.Builder()
                                    .url(baseUrl + "api/auth/refresh-token")
                                    .post(body)
                                    .build();

                            Response refreshResponse = refreshClient.newCall(refreshRequest).execute();
                            if (refreshResponse.isSuccessful() && refreshResponse.body() != null) {
                                String responseBody = refreshResponse.body().string();
                                LoginResponse loginResponse = gsonLocal.fromJson(responseBody, LoginResponse.class);

                                if (loginResponse != null && loginResponse.getAccessToken() != null) {
                                    // Save new tokens
                                    tokenManager.saveTokens(loginResponse.getAccessToken(), loginResponse.getRefreshToken());

                                    // Retry the original request with new token
                                    String newAccessToken = loginResponse.getAccessToken().replaceFirst("(?i)^Bearer\\s+", "");
                                    Request newRequest = request.newBuilder()
                                            .header("Authorization", "Bearer " + newAccessToken)
                                            .build();

                                    if (refreshResponse != null) refreshResponse.close();
                                    return chain.proceed(newRequest);
                                }
                            }
                            if (refreshResponse != null) refreshResponse.close();
                        } catch (Exception e) {
                            // Refresh failed, redirect to login
                            redirectToLogin(context);
                        }
                    }

                    // No refresh token or refresh failed, redirect to login
                    redirectToLogin(context);

                    // Return the original 401 response
                    return new Response.Builder()
                            .request(request)
                            .protocol(Protocol.HTTP_1_1)
                            .code(401)
                            .message("Unauthorized")
                            .body(ResponseBody.create(MediaType.parse("application/json"), "{}"))
                            .build();
                }

                return response;
            });

            OkHttpClient okHttpClient = clientBuilder.build();
            Gson gson = new GsonBuilder()
                    // ISO 8601 with milliseconds
                    .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS")
                    // ISO 8601 without milliseconds
                    .setDateFormat("yyyy-MM-dd'T'HH:mm:ss")
                    .create();

            return new Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create(gson))
                    .build();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // Helper method to redirect to login
    private static void redirectToLogin(Context context) {
        // Clear stored tokens
        if (tokenManager != null) {
            tokenManager.clearTokens(); // You'll need to implement this method in TokenManager
        }

        // Redirect to login activity
        Intent login = new Intent(context, LoginActivity.class);
        login.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        context.startActivity(login);
    }
}