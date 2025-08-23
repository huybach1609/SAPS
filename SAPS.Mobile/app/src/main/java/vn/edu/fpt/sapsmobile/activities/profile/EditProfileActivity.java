package vn.edu.fpt.sapsmobile.activities.profile;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
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
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.dtos.profile.IdCardResponse;
import vn.edu.fpt.sapsmobile.models.ClientProfile;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.service.ApiService;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

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
        nameInput = findViewById(R.id.input_name);
        idNoInput = findViewById(R.id.input_id_no);
        sexInput = findViewById(R.id.input_sex);
        nationalityInput = findViewById(R.id.input_nationality);
        dobInput = findViewById(R.id.input_dob);
        phoneInput = findViewById(R.id.input_phone);
        placeOriginInput = findViewById(R.id.input_place_origin);
        placeResidenceInput = findViewById(R.id.input_place_residence);
        issueDateInput = findViewById(R.id.input_issue_date);
        issuePlaceInput = findViewById(R.id.input_issue_place);

        saveButton = findViewById(R.id.btn_save_profile);
        btnFetchAgain = findViewById(R.id.btn_fetchdata_again);
        previewImage = findViewById(R.id.preview_image);
        previewImageBack = findViewById(R.id.preview_image_back);
    }

    private void loadUserAndFill() {
        currentUser = tokenManager.getUserData();
        if (currentUser == null) {
            Toast.makeText(this, "No user data. Please sign in again.", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        ensureClientProfile(currentUser);

        nameInput.setText(getOrEmpty(currentUser.getFullName()));
        phoneInput.setText(getOrEmpty(currentUser.getPhone()));

        ClientProfile cp = currentUser.getClientProfile();
        idNoInput.setText(getOrEmpty(cp.getCitizenId()));
        sexInput.setText(getOrEmpty(cp.getSexDisplay())); // "Nam"/"Nữ"
        nationalityInput.setText(getOrEmpty(cp.getNationality()));
        dobInput.setText(getOrEmpty(cp.getDateOfBirth()));
        placeOriginInput.setText(getOrEmpty(cp.getPlaceOfOrigin()));
        placeResidenceInput.setText(getOrEmpty(cp.getPlaceOfResidence()));
    }

    private void fetchPutClientProfile() {
        if (currentUser == null) return;

        loadingDialog.show("Updating profile...");

        if (frontImageUri != null && backImageUri != null) {
            uploadProfileWithImages();
        } else {
            Toast.makeText(this, "Please upload Image", Toast.LENGTH_SHORT).show();
            loadingDialog.hide();
            // Nếu muốn cập nhật không ảnh thì triển khai uploadProfileWithoutImages();
        }
    }

    private void uploadProfileWithImages() {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> {
            try {
                byte[] frontBytes = readAllBytesFromUri(frontImageUri);
                byte[] backBytes = readAllBytesFromUri(backImageUri);

                runOnUiThread(() -> {
                    String frontMime = getContentResolver().getType(frontImageUri);
                    String backMime  = getContentResolver().getType(backImageUri);
                    if (frontMime == null) frontMime = "image/jpeg";
                    if (backMime  == null) backMime  = "image/jpeg";

                    RequestBody frontBody = RequestBody.create(frontBytes, MediaType.parse(frontMime));
                    RequestBody backBody  = RequestBody.create(backBytes,  MediaType.parse(backMime));

                    // ✅ KHỚP TÊN FIELD MULTIPART VỚI SERVER (ASP.NET)
                    MultipartBody.Part frontPart = MultipartBody.Part.createFormData(
                            "frontCitizenIdCardImage", "front.jpg", frontBody);
                    MultipartBody.Part backPart = MultipartBody.Part.createFormData(
                            "backCitizenIdCardImage", "back.jpg", backBody);

                    ApiService apiService = ApiTest.getServiceLast(this).create(ApiService.class);
                    retrofit2.Call<User> call = apiService.updateClientProfileWithImages(
                            frontPart, backPart,
                            getText(nameInput),
                            getText(phoneInput),
                            getText(idNoInput),
                            getText(dobInput),
                            "Nam".equalsIgnoreCase(getText(sexInput)),
                            getText(nationalityInput),
                            getText(placeOriginInput),
                            getText(placeResidenceInput)
                    );

                    call.enqueue(new retrofit2.Callback<User>() {
                        @Override
                        public void onResponse(retrofit2.Call<User> call, retrofit2.Response<User> response) {
                            loadingDialog.hide();

                            if (response.isSuccessful() && response.body() != null) {
                                User updatedUser = response.body();
                                tokenManager.saveUserData(updatedUser);
                                Toast.makeText(EditProfileActivity.this, "Profile updated successfully!", Toast.LENGTH_SHORT).show();
                                finish();
                            } else {
                                String errorMessage = "Failed to update profile";
                                if (response.code() == 400) {
                                    errorMessage = "Invalid data provided";
                                } else if (response.code() == 401) {
                                    errorMessage = "Unauthorized. Please login again.";
                                } else if (response.code() == 500) {
                                    errorMessage = "Server error occurred";
                                }
                                Toast.makeText(EditProfileActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                                Log.e("PROFILE_UPDATE_ERROR", "Code: " + response.code() + ", Message: " + response.message());
                            }
                        }

                        @Override
                        public void onFailure(retrofit2.Call<User> call, Throwable t) {
                            loadingDialog.hide();
                            String errorMessage = "Network error occurred";
                            if (t instanceof java.net.SocketTimeoutException) {
                                errorMessage = "Request timed out. Please try again.";
                            } else if (t.getMessage() != null && t.getMessage().contains("Broken pipe")) {
                                errorMessage = "Connection lost. Please check your internet and try again.";
                            } else if (t instanceof java.net.ConnectException) {
                                errorMessage = "Cannot connect to server. Please check your connection.";
                            }
                            Toast.makeText(EditProfileActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                            Log.e("PROFILE_UPDATE_ERROR", "Error updating profile: " + t.getMessage(), t);
                        }
                    });
                });

            } catch (IOException e) {
                runOnUiThread(() -> {
                    loadingDialog.hide();
                    Log.e("PROFILE_UPDATE_ERROR", "Error reading images: " + e.getMessage(), e);
                    Toast.makeText(EditProfileActivity.this, "Error reading images", Toast.LENGTH_SHORT).show();
                });
            } finally {
                executor.shutdown();
            }
        });
    }

    private void setupButtons() {
        saveButton.setOnClickListener(v -> fetchPutClientProfile());

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
                Toast.makeText(this, "Vui lòng chọn cả 2 mặt trước và sau của căn cước công dân", Toast.LENGTH_SHORT).show();
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
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/*"); // ✅ chỉ chọn ảnh
        startActivityForResult(intent, requestCode);
    }

    private void openCamera() {
        Toast.makeText(this, "Chức năng này chưa hỗ trợ nhận dạng cả 2 mặt từ ảnh chụp.", Toast.LENGTH_SHORT).show();
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
            Glide.with(this).load(frontImageUri).override(800, 600).into(previewImage);
            previewImage.setVisibility(ImageView.VISIBLE);
        } else if (requestCode == REQUEST_PICK_BACK) {
            backImageUri = imageUri;
            Glide.with(this).load(backImageUri).override(800, 600).into(previewImageBack);
            previewImageBack.setVisibility(ImageView.VISIBLE);
        }

        if (frontImageUri != null && backImageUri != null) {
            uploadBothImagesToServer(frontImageUri, backImageUri);
        } else {
            Toast.makeText(this, R.string.edit_profile_toast_notification_1, Toast.LENGTH_SHORT).show();
        }
    }

    //region ID Card upload Image (OCR mock)
    private void uploadBothImagesToServer(Uri frontUri, Uri backUri) {
        loadingDialog.show("Uploading ID card images...");

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> {
            try {
                byte[] frontBytes = readAllBytesFromUri(frontUri);
                byte[] backBytes = readAllBytesFromUri(backUri);

                runOnUiThread(() -> fetchOcrData(frontBytes, backBytes));

            } catch (IOException e) {
                runOnUiThread(() -> handleError(e));
            } finally {
                executor.shutdown();
            }
        });
    }

    private void fetchOcrData(byte[] frontBytes, byte[] backBytes) {
        try {
            RequestBody frontBody = RequestBody.create(frontBytes, MediaType.parse("image/jpeg"));
            RequestBody backBody  = RequestBody.create(backBytes,  MediaType.parse("image/jpeg"));

            MultipartBody.Part frontPart = MultipartBody.Part.createFormData("front", "front.jpg", frontBody);
            MultipartBody.Part backPart  = MultipartBody.Part.createFormData("back", "back.jpg", backBody);

            ApiService apiService = ApiTest.getServiceMockApi(this).create(ApiService.class);
            retrofit2.Call<IdCardResponse> call = apiService.getInfoIdCard(frontPart, backPart);

            call.enqueue(new Callback<IdCardResponse>() {
                @Override
                public void onResponse(retrofit2.Call<IdCardResponse> call, Response<IdCardResponse> response) {
                    loadingDialog.hide();

                    if (response.isSuccessful() && response.body() != null) {
                        IdCardResponse idCard = response.body();
                        fillFromOcr(idCard);
                        saveButton.setEnabled(true);
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
                    loadingDialog.hide();
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
            loadingDialog.hide();
            Log.e("OCR_API_ERROR", "Error creating API call: " + e.getMessage());
            Toast.makeText(EditProfileActivity.this, "Error preparing upload", Toast.LENGTH_SHORT).show();
        }
    }

    private void handleError(IOException e) {
        loadingDialog.hide();
        Log.e("OCR_IO_ERROR", e.getMessage(), e);
        Toast.makeText(EditProfileActivity.this, "Error reading images", Toast.LENGTH_SHORT).show();
    }
    //endregion

    private void fillFromOcr(IdCardResponse idCard) {
        nameInput.setText(getOrEmpty(idCard.getName()));
        dobInput.setText(getOrEmpty(idCard.getDateOfBirth()));
        phoneInput.setText(getOrEmpty(idCard.getPhone()));
        placeOriginInput.setText(getOrEmpty(idCard.getPlaceOfOrigin()));
        placeResidenceInput.setText(getOrEmpty(idCard.getPlaceOfResidence()));
        idNoInput.setText(getOrEmpty(idCard.getIdNumber()));
        sexInput.setText(getOrEmpty(idCard.getSex()));
        nationalityInput.setText(getOrEmpty(idCard.getNationality()));
        issueDateInput.setText(getOrEmpty(idCard.getIssueDate()));
        issuePlaceInput.setText(getOrEmpty(idCard.getIssuePlace()));
    }

    private byte[] readAllBytesFromUri(Uri uri) throws IOException {
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inSampleSize = 2;
        options.inJustDecodeBounds = false;

        try (InputStream is = getContentResolver().openInputStream(uri)) {
            Bitmap bitmap = BitmapFactory.decodeStream(is, null, options);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.JPEG, 80, baos);
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
