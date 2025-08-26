package vn.edu.fpt.sapsmobile.network.api;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;

public interface IVehicleApi {
    // mock api
    @GET("/vehicle") // endpoint bạn cần gọi
    Call<List<Vehicle>> getListVehicles();
    @GET("/vehicle/{vehicleID}") // endpoint bạn cần gọi
    Call<Vehicle> getVehiclebyID(@Path("vehicleID") String vehicleID);
    @GET("/vehicleShared") // endpoint bạn cần gọi
    Call<List<Vehicle>> getMySharedVehicles();

    // dev
    @GET("/api/vehicle/my-vehicles")
    Call<List<VehicleSummaryDto>> getMyVehicles(
        @Query("status") String status,
        @Query("sharingStatus") String sharingStatus
    );

}