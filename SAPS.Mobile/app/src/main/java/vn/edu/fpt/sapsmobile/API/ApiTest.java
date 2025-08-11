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
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiTest {
    private static final String BASE_URL = "https://192.168.1.24:3001/";
    private static final String BASE_URL_MOCKAPI = "https://192.168.1.24:7136/";
    private static Retrofit retrofit;
    private static Retrofit mockApiRetrofit; // Separate instance

    public static Retrofit getService(Context context) {
        if (retrofit == null) {
            retrofit = createRetrofitInstance(BASE_URL);
        }
        return retrofit;
    }

    public static Retrofit getServiceMockApi(Context context) {
        if (mockApiRetrofit == null) {
            mockApiRetrofit = createRetrofitInstance(BASE_URL_MOCKAPI);
        }
        return mockApiRetrofit;
    }

    private static Retrofit createRetrofitInstance(String baseUrl) {
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
            SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, trustAllCerts, new SecureRandom());

            OkHttpClient.Builder clientBuilder = new OkHttpClient.Builder();
            clientBuilder.sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0]);
            clientBuilder.hostnameVerifier((hostname, session) -> true);

            // Add timeouts
            clientBuilder.connectTimeout(30, TimeUnit.SECONDS);
            clientBuilder.writeTimeout(60, TimeUnit.SECONDS);
            clientBuilder.readTimeout(60, TimeUnit.SECONDS);

            OkHttpClient okHttpClient = clientBuilder.build();

            return new Retrofit.Builder()
                    .baseUrl(baseUrl)
                    .client(okHttpClient)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}