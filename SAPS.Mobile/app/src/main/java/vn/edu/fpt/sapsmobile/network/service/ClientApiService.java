package vn.edu.fpt.sapsmobile.network.service;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.dtos.profile.ClientProfileResponse;

public interface ClientApiService {
    @GET("api/client/user/{userId}")
    Call<ClientProfileResponse> getClientProfile(@Path("userId") String userId);
}