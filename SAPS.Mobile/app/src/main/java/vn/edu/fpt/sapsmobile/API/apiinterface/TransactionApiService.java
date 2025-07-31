package vn.edu.fpt.sapsmobile.API.apiinterface;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.Transaction;

public interface TransactionApiService {
    @GET("/transaction/{transactionID}")
    Call<Transaction> getTransactionById(@Path("transactionID") String transactionID);
}
