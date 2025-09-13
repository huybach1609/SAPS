//package vn.edu.fpt.sapsmobile.services.vehicle;
//
//import android.content.Context;
//
//import okhttp3.MediaType;
//import okhttp3.MultipartBody;
//import okhttp3.RequestBody;
//import retrofit2.Call;
//import retrofit2.Callback;
//import retrofit2.Response;
//import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleRegistrationInfo;
//import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleRegistrationResponse;
//import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleResponse;
//import vn.edu.fpt.sapsmobile.network.api.IVehicleRegistraionCertOrcApi;
//import vn.edu.fpt.sapsmobile.network.api.OcrService;
//import vn.edu.fpt.sapsmobile.network.client.ApiClient;
//
//// 2. Create a business logic manager
//public class VehicleRegistrationManager {
//    private final IVehicleRegistraionCertOrcApi ocrApi;
//    private final OcrService registrationApi;
//
//    public interface VehicleRegistrationCallback {
//        void onOcrSuccess(VehicleResponse response);
//        void onOcrFailure(String errorMessage);
//        void onRegistrationSuccess(VehicleRegistrationResponse response);
//        void onRegistrationFailure(String errorMessage);
//    }
//
//    public VehicleRegistrationManager(Context context) {
//        this.ocrApi = ApiClient.getServiceLast(context).create(IVehicleRegistraionCertOrcApi.class);
//        this.registrationApi = ApiClient.getServiceLast(context).create(OcrService.class);
//    }
//
//    public boolean canProcessOcr(byte[] frontImage, byte[] backImage) {
//        return frontImage != null && backImage != null;
//    }
//
//    public void performOcr(byte[] frontImageBytes, byte[] backImageBytes, VehicleRegistrationCallback callback) {
//        RequestBody frontBody = RequestBody.create(frontImageBytes, MediaType.parse("image/jpeg"));
//        RequestBody backBody = RequestBody.create(backImageBytes, MediaType.parse("image/jpeg"));
//
//        MultipartBody.Part frontPart = MultipartBody.Part.createFormData("frontImage", "front.jpg", frontBody);
//        MultipartBody.Part backPart = MultipartBody.Part.createFormData("backImage", "back.jpg", backBody);
//
//        Call<VehicleResponse> call = ocrApi.uploadVehicleRegistration(frontPart, backPart);
//        call.enqueue(new Callback<VehicleResponse>() {
//            @Override
//            public void onResponse(Call<VehicleResponse> call, Response<VehicleResponse> response) {
//                if (response.isSuccessful() && response.body() != null) {
//                    callback.onOcrSuccess(response.body());
//                } else {
//                    callback.onOcrFailure(parseErrorMessage(response));
//            }
//
//            @Override
//            public void onFailure(Call<VehicleResponse> call, Throwable t) {
//                callback.onOcrFailure(t.getMessage());
//            }
//        });
//    }
//
//    public void registerVehicle(VehicleRegistrationInfo vehicleData, byte[] frontImageBytes, byte[] backImageBytes,
//                                VehicleRegistrationCallback callback) {
//
//        // Create multipart bodies
//        RequestBody frontBody = RequestBody.create(frontImageBytes, MediaType.parse("image/jpeg"));
//        RequestBody backBody = RequestBody.create(backImageBytes, MediaType.parse("image/jpeg"));
//
//        MultipartBody.Part frontPart = MultipartBody.Part.createFormData("FrontVehicleRegistrationCertImage", "front.jpg", frontBody);
//        MultipartBody.Part backPart = MultipartBody.Part.createFormData("BackVehicleRegistrationCertImage", "back.jpg", backBody);
//
//        // Create text request bodies
//        RequestBody licensePlateBody = RequestBody.create(vehicleData.getLicensePlate(), MediaType.parse("text/plain"));
//        RequestBody modelBody = RequestBody.create(vehicleData.getModel(), MediaType.parse("text/plain"));
//        // ... other fields
//
//        Call<VehicleRegistrationResponse> call = registrationApi.registerVehicle(
//            frontPart, backPart, licensePlateBody, brandBody, modelBody,
//            engineNumberBody, chassisNumberBody, colorBody, ownerNameBody, vehicleTypeBody
//        );
//
//        call.enqueue(new Callback<VehicleRegistrationResponse>() {
//            @Override
//            public void onResponse(Call<VehicleRegistrationResponse> call, Response<VehicleRegistrationResponse> response) {
//                if (response.isSuccessful() && response.body() != null) {
//                    callback.onRegistrationSuccess(response.body());
//                } else {
//                    callback.onRegistrationFailure(parseErrorMessage(response));
//                }
//            }
//
//            @Override
//            public void onFailure(Call<VehicleRegistrationResponse> call, Throwable t) {
//                callback.onRegistrationFailure(t.getMessage());
//            }
//        });
//    }
//
//    private String parseErrorMessage(Response<?> response) {
//        // Your existing error parsing logic here
//        // Return user-friendly error message
//        return "Registration failed. Please try again.";
//    }
//}