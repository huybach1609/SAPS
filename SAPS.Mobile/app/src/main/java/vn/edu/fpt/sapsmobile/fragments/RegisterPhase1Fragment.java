package vn.edu.fpt.sapsmobile.fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
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
    private Uri frontImageUri, backImageUri;
    private LoadingDialog loadingDialog; // ✅ Thêm LoadingDialog

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_register_phase1, container, false);

        previewFront = view.findViewById(R.id.preview_image_front);
        previewBack = view.findViewById(R.id.preview_image_back);
        btnPickFront = view.findViewById(R.id.btn_pick_front);
        btnPickBack = view.findViewById(R.id.btn_pick_back);
        nextButton = view.findViewById(R.id.button_next_phase);

        loadingDialog = new LoadingDialog(requireActivity()); // ✅ An toàn, chắc chắn context đã attach


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

        nextButton.setOnClickListener(v -> {
            ((RegisterActivity) requireActivity()).nextPhase();
        });

        return view;
    }

    private void tryUploadIfBothSelected() {
        if (frontImageUri != null && backImageUri != null) {
            uploadBothImagesToServer(frontImageUri, backImageUri);
        } else {
            Toast.makeText(requireContext(), "Please select both front and back of ID card", Toast.LENGTH_SHORT).show();
        }
    }

    private void uploadBothImagesToServer(Uri frontUri, Uri backUri) {
        try {
            loadingDialog.show("Uploading ID card images..."); // ✅ Hiển thị dialog

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
                    .url("http://10.35.88.3:8080/api/ocr/full")
                    .post(requestBody)
                    .build();

            OkHttpClient client = new OkHttpClient();

            client.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    requireActivity().runOnUiThread(() -> {
                        loadingDialog.hide(); // ✅ Ẩn dialog
                        Toast.makeText(requireContext(), "Upload failed", Toast.LENGTH_SHORT).show();
                    });
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    requireActivity().runOnUiThread(() -> loadingDialog.hide()); // ✅ Ẩn dialog

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
                                nextButton.setEnabled(true);
                                Toast.makeText(requireContext(), "Auto-filled from ID card", Toast.LENGTH_SHORT).show();
                                ((RegisterActivity) requireActivity()).nextPhase();
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
            loadingDialog.hide(); // ✅ Đảm bảo dialog được ẩn nếu có lỗi
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
