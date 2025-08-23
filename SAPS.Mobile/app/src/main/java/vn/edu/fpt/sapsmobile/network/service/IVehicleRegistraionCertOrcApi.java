package vn.edu.fpt.sapsmobile.network.service;

import okhttp3.MultipartBody;
import retrofit2.Call;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleResponse;

public interface IVehicleRegistraionCertOrcApi {
    @Multipart
    @POST("/api/ocr/vehicle-registration/file")
    Call<VehicleResponse> uploadVehicleRegistration(
            @Part MultipartBody.Part frontImage,
            @Part MultipartBody.Part backImage
    );
}
