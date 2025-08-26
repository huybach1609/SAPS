package vn.edu.fpt.sapsmobile.network.api;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.ShareVehicleResponse;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.SharedVehicleDetails;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.RecallResponse;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.ShareInvitationRequest;

public interface ShareVehicleApi {
    @GET("api/sharedvehicle")
    Call<List<ShareVehicleResponse>> getSharedVehicles(
            @Query("SharedPersonId") String sharedPersonId
    );

    @POST("api/sharedVehicle/{sharedVehicleId}/accept")
    Call<Void> acceptShareVehicle(@Path("sharedVehicleId") String sharedVehicleId);

    @POST("api/sharedVehicle/{sharedVehicleId}/reject")
    Call<Void> rejectShareVehicle(@Path("sharedVehicleId") String sharedVehicleId);


    @GET("api/sharedVehicle/{sharedVehicleId}")
    Call<SharedVehicleDetails> getSharedVehicleDetails(@Path("sharedVehicleId") String vehicleId);


    @GET("api/sharedVehicle/by-vehicle/{vehicleId}")
    Call<SharedVehicleDetails> getSharedVehicleDetailsByVehicleId(@Path("vehicleId") String vehicleId);

    @POST("api/sharedVehicle/{sharedVehicleId}/recall")
    Call<RecallResponse> recallSharedVehicle(@Path("sharedVehicleId") String sharedVehicleId);

    @POST("api/sharedVehicle/share")
    Call<Void> shareVehicle(@Body ShareInvitationRequest request);
}


