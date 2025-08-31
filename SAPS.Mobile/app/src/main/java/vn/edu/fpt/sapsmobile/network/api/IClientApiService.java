package vn.edu.fpt.sapsmobile.network.api;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.dtos.profile.ClientProfileResponse;
import vn.edu.fpt.sapsmobile.dtos.profile.ClientProfileSummaryDto;

public interface ClientApiService {
    @GET("api/client/user/{userId}")
    Call<ClientProfileResponse> getClientProfile(@Path("userId") String userId);
    
    @GET("api/client/by-share-code/{shareCode}")
    Call<ClientProfileSummaryDto> getClientByShareCode(@Path("shareCode") String shareCode);
}