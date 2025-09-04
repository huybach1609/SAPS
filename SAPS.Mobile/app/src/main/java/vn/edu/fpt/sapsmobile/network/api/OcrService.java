package vn.edu.fpt.sapsmobile.network.api;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Headers;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Part;
import retrofit2.http.Body;
import vn.edu.fpt.sapsmobile.dtos.profile.IdCardBase64Request;
import vn.edu.fpt.sapsmobile.dtos.profile.VerificationResponse;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleRegistrationInfo;
import vn.edu.fpt.sapsmobile.dtos.vehicle.MessageServerResponse;
import vn.edu.fpt.sapsmobile.dtos.profile.IdCardResponse;
import vn.edu.fpt.sapsmobile.dtos.profile.NotificationsResponse;

import vn.edu.fpt.sapsmobile.models.User;

public interface OcrService {
    @GET("notifications")
    Call<NotificationsResponse> getNotifications();
    
    @Multipart
    @POST("api/ocr/citizen-card/file")
    Call<IdCardResponse> getInfoIdCard(
            @Part MultipartBody.Part FrontImage,
            @Part MultipartBody.Part BackImage
    );

    @POST("api/ocr/citizen-card/base64")
    @Headers("Content-Type: application/json")
    Call<IdCardResponse> getInfoIdCardBase64(@Body IdCardBase64Request request);

    @Multipart
    @POST("api/Ocr/getInfoVehicleCard")
    Call<VehicleRegistrationInfo> getInfoVehicle(
            @Part MultipartBody.Part front,
            @Part MultipartBody.Part back
    );

    @Multipart
    @POST("api/vehicle/register")
    Call<MessageServerResponse> registerVehicle(
            @Part MultipartBody.Part FrontVehicleRegistrationCertImage,
            @Part MultipartBody.Part BackVehicleRegistrationCertImage,
            @Part("LicensePlate") RequestBody licensePlate,
            @Part("Brand") RequestBody brand,
            @Part("Model") RequestBody model,
            @Part("EngineNumber") RequestBody engineNumber,
            @Part("ChassisNumber") RequestBody chassisNumber,
            @Part("Color") RequestBody color,
            @Part("OwnerVehicleFullName") RequestBody ownerVehicleFullName,
            @Part("VehicleType") RequestBody vehicleType
            );

    @Multipart
    @PUT("api/client")
    Call<User> updateClientProfile(
            @Part MultipartBody.Part frontCitizenCardImage,
            @Part MultipartBody.Part backCitizenCardImage,
            @Part("CitizenId") RequestBody citizenId,
            @Part("DateOfBirth") RequestBody dateOfBirth,
            @Part("Sex") RequestBody sex,
            @Part("Nationality") RequestBody nationality,
            @Part("PlaceOfOrigin") RequestBody placeOfOrigin,
            @Part("PlaceOfResidence") RequestBody placeOfResidence,
            @Part("FullName") RequestBody fullName,
            @Part("Phone") RequestBody phone,
            @Part("Id") RequestBody id
    );

    @Multipart
    @POST("api/client/verify-lvl-2")
    Call<VerificationResponse> verifyClientLevel2(
            @Part MultipartBody.Part FrontCitizenCardImage,
            @Part MultipartBody.Part BackCitizenCardImage,
            @Part("CitizenId") RequestBody citizenId,
            @Part("DateOfBirth") RequestBody dateOfBirth,
            @Part("Sex") RequestBody sex,
            @Part("Nationality") RequestBody nationality,
            @Part("PlaceOfOrigin") RequestBody placeOfOrigin,
            @Part("PlaceOfResidence") RequestBody placeOfResidence,
            @Part("Id") RequestBody id
    );



}
