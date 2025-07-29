package vn.edu.fpt.sapsmobile.API;

import android.content.Context;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.sapsmobile.API.apiinterface.VehicleApiService;

public class ApiTest {
    private static final String BASE_URL = "https://e29fcf0d-97d4-404f-a252-ff81d2feb755.mock.pstmn.io";
    private static Retrofit retrofit;

    public static Retrofit  getService(Context context) {
        if (retrofit == null) {
            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }
}
