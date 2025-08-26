package vn.edu.fpt.sapsmobile.fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.util.Patterns;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.network.api.AuthApi;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.auth.LoginActivity;
import vn.edu.fpt.sapsmobile.activities.auth.RegisterActivity;
import vn.edu.fpt.sapsmobile.dtos.profile.UserRegisterResponse;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;

public class RegisterFragment extends Fragment {

    private static final String TAG = "RegisterFragment";
    
    private Button btnRegister ;
    private ImageButton btnBack;
    private EditText emailInput, passwordInput, confirmPasswordInput, fullNameInput, phoneInput;
    private Uri frontImageUri, backImageUri;
    private LoadingDialog loadingDialog;
    private AuthApi authApi;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_register, container, false);


        btnRegister = view.findViewById(R.id.button_next_phase);
        btnBack = view.findViewById(R.id.back_button);

        // User input fields
        emailInput = view.findViewById(R.id.edit_text_email);
        fullNameInput = view.findViewById(R.id.edit_text_full_name);
        phoneInput = view.findViewById(R.id.edit_text_phone);
        passwordInput = view.findViewById(R.id.edit_text_password);
        confirmPasswordInput = view.findViewById(R.id.edit_text_confirm_password);

        loadingDialog = new LoadingDialog(requireActivity());
        
        // Initialize API service
        authApi = ApiTest.getServiceLast(requireActivity()).create(AuthApi.class);

        btnRegister.setOnClickListener(v -> {
            // Validate user input fields
            String email = emailInput.getText().toString().trim();
            String fullName = fullNameInput.getText().toString().trim();
            String phone = phoneInput.getText().toString().trim();
            String password = passwordInput.getText().toString();
            String confirmPassword = confirmPasswordInput.getText().toString();

            if (email.isEmpty() || fullName.isEmpty() || phone.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(requireContext(), "Please fill in all required fields", Toast.LENGTH_SHORT).show();
                return;
            }

            // Validate email format
            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                Toast.makeText(requireContext(), "Please enter a valid email address", Toast.LENGTH_SHORT).show();
                return;
            }

            // Validate phone number format (basic validation for Vietnamese phone numbers)
            if (!phone.matches("^(0|\\+84)[0-9]{9,10}$")) {
                Toast.makeText(requireContext(), "Please enter a valid phone number", Toast.LENGTH_SHORT).show();
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

            // Proceed with registration
            registerUser(email, password, fullName, phone);
        });
        btnBack.setOnClickListener(v-> {
            getActivity().finish();
        });

        return view;
    }

    private void registerUser(String email, String password, String fullName, String phone) {
        // Save data to RegisterData for multi-phase flow
        RegisterActivity activity = (RegisterActivity) requireActivity();
        activity.registerData.setEmail(email);
        activity.registerData.setPassword(password);
        activity.registerData.setFullName(fullName);
        activity.registerData.setPhone(phone);
        
        loadingDialog.show("Registering user...");
        
        // Create RequestBody objects for multipart form data
        RequestBody emailBody = RequestBody.create(email, MediaType.parse("text/plain"));
        RequestBody passwordBody = RequestBody.create(password, MediaType.parse("text/plain"));
        RequestBody fullNameBody = RequestBody.create(fullName, MediaType.parse("text/plain"));
        RequestBody phoneBody = RequestBody.create(phone, MediaType.parse("text/plain"));
        
        // Debug logging
        Log.d(TAG, "Sending registration request:");
        Log.d(TAG, "Email: " + email);
        Log.d(TAG, "FullName: " + fullName);
        Log.d(TAG, "Phone: " + phone);
        Log.d(TAG, "Password: " + (password != null ? "***" : "null"));
        
        Call<UserRegisterResponse> call = authApi.registerUser(emailBody, passwordBody, fullNameBody, phoneBody);
        call.enqueue(new Callback<UserRegisterResponse>() {
            @Override
            public void onResponse(Call<UserRegisterResponse> call, Response<UserRegisterResponse> response) {
                loadingDialog.dismiss();
                
                // Debug logging for response
                Log.d(TAG, "Response code: " + response.code());
                if (!response.isSuccessful()) {
                    try {
                        String errorBody = response.errorBody() != null ? response.errorBody().string() : "No error body";
                        Log.e(TAG, "Error response body: " + errorBody);
                    } catch (Exception e) {
                        Log.e(TAG, "Error reading error body", e);
                    }
                }
                
                if (response.isSuccessful() && response.body() != null) {
                    UserRegisterResponse registerResponse = response.body();
                    handleRegistrationSuccess(email, password, registerResponse);
                } else {
                    handleRegistrationError(response.code(), "Registration failed");
                }
            }

            @Override
            public void onFailure(Call<UserRegisterResponse> call, Throwable t) {
                loadingDialog.dismiss();
                Log.e(TAG, "Registration network error", t);
                Toast.makeText(requireContext(), "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void handleRegistrationSuccess(String email, String password, UserRegisterResponse response) {
        String message = response.getMessage() != null ? response.getMessage() : "Registration successful!";
        Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show();
        
        // Navigate to LoginActivity with pre-filled credentials
        navigateToLoginWithCredentials(email, password);
    }

    private void handleRegistrationError(int statusCode, String defaultMessage) {
        String errorMessage = getErrorMessage(statusCode, defaultMessage);
        Toast.makeText(requireContext(), errorMessage, Toast.LENGTH_LONG).show();
    }

    private String getErrorMessage(int statusCode, String defaultMessage) {
        switch (statusCode) {
            case 400:
                return "Bad request. Please check your input data.";
            case 409:
                return "Email already exists. Please use a different email address.";
            case 422:
                return "Invalid data provided. Please check your email, phone number, and other fields.";
            case 500:
                return "Server error. Please try again later.";
            default:
                return defaultMessage;
        }
    }

    private void navigateToLoginWithCredentials(String email, String password) {
        Intent intent = new Intent(requireActivity(), LoginActivity.class);
        intent.putExtra("prefilled_email", email);
        intent.putExtra("prefilled_password", password);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        requireActivity().finish();
    }

}
