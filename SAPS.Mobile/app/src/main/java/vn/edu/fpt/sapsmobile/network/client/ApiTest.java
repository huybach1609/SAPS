package vn.edu.fpt.sapsmobile.network.client;

import android.content.Context;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.sapsmobile.network.interceptor.TokenInterceptor;
import vn.edu.fpt.sapsmobile.network.ssl.SSLHelper;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class ApiTest {
    private static final String BASE_URL = "https://192.168.1.25:3001/";
    private static final String BASE_URL_MOCKAPI = "https://192.168.1.25:7136/";
    private static final String BASE_URL_LAST = "https://192.168.1.25:7040/";

//    private static final String BASE_URL_LAST = "http://172.188.240.201/";
//    private static final String BASE_URL_LAST = "https://anemosnguyen2409.southeastasia.cloudapp.azure.com/";

    private static Retrofit retrofit;
    private static Retrofit mockApiRetrofit;
    private static Retrofit mockApiLast;

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