package vn.edu.fpt.sapsmobile.network.api;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Body;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentStatusResponseDTO;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentCancelRequestDTO;
import vn.edu.fpt.sapsmobile.models.Transaction;

public interface TransactionApiService {
    @GET("api/parkingsession/payment/{parkingSessionId}/status")
    Call<PaymentStatusResponseDTO> getTransactionPayOs(@Path("parkingSessionId") String parkingSessionId);

    @PUT("api/parkingsession/payment/{parkingSessionId}/cancel")
    Call<PaymentStatusResponseDTO> cancelPayment(
            @Path("parkingSessionId") String parkingSessionId,
            @Body PaymentCancelRequestDTO request
    );
}
