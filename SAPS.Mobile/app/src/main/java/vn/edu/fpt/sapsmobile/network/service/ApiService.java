package vn.edu.fpt.sapsmobile.network.service;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Part;
import retrofit2.http.Body;
import vn.edu.fpt.sapsmobile.dtos.UpdateClientProfileRequest;
import vn.edu.fpt.sapsmobile.dtos.VehicleRegistrationInfo;
import vn.edu.fpt.sapsmobile.dtos.VehicleRegistrationResponse;
import vn.edu.fpt.sapsmobile.dtos.IdCardResponse;
import vn.edu.fpt.sapsmobile.dtos.NotificationsResponse;
import vn.edu.fpt.sapsmobile.models.User;

public interface ApiService {
    @GET("notifications")
    Call<NotificationsResponse> getNotifications();
    
    @Multipart
    @POST("api/Ocr/getInfoIdCard")
    Call<IdCardResponse> getInfoIdCard(
            @Part MultipartBody.Part front,
            @Part MultipartBody.Part back
    );
    
    @Multipart
    @POST("api/Ocr/getInfoVehicleCard")
    Call<VehicleRegistrationInfo> getInfoVehicle(
            @Part MultipartBody.Part front,
            @Part MultipartBody.Part back
    );

    @Multipart
    @POST("api/vehicle/register")
    Call<VehicleRegistrationResponse> registerVehicle(
            @Part MultipartBody.Part FrontVehicleRegistrationCertImage,
            @Part MultipartBody.Part BackVehicleRegistrationCertImage,
            @Part("LicensePlate") RequestBody licensePlate,
            @Part("Brand") RequestBody brand,
            @Part("Model") RequestBody model,
            @Part("EngineNumber") RequestBody engineNumber,
            @Part("ChassisNumber") RequestBody chassisNumber,
            @Part("Color") RequestBody color,
            @Part("OwnerVehicleFullName") RequestBody ownerVehicleFullName
            );

    @PUT("api/client")
    Call<User> updateClientProfile(@Body UpdateClientProfileRequest request);

    @Multipart
    @PUT("api/client")
    Call<User> updateClientProfileWithImages(
            @Part MultipartBody.Part frontIdCardImage,
            @Part MultipartBody.Part backIdCardImage,
            @Part("fullName") String fullName,
            @Part("phone") String phone,
            @Part("citizenId") String citizenId,
            @Part("dateOfBirth") String dateOfBirth,
            @Part("sex") boolean sex,
            @Part("nationality") String nationality,
            @Part("placeOfOrigin") String placeOfOrigin,
            @Part("placeOfResidence") String placeOfResidence
    );

}
