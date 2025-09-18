package vn.edu.fpt.sapsmobile.services;

import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.network.client.ApiClient;
import vn.edu.fpt.sapsmobile.network.api.IParkingSessionApiService;
import vn.edu.fpt.sapsmobile.network.api.IVehicleApi;
import vn.edu.fpt.sapsmobile.network.api.ISharedvehicle;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.OwnedSessionRequest;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.OwnedSessionResponse;
import vn.edu.fpt.sapsmobile.utils.StringUtils;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class ParkingSessionService {
    
    private static final String TAG = "ParkingSessionService";
    
    public interface ParkingSessionCallback {
        void onSuccess(List<ParkingSession> parkingSessions);
        void onError(String errorMessage);
        void onNoSessions();
    }
    
    public interface DataLoadingCallback {
        void onDataLoadingStarted();
        void onDataLoadingFinished();
    }
    
    private final Context context;
    private final TokenManager tokenManager;
    
    public ParkingSessionService(Context context) {
        this.context = context;
        this.tokenManager = new TokenManager(context);
    }
    
    public void fetchOwnedSessions(@NonNull ParkingSessionCallback callback, 
                                   @NonNull DataLoadingCallback loadingCallback) {
        loadingCallback.onDataLoadingStarted();
        
        IParkingSessionApiService parkingSessionApi = ApiClient.getServiceLast(context)
                .create(IParkingSessionApiService.class);

        List<OwnedSessionResponse.OwnedParkingSessionDto> sessionDtoList = new ArrayList<>();

        final AtomicInteger completedCalls = new AtomicInteger(0);
        final int totalCalls = 2;

        Runnable onCallComplete = () -> {
            if (completedCalls.incrementAndGet() == totalCalls) {
                loadingCallback.onDataLoadingFinished();
                if (sessionDtoList.isEmpty()) {
                    callback.onNoSessions();
                } else {
                    fetchVehiclesAndBind(sessionDtoList, callback, loadingCallback);
                }
            }
        };

        // Generic callback for both calls
        Callback<OwnedSessionResponse> sessionCallback = new Callback<OwnedSessionResponse>() {
            @Override
            public void onResponse(Call<OwnedSessionResponse> call, Response<OwnedSessionResponse> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    synchronized (sessionDtoList) {
                        addUniqueItems(sessionDtoList, response.body().getData());
                    }
                } else {
                    try {
                        String errorJson = response.errorBody().string();

                        // Parse JSON to extract error message
                        try {
                            JSONObject jsonObject = new JSONObject(errorJson);
                            String errorMessage = jsonObject.optString("error", "Unknown error");
                            String toastMessage = StringUtils.getErrorMessage(context, errorMessage);
                            callback.onError(toastMessage);
                        } catch (JSONException jsonException) {
                            Log.e(TAG, "Error parsing JSON: " + jsonException.getMessage());
                            callback.onError("Network error occurred");
                        }

                    } catch (Exception e) {
                        Log.i(TAG, "fetchOwnerSessions error: " + e.getMessage());
                        callback.onError("Network error occurred");
                    }
                    Log.i(TAG, "fetchOwnerSessions: " + response.code());
                }
                onCallComplete.run();
            }

            @Override
            public void onFailure(Call<OwnedSessionResponse> call, Throwable t) {
                // Continue even if one call fails
                onCallComplete.run();
            }
        };

        // Make both calls simultaneously
        String userId = tokenManager.getUserData().getId();

        OwnedSessionRequest parkingRequest = new OwnedSessionRequest("Asc", "entryDateTime", "Parking");
        parkingSessionApi.getOwnedSessions(
                userId,
                parkingRequest.getStatus(),
                parkingRequest.getStartEntryDate() != null ? parkingRequest.getStartEntryDate().toString() : null,
                parkingRequest.getEndEntryDate() != null ? parkingRequest.getEndEntryDate().toString() : null,
                parkingRequest.getStartExitDate() != null ? parkingRequest.getStartExitDate().toString() : null,
                parkingRequest.getEndExitDate() != null ? parkingRequest.getEndExitDate().toString() : null,
                parkingRequest.getOrder(),
                parkingRequest.getSortBy(),
                parkingRequest.getSearchCriteria()
        ).enqueue(sessionCallback);

        OwnedSessionRequest checkedOutRequest = new OwnedSessionRequest("Asc", "entryDateTime", "CheckedOut");
        parkingSessionApi.getOwnedSessions(
                userId,
                checkedOutRequest.getStatus(),
                checkedOutRequest.getStartEntryDate() != null ? checkedOutRequest.getStartEntryDate().toString() : null,
                checkedOutRequest.getEndEntryDate() != null ? checkedOutRequest.getEndEntryDate().toString() : null,
                checkedOutRequest.getStartExitDate() != null ? checkedOutRequest.getStartExitDate().toString() : null,
                checkedOutRequest.getEndExitDate() != null ? checkedOutRequest.getEndExitDate().toString() : null,
                checkedOutRequest.getOrder(),
                checkedOutRequest.getSortBy(),
                checkedOutRequest.getSearchCriteria()
        ).enqueue(sessionCallback);
    }
    
    private void fetchVehiclesAndBind(List<OwnedSessionResponse.OwnedParkingSessionDto> dtoList,
                                     ParkingSessionCallback callback,
                                     DataLoadingCallback loadingCallback) {
        IVehicleApi vehicleApi = ApiClient.getServiceLast(context).create(IVehicleApi.class);
        ISharedvehicle sharedApi = ApiClient.getServiceLast(context).create(ISharedvehicle.class);

        List<VehicleSummaryDto> allVehicles = new ArrayList<>();
        AtomicInteger completed = new AtomicInteger(0);

        Runnable finishIfDone = () -> {
            if (completed.incrementAndGet() == 2) {
                List<ParkingSession> mapped = mapDtosToSessions(dtoList, allVehicles);
                callback.onSuccess(mapped);
                loadingCallback.onDataLoadingFinished();
            }
        };

        vehicleApi.getMyVehicles(null, null).enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    allVehicles.addAll(response.body());
                }
                finishIfDone.run();
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                finishIfDone.run();
            }
        });

        String userId = tokenManager.getUserData().getId();
        sharedApi.getShareVehicles(userId).enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // Merge unique by license plate (case-insensitive)
                    for (VehicleSummaryDto shared : response.body()) {
                        boolean exists = allVehicles.stream().anyMatch(v ->
                                v.getLicensePlate() != null && shared.getLicensePlate() != null &&
                                        v.getLicensePlate().equalsIgnoreCase(shared.getLicensePlate())
                        );
                        if (!exists) {
                            allVehicles.add(shared);
                        }
                    }
                }
                finishIfDone.run();
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                finishIfDone.run();
            }
        });



    }
    
    private void addUniqueItems(List<OwnedSessionResponse.OwnedParkingSessionDto> target,
                                List<OwnedSessionResponse.OwnedParkingSessionDto> source) {
        for (OwnedSessionResponse.OwnedParkingSessionDto dto : source) {
            boolean exists = target.stream()
                    .anyMatch(existing -> existing.getId() != null && existing.getId().equals(dto.getId()));
            if (!exists) {
                target.add(dto);
            }
        }
    }
    
    private List<ParkingSession> mapDtosToSessions(List<OwnedSessionResponse.OwnedParkingSessionDto> dtoList, 
                                                   List<VehicleSummaryDto> vehicles) {

        List<ParkingSession> result = new ArrayList<>();
        for (OwnedSessionResponse.OwnedParkingSessionDto dto : dtoList) {
            ParkingSession ps = new ParkingSession();
            ps.setId(dto.getId());
            ps.setEntryDateTime(dto.getEntryDateTime());
            ps.setExitDateTime(dto.getExitDateTime());
            ps.setCost(dto.getCost());
            ps.setParkingLotName(dto.getParkingLotName());
            ps.setStatus(dto.getStatus());

            // map vehicle by license plate
            VehicleSummaryDto match = null;
            for (VehicleSummaryDto v : vehicles) {
                if (v.getLicensePlate() != null && v.getLicensePlate().equalsIgnoreCase(dto.getLicensePlate())) {
                    match = v; 
                    break;
                }
            }
            if (match != null) {
                Vehicle v = new Vehicle();
                v.setId(match.getId());
                v.setLicensePlate(match.getLicensePlate());
                v.setBrand(match.getBrand());
                v.setModel(match.getModel());
                ps.setVehicle(v);
                ps.setVehicleId(v.getId());
            } else {
                Vehicle v = new Vehicle();
                v.setLicensePlate(dto.getLicensePlate());
                ps.setVehicle(v);
            }
            result.add(ps);
        }
        return result;
    }
}
