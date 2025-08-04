package vn.edu.fpt.sapsmobile.activities.auth;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class EditProfileActivity extends AppCompatActivity {

    private EditText nameInput, dobInput, phoneInput, placeOriginInput, placeResidenceInput;
    private EditText idNoInput, sexInput, nationalityInput, issueDateInput, issuePlaceInput;
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

        tokenManager = new TokenManager(this);
        currentUser = tokenManager.getUserData();
        loadingDialog = new LoadingDialog(this);

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
                Toast.makeText(this, "Vui lòng chọn cả 2 mặt trước và sau của CCCD", Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(this, "Không chọn ảnh", Toast.LENGTH_SHORT).show();
        }
    }

    private void uploadBothImagesToServer(Uri frontUri, Uri backUri) {
        try {
            loadingDialog.show("Uploading ID card images...");

            InputStream frontStream = getContentResolver().openInputStream(frontUri);
            byte[] frontBytes = new byte[frontStream.available()];
            frontStream.read(frontBytes);
            frontStream.close();

            InputStream backStream = getContentResolver().openInputStream(backUri);
            byte[] backBytes = new byte[backStream.available()];
            backStream.read(backBytes);
            backStream.close();

            RequestBody requestBody = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("front", "front.jpg", RequestBody.create(frontBytes, MediaType.parse("image/jpeg")))
                    .addFormDataPart("back", "back.jpg", RequestBody.create(backBytes, MediaType.parse("image/jpeg")))
                    .build();

            Request request = new Request.Builder()
                    .url("http://10.35.88.16:8080/api/ocr/full")
                    .post(requestBody)
                    .build();

            OkHttpClient client = new OkHttpClient();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    runOnUiThread(() -> {
                        loadingDialog.hide();
                        Toast.makeText(EditProfileActivity.this, "Upload failed", Toast.LENGTH_SHORT).show();
                        Log.e("OCR_UPLOAD_ERROR", "Error uploading images: " + e.getMessage());
                    });
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    runOnUiThread(() -> loadingDialog.hide());

                    if (response.isSuccessful()) {
                        String json = response.body().string();
                        try {
                            JSONObject obj = new JSONObject(json);
                            runOnUiThread(() -> {
                                nameInput.setText(obj.optString("name"));
                                dobInput.setText(obj.optString("date_of_birth"));
                                phoneInput.setText(obj.optString("phone"));
                                placeOriginInput.setText(obj.optString("place_of_origin"));
                                placeResidenceInput.setText(obj.optString("place_of_residence"));
                                idNoInput.setText(obj.optString("id_number"));
                                sexInput.setText(obj.optString("sex"));
                                nationalityInput.setText(obj.optString("nationality"));
                                issueDateInput.setText(obj.optString("issue_date"));
                                issuePlaceInput.setText(obj.optString("issue_place"));
                                saveButton.setEnabled(true);
                                Toast.makeText(EditProfileActivity.this, "Auto-filled from ID card", Toast.LENGTH_SHORT).show();
                            });
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    } else {
                        String errorBody = response.body() != null ? response.body().string() : "null";
                        runOnUiThread(() -> {
                            Toast.makeText(EditProfileActivity.this, "OCR failed", Toast.LENGTH_SHORT).show();
                            Log.e("OCR_RESPONSE_ERROR", "Code: " + response.code() + " | Body: " + errorBody);
                        });
                    }
                }
            });

        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(this, "Error reading images", Toast.LENGTH_SHORT).show();
            loadingDialog.hide();
        }
    }
}
