package vn.edu.fpt.sapsmobile.API;
//
//import android.content.Context;
//
//import retrofit2.Retrofit;
//import retrofit2.converter.gson.GsonConverterFactory;
//import vn.edu.fpt.sapsmobile.API.apiinterface.VehicleApiService;
//
//public class ApiTest {
//    private static final String BASE_URL = "https://192.168.1.33:3001/";
//    private static Retrofit retrofit;
//
//    public static Retrofit  getService(Context context) {
//        if (retrofit == null) {
//            retrofit = new Retrofit.Builder()
//                    .baseUrl(BASE_URL)
//                    .addConverterFactory(GsonConverterFactory.create())
//                    .build();
//        }
//        return retrofit;
//    }
//}

import android.content.Context;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class ApiTest {
    private static final String BASE_URL = "https://192.168.1.25:3001/";
    private static final String BASE_URL_MOCKAPI = "https://192.168.1.25:7136/";
    private static Retrofit retrofit;
    private static Retrofit mockApiRetrofit; // Separate instance

    private static TokenManager tokenManager;

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
            // Add token header
            clientBuilder.addInterceptor(chain -> {

                Request original = chain.request();
                String token = tokenManager.getAccessToken();

                if (token != null) {
                    Request request = original.newBuilder()
                            .header("Authorization", "Bearer " + token)
                            .method(original.method(), original.body())
                            .build();
                    return chain.proceed(request);
                }

                return chain.proceed(original);
            });

            OkHttpClient okHttpClient = clientBuilder.build();

            Gson gson = new GsonBuilder()
                    .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SS")
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