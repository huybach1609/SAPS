//package vn.edu.fpt.sapsmobile.network.client;
//
//import android.content.Context;
//
//import okhttp3.OkHttpClient;
//import okhttp3.Request;
//import retrofit2.Retrofit;
//import retrofit2.converter.gson.GsonConverterFactory;
//import vn.edu.fpt.sapsmobile.BuildConfig;
//import vn.edu.fpt.sapsmobile.utils.TokenManager;
//
//public class ApiClient {
//    private static final String BASE_URL = BuildConfig.SERVER_BASE_URL;
//    private static Retrofit retrofit = null;
//    private static TokenManager tokenManager;
//
//    public static Retrofit getClient(Context context) {
//        if (retrofit == null) {
//            tokenManager = new TokenManager(context);
//
//            OkHttpClient.Builder httpClient = new OkHttpClient.Builder();
//
//            // Add auth interceptor
//            httpClient.addInterceptor(chain -> {
//                Request original = chain.request();
//                String token = tokenManager.getAccessToken();
//
//                if (token != null) {
//                    Request request = original.newBuilder()
//                            .header("Authorization", "Bearer " + token)
//                            .method(original.method(), original.body())
//                            .build();
//                    return chain.proceed(request);
//                }
//
//                return chain.proceed(original);
//            });
//
//            retrofit = new Retrofit.Builder()
//                    .baseUrl(BASE_URL)
//                    .addConverterFactory(GsonConverterFactory.create())
//                    .client(httpClient.build())
//                    .build();
//        }
//        return retrofit;
//    }
//}