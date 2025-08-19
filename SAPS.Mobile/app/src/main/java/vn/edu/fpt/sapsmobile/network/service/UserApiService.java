package vn.edu.fpt.sapsmobile.network.service;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;

import retrofit2.http.PUT;
import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.dtos.ChangePasswordRequest;
import vn.edu.fpt.sapsmobile.models.User;
public interface UserApiService {
    @GET("/api/user/{userID}")
    Call<User> getUserById(@Path("userID") String userID);

    @PUT("api/password")
    Call<Void> changePassword(@Body ChangePasswordRequest request);
}
