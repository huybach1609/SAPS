package vn.edu.fpt.sapsmobile.API.apiinterface;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;

import vn.edu.fpt.sapsmobile.models.Vehicle;

public interface VehicleApiService {
    @GET("/vehicle") // endpoint bạn cần gọi
    Call<List<Vehicle>> getListVehicles();
}