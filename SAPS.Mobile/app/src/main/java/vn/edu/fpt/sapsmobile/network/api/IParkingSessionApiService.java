package vn.edu.fpt.sapsmobile.network.api;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Body;
import retrofit2.http.Path;
import retrofit2.http.Query;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentApiResponseDTO;
import vn.edu.fpt.sapsmobile.dtos.payment.CheckoutRequest;
import vn.edu.fpt.sapsmobile.dtos.payment.CheckoutResponse;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.OwnedSessionResponse;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.ParkingSessionDetailsResponse;

public interface IParkingSessionApiService {


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
