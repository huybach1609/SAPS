package vn.edu.fpt.sapsmobile.fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

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
import vn.edu.fpt.sapsmobile.activities.auth.RegisterActivity;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;

public class RegisterPhase3Fragment extends Fragment {

    private static final int REQUEST_PICK_FRONT = 2001;
    private static final int REQUEST_PICK_BACK = 2002;

    private ImageView previewImageFront, previewImageBack;
    private Button btnTakePhoto, btnPickFront, btnPickBack, completeButton, skipButton;
    private EditText ownerInput, plateInput, modelInput, colorInput, certificateTitleInput;

    private Uri frontImageUri;
    private Uri backImageUri;

    private LoadingDialog loadingDialog;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_register_phase3, container, false);

        previewImageFront = view.findViewById(R.id.preview_vehicle_image_front);
        previewImageBack = view.findViewById(R.id.preview_vehicle_image_back);
        btnTakePhoto = view.findViewById(R.id.btn_take_photo_vehicle);
        btnPickFront = view.findViewById(R.id.btn_pick_front_vehicle);
        btnPickBack = view.findViewById(R.id.btn_pick_back_vehicle);
        completeButton = view.findViewById(R.id.button_complete_registration);
        skipButton = view.findViewById(R.id.button_skip_phase);

        ownerInput = view.findViewById(R.id.input_owner_name);
        plateInput = view.findViewById(R.id.input_license_plate);
        modelInput = view.findViewById(R.id.input_vehicle_model);
        colorInput = view.findViewById(R.id.input_vehicle_color);
        certificateTitleInput = view.findViewById(R.id.input_certificate_title);

        loadingDialog = new LoadingDialog(requireActivity());

        btnTakePhoto.setOnClickListener(v -> {
            Toast.makeText(requireContext(), "Chức năng này chưa hỗ trợ nhận dạng cả 2 mặt từ ảnh chụp.", Toast.LENGTH_SHORT).show();
        });

        btnPickFront.setOnClickListener(v -> {
            Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(pickPhoto, REQUEST_PICK_FRONT);
        });

        btnPickBack.setOnClickListener(v -> {
            Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(pickPhoto, REQUEST_PICK_BACK);
        });

        completeButton.setOnClickListener(v -> {
            ((RegisterActivity) requireActivity()).registerData.setVehicleRegistrationImagePath("dummy_vehicle_path.jpg");
            ((RegisterActivity) requireActivity()).completeRegister();
        });

        skipButton.setOnClickListener(v -> {
            ((RegisterActivity) requireActivity()).completeRegister();
        });

        return view;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (resultCode == AppCompatActivity.RESULT_OK && data != null && data.getData() != null) {
            Uri imageUri = data.getData();

            if (requestCode == REQUEST_PICK_FRONT) {
                frontImageUri = imageUri;
                previewImageFront.setImageURI(frontImageUri);
                previewImageFront.setVisibility(View.VISIBLE);
            } else if (requestCode == REQUEST_PICK_BACK) {
                backImageUri = imageUri;
                previewImageBack.setImageURI(backImageUri);
                previewImageBack.setVisibility(View.VISIBLE);
            }

            if (frontImageUri != null && backImageUri != null) {
                uploadBothImagesToServer(frontImageUri, backImageUri);
            } else {
                Toast.makeText(requireContext(), "Vui lòng chọn cả 2 mặt trước và sau của giấy đăng ký xe", Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(requireContext(), "Không chọn ảnh", Toast.LENGTH_SHORT).show();
        }
    }

    private void uploadBothImagesToServer(Uri frontUri, Uri backUri) {
        try {
            loadingDialog.show("Uploading vehicle registration images...");

            InputStream frontStream = requireActivity().getContentResolver().openInputStream(frontUri);
            byte[] frontBytes = new byte[frontStream.available()];
            frontStream.read(frontBytes);
            frontStream.close();

            InputStream backStream = requireActivity().getContentResolver().openInputStream(backUri);
            byte[] backBytes = new byte[backStream.available()];
            backStream.read(backBytes);
            backStream.close();

            RequestBody requestBody = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("front", "front.jpg", RequestBody.create(frontBytes, MediaType.parse("image/jpeg")))
                    .addFormDataPart("back", "back.jpg", RequestBody.create(backBytes, MediaType.parse("image/jpeg")))
                    .build();

            Request request = new Request.Builder()
                    .url("http://10.35.88.37:8080/api/vehicle-ocr/full")
                    .post(requestBody)
                    .build();

            OkHttpClient client = new OkHttpClient();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    requireActivity().runOnUiThread(() -> {
                        loadingDialog.hide();
                        Toast.makeText(requireContext(), "Upload failed", Toast.LENGTH_SHORT).show();
                        Log.e("VEHICLE_OCR_UPLOAD_ERROR", "Error uploading images: " + e.getMessage());
                    });
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    requireActivity().runOnUiThread(() -> loadingDialog.hide());

                    if (response.isSuccessful()) {
                        String json = response.body().string();
                        try {
                            JSONObject obj = new JSONObject(json);
                            requireActivity().runOnUiThread(() -> {
                                ownerInput.setText(obj.optString("owner_name"));
                                plateInput.setText(obj.optString("license_plate"));
                                modelInput.setText(obj.optString("vehicle_model"));
                                colorInput.setText(obj.optString("color"));
                                certificateTitleInput.setText(obj.optString("certificate_title"));
                                Toast.makeText(requireContext(), "Auto-filled from vehicle registration", Toast.LENGTH_SHORT).show();
                            });
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    } else {
                        String errorBody = response.body() != null ? response.body().string() : "null";
                        requireActivity().runOnUiThread(() -> {
                            Toast.makeText(requireContext(), "OCR failed", Toast.LENGTH_SHORT).show();
                            Log.e("VEHICLE_OCR_RESPONSE_ERROR", "Code: " + response.code() + " | Body: " + errorBody);
                        });
                    }
                }
            });

        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(requireContext(), "Error reading images", Toast.LENGTH_SHORT).show();
            loadingDialog.hide();
        }
    }
}