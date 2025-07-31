package vn.edu.fpt.sapsmobile.API.apiinterface;
import retrofit2.Call;
import retrofit2.http.GET;

import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
public interface UserApiService {
    @GET("/user/{userID}")
    Call<ParkingLot> getUserById(@Path("userID") String userID);
}
