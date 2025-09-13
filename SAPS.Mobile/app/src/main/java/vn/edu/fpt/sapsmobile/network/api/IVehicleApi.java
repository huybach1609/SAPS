package vn.edu.fpt.sapsmobile.network.api;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;

public interface IVehicleApi {
    @GET("/api/vehicle/my-vehicles")
    Call<List<VehicleSummaryDto>> getMyVehicles(
        @Query("status") String status,
        @Query("sharingStatus") String sharingStatus
    );

}