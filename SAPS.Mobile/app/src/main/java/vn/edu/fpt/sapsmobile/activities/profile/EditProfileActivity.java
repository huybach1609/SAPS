package vn.edu.fpt.sapsmobile.activities.profile;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.network.api.OcrService;
import vn.edu.fpt.sapsmobile.network.client.ApiClient;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.ClientProfile;
import vn.edu.fpt.sapsmobile.dtos.profile.IdCardResponse;

import vn.edu.fpt.sapsmobile.models.User;

import vn.edu.fpt.sapsmobile.services.AuthenticationService;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;


public class EditProfileActivity extends AppCompatActivity {
    //service
    private TokenManager tokenManager;
    private AuthenticationService authenticationService;
    private LoadingDialog loadingDialog;
    // component
    private MaterialToolbar toolbar;
    private EditText phoneInput;
    private TextView nameInput, idNoInput, sexInput,
            nationalityInput, dobInput, placeOriginInput,
            placeResidenceInput, issueDateInput, issuePlaceInput;
    private Button saveButton, btnFetchAgain;
    private User currentUser;
    private ImageView previewImage, previewImageBack;
    private Uri frontImageUri;
    private Uri backImageUri;
    // config
    private static final int REQUEST_PICK_FRONT = 2001;
    private static final int REQUEST_PICK_BACK = 2002;


    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_profile);

        bindViews();
        setupToolbar();

        tokenManager = new TokenManager(this);
        loadingDialog = new LoadingDialog(this);
        authenticationService = new AuthenticationService(this);

        loadUserAndFill();

        setupButtons();
    }
    private void setupToolbar() {


        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.edit_profile_heading_main);
            getSupportActionBar().setSubtitle(R.string.edit_profile_heading_sub);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            int surface = SurfaceColors.SURFACE_0.getColor(this);
            getWindow().setStatusBarColor(surface);
            getWindow().setNavigationBarColor(surface);


            toolbar.setNavigationOnClickListener(v -> onBackPressed());
        }
    }



    private void bindViews() {
        toolbar = findViewById(R.id.topAppBar);
        nameInput = findViewById(R.id.input_name);                // TextView
        idNoInput = findViewById(R.id.input_id_no);               // TextView
        sexInput = findViewById(R.id.input_sex);                  // TextView
        nationalityInput = findViewById(R.id.input_nationality);  // TextView
        dobInput = findViewById(R.id.input_dob);                  // TextView
        phoneInput = findViewById(R.id.input_phone);              // EditText
        placeOriginInput = findViewById(R.id.input_place_origin); // TextView
        placeResidenceInput = findViewById(R.id.input_place_residence); // TextView
        issueDateInput = findViewById(R.id.input_issue_date);     // TextView
        issuePlaceInput = findViewById(R.id.input_issue_place);   // TextView - now shows "Not available from ID card"

        saveButton = findViewById(R.id.btn_save_profile);
        btnFetchAgain = findViewById(R.id.btn_fetchdata_again);
        previewImage = findViewById(R.id.preview_image);
        previewImageBack = findViewById(R.id.preview_image_back);
    }

    private void loadUserAndFill() {
        currentUser = tokenManager.getUserData();
        if (currentUser == null) {
            Toast.makeText(this, getString(R.string.toast_no_user_data_sign_in), Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        // Ensure ClientProfile is never null while we're on this screen.
        ensureClientProfile(currentUser);

        // Fill UI (all getters are null-safe via getOrEmpty / safe reads)
        nameInput.setText(getOrEmpty(currentUser.getFullName()));
        phoneInput.setText(getOrEmpty(currentUser.getPhone()));

            ClientProfile cp = currentUser.getClientProfile();
            idNoInput.setText(getOrEmpty(cp.getCitizenId()));
            sexInput.setText(getOrEmpty(cp.getSexDisplay())); // assumes your model returns "Nam"/"Nữ"
            nationalityInput.setText(getOrEmpty(cp.getNationality()));
            dobInput.setText(getOrEmpty(cp.getDateOfBirth()));
            placeOriginInput.setText(getOrEmpty(cp.getPlaceOfOrigin()));
            placeResidenceInput.setText(getOrEmpty(cp.getPlaceOfResidence()));
            issuePlaceInput.setText("Not available from ID card");



    }

    private final String TAG = "EditProfileActivity";
    private void fetchPutClientProfile() {
        if (currentUser == null) return;
        
        // Show loading dialog
        loadingDialog.show("Verifying client...");
        
        // Check if we have ID card images to upload
        if (frontImageUri != null && backImageUri != null) {
            // Use multipart upload with images for verification
            submitClientProfileRequest();
        } else {
            Toast.makeText(this, getString(R.string.toast_please_upload_image), Toast.LENGTH_SHORT).show();
        }
    }
    
    private void submitClientProfileRequest() {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> {
            try {
                // Heavy work on background thread
                byte[] frontBytes = readAllBytesFromUri(frontImageUri);
                byte[] backBytes = readAllBytesFromUri(backImageUri);

                // Continue with API call on main thread
                runOnUiThread(() -> {
                    // Create RequestBody for text fields
                    RequestBody citizenIdBody = RequestBody.create(getText(idNoInput), MediaType.parse("text/plain"));
                    RequestBody dateOfBirthBody = RequestBody.create(getText(dobInput), MediaType.parse("text/plain"));
                    RequestBody sexBody = RequestBody.create(String.valueOf("Nam".equalsIgnoreCase(getText(sexInput))), MediaType.parse("text/plain"));
                    RequestBody nationalityBody = RequestBody.create(getText(nationalityInput), MediaType.parse("text/plain"));
                    RequestBody placeOfOriginBody = RequestBody.create(getText(placeOriginInput), MediaType.parse("text/plain"));
                    RequestBody placeOfResidenceBody = RequestBody.create(getText(placeResidenceInput), MediaType.parse("text/plain"));
                    RequestBody fullNameBody = RequestBody.create(getText(nameInput), MediaType.parse("text/plain"));
                    RequestBody phoneBody = RequestBody.create("0375357288", MediaType.parse("text/plain"));
                    RequestBody idBody = RequestBody.create(tokenManager.getUserData().getId(), MediaType.parse("text/plain"));


                    // Create multipart parts for images
                    RequestBody frontImageBody = RequestBody.create(frontBytes, MediaType.parse("image/jpeg"));
                    RequestBody backImageBody = RequestBody.create(backBytes, MediaType.parse("image/jpeg"));

                    MultipartBody.Part frontPart = MultipartBody.Part.createFormData("FrontCitizenCardImage", "front.jpg", frontImageBody);
                    MultipartBody.Part backPart = MultipartBody.Part.createFormData("BackCitizenCardImage", "back.jpg", backImageBody);




                    Log.i(TAG, "submitClientProfileRequest: Updating client profile with new API");
                    OcrService ocrService = ApiClient.getServiceLast(this).create(OcrService.class);
                    retrofit2.Call<User> call = ocrService.updateClientProfile(
                            frontPart,
                            backPart,
                            citizenIdBody,
                            dateOfBirthBody,
                            sexBody,
                            nationalityBody,
                            placeOfOriginBody,
                            placeOfResidenceBody,
                            fullNameBody,
                            phoneBody,
                            idBody
                    );


                    call.enqueue(new retrofit2.Callback<User>() {
                        @Override
                        public void onResponse(retrofit2.Call<User> call, retrofit2.Response<User> response) {
                            loadingDialog.dismiss();

                            if (response.isSuccessful() && response.body() != null) {
                                User updatedUser = authenticationService.getCurrentUser();
                                // Update the stored user data
                                tokenManager.saveUserData(updatedUser);
                                Toast.makeText(EditProfileActivity.this, getString(R.string.toast_profile_request_submitted), Toast.LENGTH_SHORT).show();
                                // Add 2-second delay before navigating to ProfileFragment
                                new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                                    @Override
                                    public void run() {
                                        // Navigate to MainActivity with ProfileFragment selected
                                        Intent intent = new Intent(EditProfileActivity.this, vn.edu.fpt.sapsmobile.activities.main.MainActivity.class);
                                        intent.putExtra("selected_fragment", "profile");
                                        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                                        startActivity(intent);
                                        finish();
                                    }
                                }, 2000); // 2000 milliseconds = 2 seconds
//                                finish();
                            } else {
                                String errorMessage = "Failed to update client profile";
                                if (response.code() == 400) {
                                    errorMessage = "Invalid data provided";
                                } else if (response.code() == 401) {
                                    errorMessage = "Unauthorized. Please login again.";
                                } else if (response.code() == 500) {
                                    errorMessage = "Server error occurred";
                                }
                                Toast.makeText(EditProfileActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                                Log.e("CLIENT_PROFILE_UPDATE_ERROR", "Code: " + response.code() + ", Message: " + response.message());
                            }
                        }

                        @Override
                        public void onFailure(retrofit2.Call<User> call, Throwable t) {
                            loadingDialog.dismiss();
                            String errorMessage = "Network error occurred";
                            if (t instanceof java.net.SocketTimeoutException) {
                                errorMessage = "Request timed out. Please try again.";
                            } else if (t.getMessage() != null && t.getMessage().contains("Broken pipe")) {
                                errorMessage = "Connection lost. Please check your internet and try again.";
                            } else if (t instanceof java.net.ConnectException) {
                                errorMessage = "Cannot connect to server. Please check your connection.";
                            }
                            Toast.makeText(EditProfileActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                            Log.e("CLIENT_PROFILE_UPDATE_ERROR", "Error updating client profile: " + t.getMessage(), t);
                        }
                    });
                });
            } catch (IOException e) {
                runOnUiThread(() -> {
                    loadingDialog.dismiss();
                    Log.e("PROFILE_UPDATE_ERROR", "Error reading images: " + e.getMessage(), e);
                    Toast.makeText(EditProfileActivity.this, getString(R.string.toast_error_reading_images), Toast.LENGTH_SHORT).show();
                });
            } finally {
                executor.shutdown();
            }
        });
    }

    private void setupButtons() {
        saveButton.setOnClickListener(v -> {
            fetchPutClientProfile();
        });

        Button btnTakePhoto = findViewById(R.id.btn_take_photo);
        Button btnPickFront = findViewById(R.id.btn_pick_front);
        Button btnPickBack = findViewById(R.id.btn_pick_back);

        btnTakePhoto.setOnClickListener(v -> openCamera());
        btnPickFront.setOnClickListener(v -> pickPhoto(REQUEST_PICK_FRONT));
        btnPickBack.setOnClickListener(v -> pickPhoto(REQUEST_PICK_BACK));

        btnFetchAgain.setOnClickListener(v -> {
            if (frontImageUri != null && backImageUri != null) {
                uploadBothImagesToServer(frontImageUri, backImageUri);
            } else {
                Toast.makeText(this, getString(R.string.toast_please_select_both_sides_id), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void ensureClientProfile(User user) {
        if (user.getClientProfile() == null) {
            user.setClientProfile(new ClientProfile());
        }
    }

    private String getOrEmpty(String s) {
        return s == null ? "" : s;
    }

    private String getText(TextView tv) {
        return tv.getText() == null ? "" : tv.getText().toString().trim();
    }

    private void pickPhoto(int requestCode) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE); // Only pick files you can open
        intent.setType("*/*"); // Allow any file type
//        startActivityForResult(intent, REQUEST_PICK_FRONT);

//        Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(intent, requestCode);
    }

    private void openCamera() {
        Toast.makeText(this, getString(R.string.toast_feature_not_supported_recognition), Toast.LENGTH_SHORT).show();
    }

    @Override
    @SuppressLint("MissingSuperCall")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (resultCode != RESULT_OK || data == null || data.getData() == null) {
            Toast.makeText(this, R.string.edit_profile_toast_notification_2, Toast.LENGTH_SHORT).show();
            return;
        }

        Uri imageUri = data.getData();
        if (requestCode == REQUEST_PICK_FRONT) {
            frontImageUri = imageUri;
            // Use Glide for optimized image loading
            Glide.with(this)
                    .load(frontImageUri)
                    .override(800, 600) // Resize to reasonable dimensions
                    .into(previewImage);
            previewImage.setVisibility(View.VISIBLE);
        } else if (requestCode == REQUEST_PICK_BACK) {
            backImageUri = imageUri;
            // Use Glide for optimized image loading
            Glide.with(this)
                    .load(backImageUri)
                    .override(800, 600) // Resize to reasonable dimensions
                    .into(previewImageBack);
            previewImageBack.setVisibility(View.VISIBLE);
        }

        if (frontImageUri != null && backImageUri != null) {
            uploadBothImagesToServer(frontImageUri, backImageUri);
        } else {
            Toast.makeText(this, R.string.edit_profile_toast_notification_1, Toast.LENGTH_SHORT).show();
        }
    }

    //region ID Card upload Image
    private void uploadBothImagesToServer(Uri frontUri, Uri backUri) {
        loadingDialog.show("Uploading ID card images...");

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> {
            try {
                // Heavy work on background thread
                byte[] frontBytes = readAllBytesFromUri(frontUri);
                byte[] backBytes = readAllBytesFromUri(backUri);

                // Continue with API call on main thread
                runOnUiThread(() -> fetchOcrData(frontBytes, backBytes));

            } catch (IOException e) {
                runOnUiThread(() -> handleError(e));
            } finally {
                executor.shutdown(); // Clean up the executor
            }
        });
    }


    private void fetchOcrData(byte[] frontBytes, byte[] backBytes) {
        try {

            // Detect actual image format or use appropriate MediaType
            MediaType imageType = MediaType.parse("image/jpeg"); // or "image/png"


            RequestBody frontBody = RequestBody.create(frontBytes, imageType);
            RequestBody backBody = RequestBody.create(backBytes, imageType);

            MultipartBody.Part frontPart = MultipartBody.Part.createFormData("FrontImage", "front.jpg", frontBody);
            MultipartBody.Part backPart = MultipartBody.Part.createFormData("BackImage", "back.jpg", backBody);

            OcrService ocrService = ApiClient.getServiceLast(this).create(OcrService.class);
            retrofit2.Call<IdCardResponse> call = ocrService.getInfoIdCard(frontPart, backPart);
            // Convert byte arrays to Base64
//            String frontBase64 = Base64.encodeToString(frontBytes, Base64.NO_WRAP);
//            String backBase64 = Base64.encodeToString(backBytes, Base64.NO_WRAP);
//
//            // Create request object
//            IdCardBase64Request request = new IdCardBase64Request(
//                    frontBase64,
//                    backBase64,
//                    "jpeg",
//                    "jpeg"
//            );
//            // Make API call
//            ApiService apiService = ApiTest.getServiceLast(this).create(ApiService.class);
//            retrofit2.Call<IdCardResponse> call = apiService.getInfoIdCardBase64(request);


            call.enqueue(new Callback<IdCardResponse>() {
                @Override
                public void onResponse(retrofit2.Call<IdCardResponse> call, Response<IdCardResponse> response) {
                    loadingDialog.dismiss();

                    if (response.isSuccessful() && response.body() != null) {
                        IdCardResponse idCard = response.body();
                        fillFromOcr(idCard);
                        saveButton.setEnabled(true);
                        Toast.makeText(EditProfileActivity.this, getString(R.string.toast_auto_filled_from_id), Toast.LENGTH_SHORT).show();
                        Log.i("check", "onResponse: " + response.body());
                    } else {
                        String errorMessage = "OCR failed";
                        if (response.code() == 400) errorMessage = "Invalid image format";
                        else if (response.code() == 500) errorMessage = "Server error occurred";

                        Toast.makeText(EditProfileActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
                        Log.e("OCR_RESPONSE_ERROR", "Code: " + response.code());
                    }
                }

                @Override
                public void onFailure(retrofit2.Call<IdCardResponse> call, Throwable t) {
                    loadingDialog.dismiss();
                    String errorMessage = "Upload failed";
                    if (t instanceof java.net.SocketTimeoutException) {
                        errorMessage = "Request timed out. Please try again.";
                    } else if (t.getMessage() != null && t.getMessage().contains("Broken pipe")) {
                        errorMessage = "Connection lost. Please check your internet and try again.";
                    } else if (t instanceof java.net.ConnectException) {
                        errorMessage = "Cannot connect to server. Please check your connection.";
                    }
                    Toast.makeText(EditProfileActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                    Log.e("OCR_UPLOAD_ERROR", "Error uploading images: " + t.getMessage(), t);
                }
            });
        } catch (Exception e) {
            loadingDialog.dismiss();
            Log.e("OCR_API_ERROR", "Error creating API call: " + e.getMessage());
                            Toast.makeText(EditProfileActivity.this, getString(R.string.toast_error_preparing_upload), Toast.LENGTH_SHORT).show();
        }
    }

    private void handleError(IOException e) {
        loadingDialog.dismiss();
        Log.e("OCR_IO_ERROR", e.getMessage(), e);
                        Toast.makeText(EditProfileActivity.this, getString(R.string.toast_error_reading_images), Toast.LENGTH_SHORT).show();
    }
    //endregion

    private void fillFromOcr(IdCardResponse idCard) {
        // Defensive: don't assume any field exists
        nameInput.setText(getOrEmpty(idCard.getFullName()));
        dobInput.setText(getOrEmpty(idCard.getDateOfBirth()));
        placeOriginInput.setText(getOrEmpty(idCard.getPlaceOfOrigin()));
        placeResidenceInput.setText(getOrEmpty(idCard.getPlaceOfResidence()));
        idNoInput.setText(getOrEmpty(idCard.getCitizenId()));
        sexInput.setText(getOrEmpty(idCard.getSex()));
        nationalityInput.setText(getOrEmpty(idCard.getNationality()));
        issueDateInput.setText(getOrEmpty(idCard.getExpiryDate()));
        issuePlaceInput.setText("Not available from ID card");
    }

    private byte[] readAllBytesFromUri(Uri uri) throws IOException {
        // Compress image before reading
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inSampleSize = 2; // Reduce size by half
        options.inJustDecodeBounds = false;

        try (InputStream is = getContentResolver().openInputStream(uri)) {
            Bitmap bitmap = BitmapFactory.decodeStream(is, null, options);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.JPEG, 80, baos); // 80% quality
            return baos.toByteArray();
        }
    }


}
