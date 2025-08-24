package vn.edu.fpt.sapsmobile.network.service;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;
import vn.edu.fpt.sapsmobile.dtos.vehicle.ShareCodeReturnDto;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;

public interface ISharedvehicle {
    @GET("/api/sharedVehicle/getShareCode")
    Call<ShareCodeReturnDto> getShareCode();

    @GET("/api/sharedVehicle")
    Call<List<VehicleSummaryDto>> getShareVehicles(
            @Query("sharedPersonId") String sharedPersonId
    );


}
