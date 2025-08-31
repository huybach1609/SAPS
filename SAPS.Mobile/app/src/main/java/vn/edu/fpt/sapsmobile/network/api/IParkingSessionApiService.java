package vn.edu.fpt.sapsmobile.network.api;
import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Body;
import retrofit2.http.Path;
import retrofit2.http.Query;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentApiResponseDTO;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.dtos.payment.CheckoutRequest;
import vn.edu.fpt.sapsmobile.dtos.payment.CheckoutResponse;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.OwnedSessionRequest;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.OwnedSessionResponse;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.ParkingSessionDetailsResponse;

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

    @GET("/api/parkingsession/owned/{clientId}")
    Call<OwnedSessionResponse> getOwnedSessions(
            @Path("clientId") String clientId,
            @Query("Status") String status,
            @Query("StartEntryDate") String startEntryDate,
            @Query("EndEntryDate") String endEntryDate,
            @Query("StartExitDate") String startExitDate,
            @Query("EndExitDate") String endExitDate,
            @Query("Order") String order,
            @Query("SortBy") String sortBy,
            @Query("SearchCriteria") String searchCriteria
    );

    @POST("/api/parkingsession/check-out")
    Call<CheckoutResponse> checkout(@Body CheckoutRequest request);

    @GET("/api/parkingSession/{sessionId}/payment-info")
    Call<PaymentApiResponseDTO> getPaymentInfo(@Path("sessionId") String sessionId);

    @GET("/api/parkingSession/client/{id}")
    Call<ParkingSessionDetailsResponse> getParkingSessionDetails(@Path("id") String sessionId);

}
