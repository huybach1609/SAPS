package vn.edu.fpt.sapsmobile.activities.auth;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.util.Log;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.service.ApiService;
import vn.edu.fpt.sapsmobile.network.service.IVehicleRegistraionCertOrcApi;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleRegistrationResponse;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleResponse;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;

public class AddVehicleActivity extends AppCompatActivity {

    private static final int REQUEST_PICK_FRONT = 2001;
    private static final int REQUEST_PICK_BACK = 2002;

    // Image compression settings
    private static final int MAX_IMAGE_WIDTH = 1024;
    private static final int MAX_IMAGE_HEIGHT = 768;
    private static final int JPEG_QUALITY = 85;

    private ImageView previewImageFront, previewImageBack;
    private Button btnTakePhoto, btnPickFront, btnPickBack, completeButton;
    private EditText ownerInput, plateInput, modelInput, colorInput, brandInput, engineNumberInput, chassisNumberInput;

    private Uri frontImageUri;
    private Uri backImageUri;

    // Cached compressed image data
    private byte[] frontImageBytes;
    private byte[] backImageBytes;

    private LoadingDialog loadingDialog;
    private final ExecutorService backgroundExecutor = Executors.newCachedThreadPool();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_vehicle);


        // action bar
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setTitle(R.string.add_vehicle_action_bar_header);
            actionBar.setDisplayHomeAsUpEnabled(true); // Show back arrow
        }


        initializeViews();
        setupClickListeners();

        loadingDialog = new LoadingDialog(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Clean up executor to prevent memory leaks
        backgroundExecutor.shutdown();
    }

    private void initializeViews() {
        previewImageFront = findViewById(R.id.preview_vehicle_image_front);
        previewImageBack = findViewById(R.id.preview_vehicle_image_back);
        btnTakePhoto = findViewById(R.id.btn_take_photo_vehicle);
        btnPickFront = findViewById(R.id.btn_pick_front_vehicle);
        btnPickBack = findViewById(R.id.btn_pick_back_vehicle);
        completeButton = findViewById(R.id.button_complete_registration);

        ownerInput = findViewById(R.id.input_owner_name);
        plateInput = findViewById(R.id.input_license_plate);
        modelInput = findViewById(R.id.input_vehicle_model);
        colorInput = findViewById(R.id.input_vehicle_color);
        brandInput = findViewById(R.id.input_vehicle_brand);
        engineNumberInput = findViewById(R.id.input_engine_number);
        chassisNumberInput = findViewById(R.id.input_chassis_number);
    }

    private void setupClickListeners() {
        btnTakePhoto.setOnClickListener(v -> {
            Toast.makeText(this, "Chức năng này chưa hỗ trợ nhận dạng cả 2 mặt từ ảnh chụp.", Toast.LENGTH_SHORT).show();
        });

        btnPickFront.setOnClickListener(v -> {
            Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(pickPhoto, REQUEST_PICK_FRONT);
        });

        btnPickBack.setOnClickListener(v -> {
            Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(pickPhoto, REQUEST_PICK_BACK);
        });

        completeButton.setOnClickListener(v -> completeRegistration());
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (resultCode == RESULT_OK && data != null && data.getData() != null) {
            Uri imageUri = data.getData();

            if (requestCode == REQUEST_PICK_FRONT) {
                handleImageSelection(imageUri, true);
            } else if (requestCode == REQUEST_PICK_BACK) {
                handleImageSelection(imageUri, false);
            }
        } else {
            Toast.makeText(this, R.string.edit_profile_toast_notification_2, Toast.LENGTH_SHORT).show();
        }
    }

    private void handleImageSelection(Uri imageUri, boolean isFront) {
        if (isFront) {
            frontImageUri = imageUri;
        } else {
            backImageUri = imageUri;
        }

        // Show loading for image processing
        loadingDialog.show("Processing image...");

        // Process image asynchronously
        // process image then update ui with image view
        CompletableFuture
                .supplyAsync(() -> processImageAsync(imageUri), backgroundExecutor)
                .thenAcceptAsync(this::handleImageProcessed, mainHandler::post)
                .exceptionally(throwable -> {
                    mainHandler.post(() -> {
                        loadingDialog.dismiss();
                        Log.e("IMAGE_PROCESS_ERROR", "Error processing image", throwable);
                        Toast.makeText(this, "Error processing image: " + throwable.getMessage(), Toast.LENGTH_SHORT).show();
                    });
                    return null;
                });
    }
//region handle load, compressImage
    private ImageProcessResult processImageAsync(Uri imageUri) {
        try {
            // Compress and process image in background
            byte[] compressedBytes = compressImage(imageUri);
            Bitmap previewBitmap = createPreviewBitmap(imageUri);

            return new ImageProcessResult(compressedBytes, previewBitmap, imageUri, null);
        } catch (Exception e) {
            return new ImageProcessResult(null, null, imageUri, e);
        }
    }

    private void handleImageProcessed(ImageProcessResult result) {
        loadingDialog.dismiss();

        if (result.error != null) {
            Toast.makeText(this, "Error processing image: " + result.error.getMessage(), Toast.LENGTH_SHORT).show();
            return;
        }

        // Update UI with processed image
        boolean isFront = result.uri.equals(frontImageUri);
        if (isFront) {
            frontImageBytes = result.compressedBytes;
            previewImageFront.setImageBitmap(result.previewBitmap);
            previewImageFront.setVisibility(android.view.View.VISIBLE);
        } else {
            backImageBytes = result.compressedBytes;
            previewImageBack.setImageBitmap(result.previewBitmap);
            previewImageBack.setVisibility(android.view.View.VISIBLE);
        }

        // Auto-trigger OCR when both images are ready
        if (frontImageBytes != null && backImageBytes != null) {
            performOcrAsync();
        }
    }

    private byte[] compressImage(Uri uri) throws IOException {
        // Get image dimensions first
        BitmapFactory.Options boundsOptions = new BitmapFactory.Options();
        boundsOptions.inJustDecodeBounds = true;

        try (InputStream is = getContentResolver().openInputStream(uri)) {
            BitmapFactory.decodeStream(is, null, boundsOptions);
        }

        // Calculate sample size for efficient memory usage
        int sampleSize = calculateSampleSize(boundsOptions.outWidth, boundsOptions.outHeight);

        BitmapFactory.Options decodeOptions = new BitmapFactory.Options();
        decodeOptions.inSampleSize = sampleSize;
        decodeOptions.inJustDecodeBounds = false;

        Bitmap bitmap;
        try (InputStream is = getContentResolver().openInputStream(uri)) {
            bitmap = BitmapFactory.decodeStream(is, null, decodeOptions);
        }

        if (bitmap == null) {
            throw new IOException("Failed to decode image");
        }

        // Further resize if still too large
        bitmap = resizeBitmapIfNeeded(bitmap);

        // Compress to JPEG
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, JPEG_QUALITY, baos);
        bitmap.recycle(); // Free memory immediately

        return baos.toByteArray();
    }

    private Bitmap createPreviewBitmap(Uri uri) throws IOException {
        // Create a smaller preview bitmap for UI
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inSampleSize = 4; // Much smaller for preview
        options.inJustDecodeBounds = false;

        try (InputStream is = getContentResolver().openInputStream(uri)) {
            return BitmapFactory.decodeStream(is, null, options);
        }
    }

    private int calculateSampleSize(int width, int height) {
        int sampleSize = 1;
        while (width / sampleSize > MAX_IMAGE_WIDTH || height / sampleSize > MAX_IMAGE_HEIGHT) {
            sampleSize *= 2;
        }
        return sampleSize;
    }

    private Bitmap resizeBitmapIfNeeded(Bitmap bitmap) {
        int width = bitmap.getWidth();
        int height = bitmap.getHeight();

        if (width <= MAX_IMAGE_WIDTH && height <= MAX_IMAGE_HEIGHT) {
            return bitmap;
        }

        float ratio = Math.min((float) MAX_IMAGE_WIDTH / width, (float) MAX_IMAGE_HEIGHT / height);
        int newWidth = Math.round(width * ratio);
        int newHeight = Math.round(height * ratio);

        Bitmap resized = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, true);
        bitmap.recycle(); // Free original bitmap
        return resized;
    }
//endregion
    private void performOcrAsync() {
        if (frontImageBytes == null || backImageBytes == null) {
            Toast.makeText(this, "Vui lòng chọn cả 2 mặt trước và sau của giấy đăng ký xe", Toast.LENGTH_SHORT).show();
            return;
        }

        loadingDialog.show("Processing vehicle registration...");

        // Create multipart bodies
        RequestBody frontBody = RequestBody.create(frontImageBytes, MediaType.parse("image/jpeg"));
        RequestBody backBody = RequestBody.create(backImageBytes, MediaType.parse("image/jpeg"));

        MultipartBody.Part frontPart = MultipartBody.Part.createFormData("frontImage", "front.jpg", frontBody);
        MultipartBody.Part backPart = MultipartBody.Part.createFormData("backImage", "back.jpg", backBody);

        // Get OCR API service
        IVehicleRegistraionCertOrcApi IVehicleRegistraionCertOrcApi = ApiTest.getServiceLast(this).create(IVehicleRegistraionCertOrcApi.class);

        // Make API call
        Call<VehicleResponse> call = IVehicleRegistraionCertOrcApi.uploadVehicleRegistration(frontPart, backPart);
        call.enqueue(new Callback<VehicleResponse>() {
            @Override
            public void onResponse(Call<VehicleResponse> call, Response<VehicleResponse> response) {
                loadingDialog.dismiss();

                if (response.isSuccessful() && response.body() != null) {
                    VehicleResponse vehicleResponse = response.body();
                    populateFormFields(vehicleResponse);
                    Toast.makeText(AddVehicleActivity.this, "Auto-filled from vehicle registration", Toast.LENGTH_SHORT).show();
                } else {
                    handleApiError("OCR failed", response);
                }
            }

            @Override
            public void onFailure(Call<VehicleResponse> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(AddVehicleActivity.this, "Upload failed: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                Log.e("VEHICLE_OCR_UPLOAD_ERROR", "Error uploading images: " + t.getMessage());
            }
        });
    }

    private void populateFormFields(VehicleResponse vehicleResponse) {
        // Safely populate fields with null checks
        setTextSafely(ownerInput, vehicleResponse.getOwnerVehicleFullName());
        setTextSafely(plateInput, vehicleResponse.getLicensePlate());
        setTextSafely(modelInput, vehicleResponse.getModel());
        setTextSafely(colorInput, vehicleResponse.getColor());
        setTextSafely(brandInput, vehicleResponse.getBrand());
        setTextSafely(engineNumberInput, vehicleResponse.getEngineNumber());
        setTextSafely(chassisNumberInput, vehicleResponse.getChassisNumber());
    }

    private void setTextSafely(EditText editText, String text) {
        if (editText != null && text != null) {
            editText.setText(text);
        }
    }

    private void completeRegistration() {
        // Validate required fields
        if (frontImageBytes == null || backImageBytes == null) {
            Toast.makeText(this, R.string.edit_profile_toast_notification_1, Toast.LENGTH_SHORT).show();
            return;
        }

        String licensePlate = plateInput.getText().toString().trim();
        String model = modelInput.getText().toString().trim();
        String color = colorInput.getText().toString().trim();
        String ownerName = ownerInput.getText().toString().trim();
        String brand = brandInput.getText().toString().trim();
        String engineNumber = engineNumberInput.getText().toString().trim();
        String chassisNumber = chassisNumberInput.getText().toString().trim();

        if (licensePlate.isEmpty() || model.isEmpty() || color.isEmpty() || ownerName.isEmpty() ||
                brand.isEmpty() || engineNumber.isEmpty() || chassisNumber.isEmpty()) {
            Toast.makeText(this, "Please fill in all required fields", Toast.LENGTH_SHORT).show();
            return;
        }

        loadingDialog.show("Registering vehicle...");
        registerVehicleAsync(licensePlate, model, color, ownerName, brand, engineNumber, chassisNumber);
    }

    private void registerVehicleAsync(String licensePlate, String model, String color, String ownerName,
                                      String brand, String engineNumber, String chassisNumber) {

        // Create multipart request body for images (using cached compressed data)
        RequestBody frontBody = RequestBody.create(frontImageBytes, MediaType.parse("image/jpeg"));
        RequestBody backBody = RequestBody.create(backImageBytes, MediaType.parse("image/jpeg"));

        MultipartBody.Part frontPart = MultipartBody.Part.createFormData("FrontVehicleRegistrationCertImage", "front.jpg", frontBody);
        MultipartBody.Part backPart = MultipartBody.Part.createFormData("BackVehicleRegistrationCertImage", "back.jpg", backBody);

        // Create text request bodies
        RequestBody licensePlateBody = RequestBody.create(licensePlate, MediaType.parse("text/plain"));
        RequestBody modelBody = RequestBody.create(model, MediaType.parse("text/plain"));
        RequestBody colorBody = RequestBody.create(color, MediaType.parse("text/plain"));
        RequestBody ownerNameBody = RequestBody.create(ownerName, MediaType.parse("text/plain"));
        RequestBody brandBody = RequestBody.create(brand, MediaType.parse("text/plain"));
        RequestBody engineNumberBody = RequestBody.create(engineNumber, MediaType.parse("text/plain"));
        RequestBody chassisNumberBody = RequestBody.create(chassisNumber, MediaType.parse("text/plain"));

        // Get API service
        ApiService apiService = ApiTest.getServiceLast(this).create(ApiService.class);

        // Make API call
        Call<VehicleRegistrationResponse> call = apiService.registerVehicle(
                frontPart, backPart, licensePlateBody, brandBody, modelBody,
                engineNumberBody, chassisNumberBody, colorBody, ownerNameBody
        );

        call.enqueue(new Callback<VehicleRegistrationResponse>() {
            @Override
            public void onResponse(Call<VehicleRegistrationResponse> call, Response<VehicleRegistrationResponse> response) {
                loadingDialog.dismiss();

                if (response.isSuccessful() && response.body() != null) {
                    VehicleRegistrationResponse vehicleResponse = response.body();
                    Toast.makeText(AddVehicleActivity.this,
                            vehicleResponse.getMessage() != null ? vehicleResponse.getMessage() : "Vehicle registered successfully",
                            Toast.LENGTH_LONG).show();

                    // Return success result
                    Intent resultIntent = new Intent();
                    resultIntent.putExtra("registration_success", true);
                    resultIntent.putExtra("message", vehicleResponse.getMessage());
                    setResult(RESULT_OK, resultIntent);
                    finish();
                } else {
                    handleApiError("Registration failed", response);
                }
            }

            @Override
            public void onFailure(Call<VehicleRegistrationResponse> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(AddVehicleActivity.this, "Registration failed: " + t.getMessage(), Toast.LENGTH_LONG).show();
                Log.e("VEHICLE_REGISTRATION_ERROR", "Error registering vehicle: " + t.getMessage());
            }
        });
    }

    private void handleApiError(String prefix, Response<?> response) {
        String errorBody = "";
        try {
            if (response.errorBody() != null) {
                errorBody = response.errorBody().string();
            }
        } catch (IOException e) {
            errorBody = "Error reading error body";
        }

        Toast.makeText(this, prefix + ": " + response.code() + " - " + errorBody, Toast.LENGTH_LONG).show();
    }

    // Helper class for async image processing results
    private static class ImageProcessResult {
        final byte[] compressedBytes;
        final Bitmap previewBitmap;
        final Uri uri;
        final Exception error;

        ImageProcessResult(byte[] compressedBytes, Bitmap previewBitmap, Uri uri, Exception error) {
            this.compressedBytes = compressedBytes;
            this.previewBitmap = previewBitmap;
            this.uri = uri;
            this.error = error;
        }
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

}