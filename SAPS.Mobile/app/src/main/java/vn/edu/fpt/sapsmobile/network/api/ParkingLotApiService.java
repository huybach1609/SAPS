package vn.edu.fpt.sapsmobile.network.api;

import retrofit2.Call;
import retrofit2.http.GET;

import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
public interface ParkingLotApiService {
    @GET("/parkingLot/{parkingLotId}")
    Call<ParkingLot> getParkingLotById(@Path("parkingLotId") String parkingLotId);
}
