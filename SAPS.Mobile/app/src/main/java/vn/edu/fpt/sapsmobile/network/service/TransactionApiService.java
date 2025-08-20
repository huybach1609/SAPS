package vn.edu.fpt.sapsmobile.network.service;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentResponseDTO;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentStatusResponseDTO;
import vn.edu.fpt.sapsmobile.models.Transaction;

public interface TransactionApiService {
    @GET("/transaction/{transactionID}")
    Call<Transaction> getTransactionById(@Path("transactionID") String transactionID);

    @GET("api/transaction/{paymentId}/check")
    Call<PaymentStatusResponseDTO> getTransactionPayOsById(@Path("paymentId") String paymentId);


    @GET("api/payment/{paymentId}/status")
    Call<PaymentStatusResponseDTO> getTransactionPayOs(@Path("paymentId") String paymentId);

}
