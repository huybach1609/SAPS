package vn.edu.fpt.sapsmobile.fragments;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
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

public class RegisterPhase1Fragment extends Fragment {

    private static final int REQUEST_PICK_FRONT = 2001;
    private static final int REQUEST_PICK_BACK = 2002;

    private ImageView previewFront, previewBack;
    private Button btnPickFront, btnPickBack, nextButton;
    private EditText emailInput, passwordInput, confirmPasswordInput;
    private Uri frontImageUri, backImageUri;
    private LoadingDialog loadingDialog;
    private CheckBox privacyPolicyCheckbox;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_register_phase1, container, false);

        previewFront = view.findViewById(R.id.preview_image_front);
        previewBack = view.findViewById(R.id.preview_image_back);
        btnPickFront = view.findViewById(R.id.btn_pick_front);
        btnPickBack = view.findViewById(R.id.btn_pick_back);
        nextButton = view.findViewById(R.id.button_next_phase);

        // User input fields
        emailInput = view.findViewById(R.id.edit_text_email);
        passwordInput = view.findViewById(R.id.edit_text_password);
        confirmPasswordInput = view.findViewById(R.id.edit_text_confirm_password);
        privacyPolicyCheckbox = view.findViewById(R.id.check_box_privacy_policy);

        loadingDialog = new LoadingDialog(requireActivity());

        btnPickFront.setText("🖼️ Front Side");
        btnPickBack.setText("🖼️ Back Side");

        btnPickFront.setOnClickListener(v -> {
            Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(pickPhoto, REQUEST_PICK_FRONT);
        });

        btnPickBack.setOnClickListener(v -> {
            Intent pickPhoto = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            startActivityForResult(pickPhoto, REQUEST_PICK_BACK);
        });

        nextButton.setEnabled(true); // Cho phép nhấn Next ngay từ đầu

        nextButton.setOnClickListener(v -> {
            // Validate user input fields
            String email = emailInput.getText().toString().trim();
            String password = passwordInput.getText().toString();
            String confirmPassword = confirmPasswordInput.getText().toString();

            if (email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(requireContext(), "Please fill in all required fields", Toast.LENGTH_SHORT).show();
                return;
            }

            if (!password.equals(confirmPassword)) {
                Toast.makeText(requireContext(), "Passwords do not match", Toast.LENGTH_SHORT).show();
                return;
            }

            if (password.length() < 8) {
                Toast.makeText(requireContext(), "Password must be at least 8 characters", Toast.LENGTH_SHORT).show();
                return;
            }

            if (!privacyPolicyCheckbox.isChecked()) {
                Toast.makeText(requireContext(), "You must agree to the privacy policy", Toast.LENGTH_SHORT).show();
                return;
            }

            // Save user input data
            RegisterActivity activity = (RegisterActivity) requireActivity();
            activity.registerData.setEmail(email);
            activity.registerData.setPassword(password);

            if (frontImageUri == null || backImageUri == null) {
                new AlertDialog.Builder(requireContext())
                        .setTitle("Skip ID Verification?")
                        .setMessage("You haven't uploaded both front and back of your ID. Do you want to skip this step?")
                        .setPositiveButton("Yes, skip", (dialog, which) -> {
                            activity.nextPhase();
                        })
                        .setNegativeButton("Cancel", null)
                        .show();
            } else {
                activity.nextPhase();
            }
        });

        return view;
    }

    private void tryUploadIfBothSelected() {
        if (frontImageUri != null && backImageUri != null) {
            uploadBothImagesToServer(frontImageUri, backImageUri);
        }
    }

    private void uploadBothImagesToServer(Uri frontUri, Uri backUri) {
        try {
            loadingDialog.show("Uploading ID card images...");

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
                    .url("http://10.35.88.16:8080/api/ocr/full")
                    .post(requestBody)
                    .build();

            OkHttpClient client = new OkHttpClient();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    requireActivity().runOnUiThread(() -> {
                        loadingDialog.hide();
                        Toast.makeText(requireContext(), "Upload failed", Toast.LENGTH_SHORT).show();
                    });
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    requireActivity().runOnUiThread(() -> loadingDialog.hide());

                    if (response.isSuccessful()) {
                        String json = response.body().string();
                        try {
                            JSONObject obj = new JSONObject(json);
                            RegisterActivity activity = (RegisterActivity) requireActivity();
                            activity.registerData.setFullName(obj.optString("name"));
                            activity.registerData.setIdNumber(obj.optString("id_number"));
                            activity.registerData.setDateOfBirth(obj.optString("date_of_birth"));
                            activity.registerData.setSex(obj.optString("sex"));
                            activity.registerData.setNationality(obj.optString("nationality"));
                            activity.registerData.setPlaceOfOrigin(obj.optString("place_of_origin"));
                            activity.registerData.setPlaceOfResidence(obj.optString("place_of_residence"));
                            activity.registerData.setIssueDate(obj.optString("issue_date"));
                            activity.registerData.setIssuePlace(obj.optString("issue_place"));

                            requireActivity().runOnUiThread(() -> {
                                Toast.makeText(requireContext(), "Auto-filled from ID card", Toast.LENGTH_SHORT).show();
                            });

                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    } else {
                        requireActivity().runOnUiThread(() ->
                                Toast.makeText(requireContext(), "OCR failed", Toast.LENGTH_SHORT).show());
                    }
                }
            });

        } catch (IOException e) {
            e.printStackTrace();
            loadingDialog.hide();
            Toast.makeText(requireContext(), "Error reading images", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == AppCompatActivity.RESULT_OK && data != null && data.getData() != null) {
            Uri selectedUri = data.getData();

            if (requestCode == REQUEST_PICK_FRONT) {
                frontImageUri = selectedUri;
                previewFront.setVisibility(View.VISIBLE);
                previewFront.setImageURI(frontImageUri);
            } else if (requestCode == REQUEST_PICK_BACK) {
                backImageUri = selectedUri;
                previewBack.setVisibility(View.VISIBLE);
                previewBack.setImageURI(backImageUri);
            }

            tryUploadIfBothSelected();
        }
    }
}
