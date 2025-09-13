package vn.edu.fpt.sapsmobile.network.api;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentStatusResponseDTO;
import vn.edu.fpt.sapsmobile.models.Transaction;

public interface TransactionApiService {
    @GET("api/payment/{paymentId}/status")
    Call<PaymentStatusResponseDTO> getTransactionPayOs(@Path("paymentId") String paymentId);

}
