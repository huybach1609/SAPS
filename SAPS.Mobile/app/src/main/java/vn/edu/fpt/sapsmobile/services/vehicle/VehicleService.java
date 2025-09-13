package vn.edu.fpt.sapsmobile.services.vehicle;

import android.content.Context;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;
import vn.edu.fpt.sapsmobile.enums.ShareVehicleStatus;
import vn.edu.fpt.sapsmobile.network.api.ISharedvehicle;
import vn.edu.fpt.sapsmobile.network.api.IVehicleApi;
import vn.edu.fpt.sapsmobile.network.client.ApiClient;

public class VehicleService {
    // API Services
    private IVehicleApi vehicleApi;
    private ISharedvehicle sharedVehicleApi;


    public interface VehicleCallBack {
        void OnVehicleFetchSuccess(List<VehicleSummaryDto> vehicleSummaryDtos);

        void OnVehicleFetchFailure(String message);

        void OnSharedVehicleFetchSuccess(List<VehicleSummaryDto> vehicleSummaryDtos);

        void OnSharedVehicleFetchFailure(String message);
    }

    public VehicleService(Context context) {
        this.vehicleApi = ApiClient.getServiceLast(context).create(IVehicleApi.class);
        this.sharedVehicleApi = ApiClient.getServiceLast(context).create(ISharedvehicle.class);

    }

    public void loadMyVehicles(VehicleCallBack callBack) {
        Call<List<VehicleSummaryDto>> call = vehicleApi.getMyVehicles(null, null);
        call.enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callBack.OnVehicleFetchSuccess(response.body());
                } else {
                    callBack.OnVehicleFetchFailure(handleApiError("Network error loading vehicles", response.code(), null));
                }
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                callBack.OnVehicleFetchFailure(handleApiError("Network error loading vehicles", -1, t));
            }
        });
    }

    public void loadSharedVehicles(String userId, VehicleCallBack callBack) {
        Call<List<VehicleSummaryDto>> call = sharedVehicleApi.getShareVehicles(userId);
        call.enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<VehicleSummaryDto> list = new ArrayList<>(response.body());

                    Iterator<VehicleSummaryDto> iterator = list.iterator();
                    while (iterator.hasNext()) {
                        var s = iterator.next();
                        if (ShareVehicleStatus.PENDING.getValue().equals(s.getSharingStatus()) ||
                                ShareVehicleStatus.AVAILABLE.getValue().equals(s.getSharingStatus())) {
                            iterator.remove();
                        }
                    }
                    callBack.OnSharedVehicleFetchSuccess(list);
                } else {
                    callBack.OnVehicleFetchFailure(
                            handleApiError("Failed to load shared vehicles", response.code(), null)
                    );
                }
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                callBack.OnSharedVehicleFetchFailure(
                        handleApiError("Network error loading shared vehicles", -1, t)
                );
            }
        });
    }

    private String handleApiError(String message, int responseCode, Throwable throwable) {
        String errorMessage = message;

        if (responseCode > 0) {
            switch (responseCode) {
                case 400:
                    errorMessage = "Bad request - please check your data";
                    break;
                case 401:
                    errorMessage = "Unauthorized - please login again";
                    break;
                case 403:
                    errorMessage = "Access forbidden";
                    break;
                case 404:
                    errorMessage = "Data not found";
                    break;
                case 500:
                    errorMessage = "Server error - please try again later";
                    break;
                default:
                    errorMessage = message + " (Code: " + responseCode + ")";
            }
        } else if (throwable != null) {
            if (throwable.getMessage() != null && throwable.getMessage().contains("timeout")) {
                errorMessage = "Request timeout - please check your connection";
            } else if (throwable.getMessage() != null && throwable.getMessage().contains("Unable to resolve host")) {
                errorMessage = "No internet connection";
            }
        }
        return errorMessage;
    }
}
