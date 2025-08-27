package vn.edu.fpt.sapsmobile.activities.profile;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;

import com.bumptech.glide.Glide;

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
import vn.edu.fpt.sapsmobile.network.api.ApiService;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.ClientProfile;
import vn.edu.fpt.sapsmobile.dtos.profile.IdCardResponse;
import vn.edu.fpt.sapsmobile.dtos.profile.VerificationResponse;
import vn.edu.fpt.sapsmobile.dtos.profile.ClientProfileData;
import vn.edu.fpt.sapsmobile.models.User;
import com.google.gson.Gson;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;
import android.util.Base64;

public class EditProfileActivity extends AppCompatActivity {

    private EditText phoneInput;
    private TextView nameInput, idNoInput, sexInput,
            nationalityInput, dobInput, placeOriginInput,
            placeResidenceInput, issueDateInput, issuePlaceInput;
    private Button saveButton, btnFetchAgain;
    private TokenManager tokenManager;
    private User currentUser;
    private ImageView previewImage, previewImageBack;

    private LoadingDialog loadingDialog;

    private static final int REQUEST_PICK_FRONT = 2001;
    private static final int REQUEST_PICK_BACK = 2002;

    private Uri frontImageUri;
    private Uri backImageUri;

    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_profile);

        setupActionBar();
        bindViews();

        tokenManager = new TokenManager(this);
        loadingDialog = new LoadingDialog(this);

        loadUserAndFill();

        setupButtons();
    }

    private void setupActionBar() {
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setTitle(R.string.edit_profile_heading_main);
            actionBar.setSubtitle(R.string.edit_profile_heading_sub);
            actionBar.setDisplayHomeAsUpEnabled(true);
        }
    }

    private void bindViews() {
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
                    RequestBody headerBody = RequestBody.create("Update user info", MediaType.parse("text/plain"));
                    RequestBody descriptionBody = RequestBody.create("Client profile verification request for level 2 authentication", MediaType.parse("text/plain"));
                    RequestBody dataTypeBody = RequestBody.create("ClientProfile", MediaType.parse("text/plain"));
                    
                    // Encode images to base64
                    String frontImageBase64 = Base64.encodeToString(frontBytes, Base64.DEFAULT);
                    String backImageBase64 = Base64.encodeToString(backBytes, Base64.DEFAULT);
                    
                    // Create the data object and serialize it to JSON
                    ClientProfileData profileData = new ClientProfileData(
                            frontImageBase64,
                            backImageBase64,
                            getText(idNoInput),
                            getText(dobInput),
                            String.valueOf("Nam".equalsIgnoreCase(getText(sexInput))),
                            getText(nationalityInput),
                            getText(placeOriginInput),
                            getText(placeResidenceInput),
                            tokenManager.getUserData().getId()
                    );
                    
                    Gson gson = new Gson();
                    String jsonData = gson.toJson(profileData);
                    RequestBody dataBody = RequestBody.create(jsonData, MediaType.parse("text/plain"));

                    // Create multipart parts for attachments
                    RequestBody frontBody = RequestBody.create(frontBytes, MediaType.parse("image/jpeg"));
                    RequestBody backBody = RequestBody.create(backBytes, MediaType.parse("image/jpeg"));

                    MultipartBody.Part frontPart = MultipartBody.Part.createFormData("Attachments", "front.jpg", frontBody);
                    MultipartBody.Part backPart = MultipartBody.Part.createFormData("Attachments", "back.jpg", backBody);
                    Log.i(TAG, "submitClientProfileRequest: " + dataBody);
                    ApiService apiService = ApiTest.getServiceLast(this).create(ApiService.class);
                    retrofit2.Call<VerificationResponse> call = apiService.submitClientProfileRequest(
                            headerBody,
                            descriptionBody,
                            dataTypeBody,
                            dataBody,
                            frontPart,
                            backPart
                    );

                    call.enqueue(new retrofit2.Callback<VerificationResponse>() {
                        @Override
                        public void onResponse(retrofit2.Call<VerificationResponse> call, retrofit2.Response<VerificationResponse> response) {
                            loadingDialog.dismiss();

                            if (response.isSuccessful() && response.body() != null) {
                                VerificationResponse verificationResponse = response.body();
                                Toast.makeText(EditProfileActivity.this, getString(R.string.toast_profile_request_submitted), Toast.LENGTH_SHORT).show();
                                finish();
                            } else {
                                String errorMessage = "Failed to submit client profile request";
                                if (response.code() == 400) {
                                    errorMessage = "Invalid data provided";
                                } else if (response.code() == 401) {
                                    errorMessage = "Unauthorized. Please login again.";
                                } else if (response.code() == 500) {
                                    errorMessage = "Server error occurred";
                                }
                                Toast.makeText(EditProfileActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                                Log.e("CLIENT_PROFILE_REQUEST_ERROR", "Code: " + response.code() + ", Message: " + response.message());
                            }
                        }

                        @Override
                        public void onFailure(retrofit2.Call<VerificationResponse> call, Throwable t) {
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
                            Log.e("CLIENT_PROFILE_REQUEST_ERROR", "Error submitting client profile request: " + t.getMessage(), t);
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

            ApiService apiService = ApiTest.getServiceLast(this).create(ApiService.class);
            retrofit2.Call<IdCardResponse> call = apiService.getInfoIdCard(frontPart, backPart);
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

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
