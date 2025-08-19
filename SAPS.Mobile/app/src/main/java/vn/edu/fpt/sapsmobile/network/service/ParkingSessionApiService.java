package vn.edu.fpt.sapsmobile.network.service;
import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Body;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.dtos.OwnedSessionRequest;
import vn.edu.fpt.sapsmobile.dtos.OwnedSessionResponse;

public interface ParkingSessionApiService {
    @GET("/parkingsession/{vehicleID}")
    Call<ParkingSession> getParkingSessionToCheckOut(@Path("vehicleID") String vehicleID);
    @GET("/parkingsessionLast30days")
    Call<List<ParkingSession>> getParkingSessionListLast30days();
    @GET("/parkingsessionLast3Months")
    Call<List<ParkingSession>> getParkingSessionListLast3Months();
    @GET("/parkingsessionLastYear")
    Call<List<ParkingSession>> getParkingSessionListLastYear();
    @GET("/getParkingSessionOf5VehicleLastest")
    Call<List<ParkingSession>> getParkingSessionOf5VehicleLastest();
    @GET("/parkingSession/{userId}/LastestVehicleParking")
    Call<ParkingSession> getParkingSessionLastestVehicleParking(@Path("userId") String userId);

    @POST("/api/parkingsession/owned/{clientId}")
    Call<OwnedSessionResponse> getOwnedSessions(
            @Path("clientId") String clientId,
            @Body OwnedSessionRequest request
    );

}
