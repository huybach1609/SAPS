package vn.edu.fpt.sapsmobile.activities.profile;

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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.RequestBody;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.API.ApiService;
import vn.edu.fpt.sapsmobile.API.ApiTest;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.ClientProfile;
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
        issuePlaceInput = findViewById(R.id.input_issue_place);   // TextView

        saveButton = findViewById(R.id.btn_save_profile);
        previewImage = findViewById(R.id.preview_image);
    }

    private void loadUserAndFill() {
        currentUser = tokenManager.getUserData();
        if (currentUser == null) {
            Toast.makeText(this, "No user data. Please sign in again.", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        // Ensure ClientProfile is never null while we’re on this screen.
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

        // If you later add these fields to ClientProfile, just map them here
        // issueDateInput.setText(getOrEmpty(cp.getIssueDate()));
        // issuePlaceInput.setText(getOrEmpty(cp.getIssuePlace()));
    }

    private void setupButtons() {
        saveButton.setOnClickListener(v -> {
            if (currentUser == null) return;
            ensureClientProfile(currentUser);
            ClientProfile cp = currentUser.getClientProfile();

            currentUser.setFullName(getText(nameInput));
            currentUser.setPhone(getText(phoneInput));

            cp.setCitizenId(getText(idNoInput));
            cp.setSex("Nam".equalsIgnoreCase(getText(sexInput))); // adjust to your logic
            cp.setNationality(getText(nationalityInput));
            cp.setDateOfBirth(getText(dobInput));
            cp.setPlaceOfOrigin(getText(placeOriginInput));
            cp.setPlaceOfResidence(getText(placeResidenceInput));
            // cp.setIssueDate(getText(issueDateInput));
            // cp.setIssuePlace(getText(issuePlaceInput));

            tokenManager.saveUserData(currentUser);
            Toast.makeText(this, "Profile updated!", Toast.LENGTH_SHORT).show();
            finish();
        });

        Button btnTakePhoto = findViewById(R.id.btn_take_photo);
        Button btnPickFront = findViewById(R.id.btn_pick_front);
        Button btnPickBack = findViewById(R.id.btn_pick_back);

        btnTakePhoto.setOnClickListener(v -> openCamera());
        btnPickFront.setOnClickListener(v -> pickPhoto(REQUEST_PICK_FRONT));
        btnPickBack.setOnClickListener(v -> pickPhoto(REQUEST_PICK_BACK));
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
        Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        startActivityForResult(pickPhoto, requestCode);
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
            previewImage.setImageURI(frontImageUri);
            previewImage.setVisibility(View.VISIBLE);
        } else if (requestCode == REQUEST_PICK_BACK) {
            backImageUri = imageUri;
            ImageView previewBack = findViewById(R.id.preview_image_back);
            if (previewBack != null) {
                previewBack.setImageURI(backImageUri);
                previewBack.setVisibility(View.VISIBLE);
            }
        }

        if (frontImageUri != null && backImageUri != null) {
            uploadBothImagesToServer(frontImageUri, backImageUri);
        } else {
            Toast.makeText(this, R.string.edit_profile_toast_notification_1, Toast.LENGTH_SHORT).show();
        }
    }

    private void uploadBothImagesToServer(Uri frontUri, Uri backUri) {
        try {
            loadingDialog.show("Uploading ID card images...");

            byte[] frontBytes = compressImage(frontUri);
            byte[] backBytes = compressImage(backUri);

            if (frontBytes == null || backBytes == null) {
                loadingDialog.hide();
                Toast.makeText(this, "Unable to read selected images.", Toast.LENGTH_LONG).show();
                return;
            }

            RequestBody frontBody = RequestBody.create(frontBytes, MediaType.parse("image/jpeg"));
            RequestBody backBody = RequestBody.create(backBytes, MediaType.parse("image/jpeg"));

            MultipartBody.Part frontPart = MultipartBody.Part.createFormData("front", "front.jpg", frontBody);
            MultipartBody.Part backPart = MultipartBody.Part.createFormData("back", "back.jpg", backBody);

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
                        Toast.makeText(EditProfileActivity.this, "Auto-filled from ID card", Toast.LENGTH_SHORT).show();
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

        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(this, "Error reading images", Toast.LENGTH_SHORT).show();
            loadingDialog.hide();
            Log.e("OCR_UPLOAD_ERROR", "IOException in uploadBothImagesToServer", e);
        }
    }

    private void fillFromOcr(IdCardResponse idCard) {
        // Defensive: don’t assume any field exists
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

    // Returns null if decoding failed, otherwise compressed bytes
    private byte[] compressImage(Uri uri) throws IOException {
        if (uri == null) return null;
        InputStream inputStream = getContentResolver().openInputStream(uri);
        if (inputStream == null) return null;

        Bitmap bitmap = BitmapFactory.decodeStream(inputStream);
        inputStream.close();

        if (bitmap == null) return null;

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, outputStream);
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
