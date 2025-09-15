package vn.edu.fpt.sapsmobile.network.client;

import android.content.Context;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.sapsmobile.BuildConfig;
import vn.edu.fpt.sapsmobile.network.interceptor.TokenInterceptor;
import vn.edu.fpt.sapsmobile.network.ssl.SSLHelper;

public class ApiClient {
    private static final String BASE_URL_LAST = BuildConfig.API_BASE_URL;
    private static Retrofit mockApiLast;


    public static Retrofit getServiceLast(Context context) {
        if (mockApiLast == null) {
            mockApiLast = createRetrofitInstance(BASE_URL_LAST, context);
        }
        return mockApiLast;
    }

    private static Retrofit createRetrofitInstance(String baseUrl, Context context) {
        try {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                    .sslSocketFactory(SSLHelper.getSSLContext().getSocketFactory(), SSLHelper.getTrustManager())
                    .hostnameVerifier((hostname, session) -> true)
                    .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
                    .writeTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
                    .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
                    .addInterceptor(logging)
                    .addInterceptor(new TokenInterceptor(context, baseUrl)) // Single interceptor handles everything
                    .build();

            Gson gson = new GsonBuilder()
                    .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS")
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
}