package vn.edu.fpt.sapsmobile.API;
import okhttp3.MultipartBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Part;
import retrofit2.http.Field;
import retrofit2.http.Body;
import vn.edu.fpt.sapsmobile.models.IdCardResponse;
import vn.edu.fpt.sapsmobile.models.NotificationsResponse;
import vn.edu.fpt.sapsmobile.models.UpdateClientProfileRequest;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.models.VehicleRegistrationInfo;
import vn.edu.fpt.sapsmobile.models.VehicleRegistrationResponse;

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
            @Part MultipartBody.Part frontVehicleRegistrationCertImage,
            @Part MultipartBody.Part backVehicleRegistrationCertImage,
            @Part("LicensePlate") String licensePlate,
            @Part("Model") String model,
            @Part("Color") String color,
            @Part("OwnerVehicleFullName") String ownerVehicleFullName,
            @Part("EngineNumber") String engineNumber, // Add this
            @Part("ChassisNumber") String chassisNumber, // Add this
            @Part("Brand") String brand
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
