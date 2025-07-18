package vn.edu.fpt.sapsmobile.fragments;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
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
import androidx.core.content.FileProvider;
import androidx.fragment.app.Fragment;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
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

    private static final int REQUEST_TAKE_PHOTO = 2001;
    private static final int REQUEST_PICK_PHOTO = 2002;

    private ImageView previewImage;
    private Button btnTakePhoto, btnFromGallery, completeButton, skipButton;
    private EditText ownerInput, plateInput, modelInput, colorInput;
    private Uri imageUri;
    private File capturedImageFile;

    private LoadingDialog loadingDialog; // ✅

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_register_phase3, container, false);

        previewImage = view.findViewById(R.id.preview_vehicle_image);
        btnTakePhoto = view.findViewById(R.id.btn_take_photo_vehicle);
        btnFromGallery = view.findViewById(R.id.btn_from_gallery_vehicle);
        completeButton = view.findViewById(R.id.button_complete_registration);
        skipButton = view.findViewById(R.id.button_skip_phase);
        ownerInput = view.findViewById(R.id.input_owner_name);
        plateInput = view.findViewById(R.id.input_license_plate);
        modelInput = view.findViewById(R.id.input_vehicle_model);
        colorInput = view.findViewById(R.id.input_vehicle_color);

        loadingDialog = new LoadingDialog(requireActivity()); // ✅ Khởi tạo

        btnTakePhoto.setOnClickListener(v -> dispatchTakePictureIntent());

        btnFromGallery.setOnClickListener(v -> {
            Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(pickPhoto, REQUEST_PICK_PHOTO);
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

    private void dispatchTakePictureIntent() {
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePictureIntent.resolveActivity(requireActivity().getPackageManager()) != null) {
            try {
                capturedImageFile = File.createTempFile(
                        "vehicle_image",
                        ".jpg",
                        requireActivity().getExternalFilesDir(Environment.DIRECTORY_PICTURES)
                );
                imageUri = FileProvider.getUriForFile(requireContext(), requireContext().getPackageName() + ".fileprovider", capturedImageFile);
                takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, imageUri);
                startActivityForResult(takePictureIntent, REQUEST_TAKE_PHOTO);
            } catch (IOException e) {
                e.printStackTrace();
                Toast.makeText(requireContext(), "Failed to create image file", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void uploadImageToServer(Uri imageUri) {
        try {
            loadingDialog.show("Uploading vehicle image..."); // ✅ Hiển thị

            Bitmap bitmap = BitmapFactory.decodeStream(requireActivity().getContentResolver().openInputStream(imageUri));
            Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, 1024, 1024, true);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            resizedBitmap.compress(Bitmap.CompressFormat.JPEG, 80, baos);
            byte[] imageBytes = baos.toByteArray();

            RequestBody requestBody = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("file", "vehicle_id.jpg",
                            RequestBody.create(imageBytes, MediaType.parse("image/jpeg")))
                    .build();

            Request request = new Request.Builder()
                    .url("http://10.35.88.3:8080/api/vehicle-ocr")
                    .post(requestBody)
                    .build();

            OkHttpClient client = new OkHttpClient();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    requireActivity().runOnUiThread(() -> {
                        loadingDialog.hide(); // ✅ Ẩn dialog
                        Toast.makeText(requireContext(), "Network error during OCR", Toast.LENGTH_SHORT).show();
                    });
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    requireActivity().runOnUiThread(() -> loadingDialog.hide()); // ✅ Ẩn dialog

                    if (response.isSuccessful()) {
                        String json = response.body().string();
                        try {
                            JSONObject obj = new JSONObject(json);
                            String owner = obj.optString("owner_name");
                            String plate = obj.optString("license_plate");
                            String model = obj.optString("vehicle_model");
                            String color = obj.optString("color");

                            requireActivity().runOnUiThread(() -> {
                                ownerInput.setText(owner);
                                plateInput.setText(plate);
                                modelInput.setText(model);
                                colorInput.setText(color);
                                Toast.makeText(requireContext(), "Auto-filled from vehicle document", Toast.LENGTH_SHORT).show();
                            });

                        } catch (JSONException e) {
                            e.printStackTrace();
                            requireActivity().runOnUiThread(() ->
                                    Toast.makeText(requireContext(), "JSON Parsing Error", Toast.LENGTH_SHORT).show());
                        }

                    } else {
                        String errorBody = response.body() != null ? response.body().string() : "null";
                        Log.e("VehicleOCR", "❌ OCR Failed - HTTP " + response.code() + "\nBody:\n" + errorBody);

                        requireActivity().runOnUiThread(() ->
                                Toast.makeText(requireContext(), "OCR failed", Toast.LENGTH_SHORT).show());
                    }
                }
            });

        } catch (IOException e) {
            e.printStackTrace();
            loadingDialog.hide(); // ✅ Ẩn dialog nếu lỗi
            Toast.makeText(requireContext(), "Error reading image", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == AppCompatActivity.RESULT_OK) {
            if (requestCode == REQUEST_PICK_PHOTO && data != null && data.getData() != null) {
                imageUri = data.getData();
                previewImage.setVisibility(View.VISIBLE);
                previewImage.setImageURI(imageUri);
                uploadImageToServer(imageUri);
            } else if (requestCode == REQUEST_TAKE_PHOTO && capturedImageFile != null && capturedImageFile.exists()) {
                imageUri = Uri.fromFile(capturedImageFile);
                previewImage.setVisibility(View.VISIBLE);
                previewImage.setImageURI(imageUri);
                uploadImageToServer(imageUri);
            }
        }
    }
}
