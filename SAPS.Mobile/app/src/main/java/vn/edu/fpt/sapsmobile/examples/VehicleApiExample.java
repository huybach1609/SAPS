package vn.edu.fpt.sapsmobile.examples;

import android.content.Context;
import android.util.Log;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.service.IVehicleApi;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;

/**
 * Example class demonstrating how to use the new getMyVehicles API endpoint
 */
public class VehicleApiExample {

    private static final String TAG = "VehicleApiExample";

    /**
     * Example 1: Get all my vehicles without any filters
     */
    public static void getAllMyVehicles(Context context) {
        IVehicleApi vehicleApi = ApiTest.getService(context).create(IVehicleApi.class);
        
        vehicleApi.getMyVehicles(null, null).enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<VehicleSummaryDto> vehicles = response.body();
                    Log.d(TAG, "Found " + vehicles.size() + " vehicles");
                    
                    for (VehicleSummaryDto vehicle : vehicles) {
                        Log.d(TAG, "Vehicle: " + vehicle.getLicensePlate() + " - " + 
                              vehicle.getBrand() + " " + vehicle.getModel());
                    }
                } else {
                    Log.e(TAG, "Error: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                Log.e(TAG, "Network error: " + t.getMessage());
            }
        });
    }

    /**
     * Example 2: Get only active vehicles
     */
    public static void getActiveVehicles(Context context) {
        IVehicleApi vehicleApi = ApiTest.getService(context).create(IVehicleApi.class);
        
        vehicleApi.getMyVehicles("ACTIVE", null).enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<VehicleSummaryDto> vehicles = response.body();
                    Log.d(TAG, "Found " + vehicles.size() + " active vehicles");
                } else {
                    Log.e(TAG, "Error: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                Log.e(TAG, "Network error: " + t.getMessage());
            }
        });
    }

    /**
     * Example 3: Get vehicles that are currently being shared
     */
    public static void getSharedVehicles(Context context) {
        IVehicleApi vehicleApi = ApiTest.getService(context).create(IVehicleApi.class);
        
        vehicleApi.getMyVehicles(null, "SHARED").enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<VehicleSummaryDto> vehicles = response.body();
                    Log.d(TAG, "Found " + vehicles.size() + " shared vehicles");
                } else {
                    Log.e(TAG, "Error: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                Log.e(TAG, "Network error: " + t.getMessage());
            }
        });
    }

    /**
     * Example 4: Get active vehicles that are not shared
     */
    public static void getActiveNonSharedVehicles(Context context) {
        IVehicleApi vehicleApi = ApiTest.getService(context).create(IVehicleApi.class);
        
        vehicleApi.getMyVehicles("ACTIVE", "NOT_SHARED").enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<VehicleSummaryDto> vehicles = response.body();
                    Log.d(TAG, "Found " + vehicles.size() + " active non-shared vehicles");
                } else {
                    Log.e(TAG, "Error: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                Log.e(TAG, "Network error: " + t.getMessage());
            }
        });
    }
}
