package vn.edu.fpt.sapsmobile.activities.auth;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
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

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import okhttp3.Call;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.API.ApiService;
import vn.edu.fpt.sapsmobile.API.ApiTest;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.IdCardResponse;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class EditProfileActivity extends AppCompatActivity {

    private EditText phoneInput;
    private TextView nameInput, idNoInput, sexInput,
            nationalityInput, dobInput, placeOriginInput,
            placeResidenceInput, issueDateInput, issuePlaceInput;
    private Button saveButton;
    private TokenManager tokenManager;
    private User currentUser;
    private ImageView previewImage;

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


        // action bar
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setTitle(R.string.edit_profile_heading_main);
            actionBar.setSubtitle(R.string.edit_profile_heading_sub);
            actionBar.setDisplayHomeAsUpEnabled(true); // Show back arrow
        }

        tokenManager = new TokenManager(this);
        currentUser = tokenManager.getUserData();
        loadingDialog = new LoadingDialog(this);

        nameInput = findViewById(R.id.input_name);// text view
        idNoInput = findViewById(R.id.input_id_no); // text view
        sexInput = findViewById(R.id.input_sex); // text view
        nationalityInput = findViewById(R.id.input_nationality); // text view
        dobInput = findViewById(R.id.input_dob); // text view
        phoneInput = findViewById(R.id.input_phone); // edit text
        placeOriginInput = findViewById(R.id.input_place_origin); // text view
        placeResidenceInput = findViewById(R.id.input_place_residence); // text view
        issueDateInput = findViewById(R.id.input_issue_date); // text view
        issuePlaceInput = findViewById(R.id.input_issue_place); // text view

        // button
        saveButton = findViewById(R.id.btn_save_profile);
        previewImage = findViewById(R.id.preview_image);

        if (currentUser != null) {
            nameInput.setText(currentUser.getName());
            idNoInput.setText(currentUser.getUserId());
            sexInput.setText(currentUser.getSex());
            nationalityInput.setText(currentUser.getNationality());
            dobInput.setText(currentUser.getDateOfBirth());
            phoneInput.setText(currentUser.getPhone());
            placeOriginInput.setText(currentUser.getPlaceOfOrigin());
            placeResidenceInput.setText(currentUser.getPlaceOfResidence());
            issueDateInput.setText(currentUser.getIssueDate());
            issuePlaceInput.setText(currentUser.getIssuePlace());
        }

        saveButton.setOnClickListener(v -> {
            currentUser.setName(nameInput.getText().toString());
            currentUser.setUserId(idNoInput.getText().toString());
            currentUser.setSex(sexInput.getText().toString());
            currentUser.setNationality(nationalityInput.getText().toString());
            currentUser.setDateOfBirth(dobInput.getText().toString());
            currentUser.setPhone(phoneInput.getText().toString());
            currentUser.setPlaceOfOrigin(placeOriginInput.getText().toString());
            currentUser.setPlaceOfResidence(placeResidenceInput.getText().toString());
            currentUser.setIssueDate(issueDateInput.getText().toString());
            currentUser.setIssuePlace(issuePlaceInput.getText().toString());
            tokenManager.saveUserData(currentUser);
            Toast.makeText(this, "Profile updated!", Toast.LENGTH_SHORT).show();
            finish();
        });

        Button btnTakePhoto = findViewById(R.id.btn_take_photo);
        Button btnPickFront = findViewById(R.id.btn_pick_front);
        Button btnPickBack = findViewById(R.id.btn_pick_back);

        btnTakePhoto.setOnClickListener(v -> openCamera());

        btnPickFront.setOnClickListener(v -> {
            Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(pickPhoto, REQUEST_PICK_FRONT);
        });

        btnPickBack.setOnClickListener(v -> {
            Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(pickPhoto, REQUEST_PICK_BACK);
        });
    }

    private void openCamera() {
        Toast.makeText(this, "Chức năng này chưa hỗ trợ nhận dạng cả 2 mặt từ ảnh chụp.", Toast.LENGTH_SHORT).show();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (resultCode == RESULT_OK && data != null && data.getData() != null) {
            Uri imageUri = data.getData();

            if (requestCode == REQUEST_PICK_FRONT) {
                frontImageUri = imageUri;
                previewImage.setImageURI(frontImageUri);
                previewImage.setVisibility(View.VISIBLE);
            } else if (requestCode == REQUEST_PICK_BACK) {
                backImageUri = imageUri;
                ImageView previewBack = findViewById(R.id.preview_image_back);
                previewBack.setImageURI(backImageUri);
                previewBack.setVisibility(View.VISIBLE);
            }

            if (frontImageUri != null && backImageUri != null) {
                uploadBothImagesToServer(frontImageUri, backImageUri);
            } else {
                Toast.makeText(this, R.string.edit_profile_toast_notification_1, Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(this, R.string.edit_profile_toast_notification_2, Toast.LENGTH_SHORT).show();
        }
    }

    private void uploadBothImagesToServer(Uri frontUri, Uri backUri) {
        try {
            loadingDialog.show("Uploading ID card images...");

            // Get compressed images as byte arrays
            byte[] frontBytes = compressImage(frontUri);
            byte[] backBytes = compressImage(backUri); // Fixed: was using frontUri instead of backUri

            // Create multipart parts for Retrofit
            RequestBody frontBody = RequestBody.create(frontBytes, MediaType.parse("image/jpeg"));
            RequestBody backBody = RequestBody.create(backBytes, MediaType.parse("image/jpeg"));

            MultipartBody.Part frontPart = MultipartBody.Part.createFormData("front", "front.jpg", frontBody);
            MultipartBody.Part backPart = MultipartBody.Part.createFormData("back", "back.jpg", backBody);

            // Use Retrofit instead of raw OkHttp
            ApiService apiService = ApiTest.getServiceMockApi(this).create(ApiService.class);
            retrofit2.Call<IdCardResponse> call = apiService.getInfoIdCard(frontPart, backPart);

            call.enqueue(new Callback<IdCardResponse>() {
                @Override
                public void onResponse(retrofit2.Call<IdCardResponse> call, Response<IdCardResponse> response) {
                    runOnUiThread(() -> loadingDialog.hide());

                    if (response.isSuccessful() && response.body() != null) {
                        IdCardResponse idCard = response.body();
                        runOnUiThread(() -> {
                            // Populate the fields
                            nameInput.setText(idCard.getName());
                            dobInput.setText(idCard.getDateOfBirth());
                            phoneInput.setText(idCard.getPhone());
                            placeOriginInput.setText(idCard.getPlaceOfOrigin());
                            placeResidenceInput.setText(idCard.getPlaceOfResidence());
                            idNoInput.setText(idCard.getIdNumber());
                            sexInput.setText(idCard.getSex());
                            nationalityInput.setText(idCard.getNationality());
                            issueDateInput.setText(idCard.getIssueDate());
                            issuePlaceInput.setText(idCard.getIssuePlace());
                            saveButton.setEnabled(true);
                            Toast.makeText(EditProfileActivity.this, "Auto-filled from ID card", Toast.LENGTH_SHORT).show();
                        });
                    } else {
                        runOnUiThread(() -> {
                            String errorMessage = "OCR failed";
                            if (response.code() == 400) {
                                errorMessage = "Invalid image format";
                            } else if (response.code() == 500) {
                                errorMessage = "Server error occurred";
                            }
                            Toast.makeText(EditProfileActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
                            Log.e("OCR_RESPONSE_ERROR", "Code: " + response.code());
                        });
                    }

                }

                @Override
                public void onFailure(retrofit2.Call<IdCardResponse> call, Throwable t) {
                    runOnUiThread(() -> {
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
                    });
                }
            });

        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(this, "Error reading images", Toast.LENGTH_SHORT).show();
            loadingDialog.hide();
            Log.e("OCR_UPLOAD_ERROR", "IOException in uploadBothImagesToServer", e);
        }
    }

    // Add this method to compress images
    private byte[] compressImage(Uri uri) throws IOException {
        InputStream inputStream = getContentResolver().openInputStream(uri);
        Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
        inputStream.close();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, outputStream); // 80% quality
        return outputStream.toByteArray();
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

