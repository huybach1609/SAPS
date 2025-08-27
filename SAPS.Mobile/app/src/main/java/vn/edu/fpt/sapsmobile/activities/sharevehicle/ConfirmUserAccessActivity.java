package vn.edu.fpt.sapsmobile.activities.sharevehicle;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;
import com.google.android.material.textfield.TextInputEditText;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.dtos.profile.ClientProfileSummaryDto;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.ShareInvitationRequest;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.api.ShareVehicleApi;
import vn.edu.fpt.sapsmobile.utils.DateTimeHelper;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class ConfirmUserAccessActivity extends AppCompatActivity {

    // Views
    private MaterialToolbar toolbar;
    private TextView tvUserName;
    private TextView tvUserCode;
    private TextView tvMemberSince;
    private TextView tvUserEmail;
    private TextView tvUserPhone;
    private TextView tvVehicleInfo;
    private TextInputEditText etNotes;
    private Button btnGrantAccess;
    private Button btnCancel;

    // Data
    private ClientProfileSummaryDto selectedUser;
    private Vehicle selectedVehicle;

    // service
    private LoadingDialog loadingDialog;
    private TokenManager tokenManager;
    private ShareVehicleApi shareVehicleApi;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_confirm_user_access);

        // init service
        loadingDialog = new LoadingDialog(this);
        tokenManager = new TokenManager(this);
        shareVehicleApi = ApiTest.getServiceLast(this).create(ShareVehicleApi.class);
        
        // Initialize views
        initViews();

        setupToolbar();
        // Setup click listeners
        setupClickListeners();

        // Extract data from intent
        extractIntentData();

        // Populate data
        populateUserData();
        populateVehicleData();

    }

    private void extractIntentData() {
        Intent intent = getIntent();
        if (intent != null) {
            if (intent.hasExtra("user")) {
                selectedUser = (ClientProfileSummaryDto) intent.getSerializableExtra("user");
            }
            if (intent.hasExtra("vehicle")) {
                selectedVehicle = (Vehicle) intent.getSerializableExtra("vehicle");
            }
        }
    }

    private void initViews() {
        toolbar = findViewById(R.id.topAppBar);

        tvUserName = findViewById(R.id.tvUserName);
        tvUserCode = findViewById(R.id.tvUserCode);
        tvMemberSince = findViewById(R.id.tvMemberSince);
        tvUserEmail = findViewById(R.id.tvUserEmail);
        tvUserPhone = findViewById(R.id.tvUserPhone);
        tvVehicleInfo = findViewById(R.id.tvVehicleInfo);
        etNotes = findViewById(R.id.etNotes);
        btnGrantAccess = findViewById(R.id.btnGrantAccess);
        btnCancel = findViewById(R.id.btnCancel);
    }
    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.share_vehicle_access_activity_actionbar_title);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            int surface = SurfaceColors.SURFACE_0.getColor(this);
            getWindow().setStatusBarColor(surface);
            getWindow().setNavigationBarColor(surface);

            toolbar.setNavigationOnClickListener(v -> onBackPressed());
        }
    }


    private void setupClickListeners() {
        btnGrantAccess.setOnClickListener(v -> {
            // TODO: Implement grant access functionality
            String notes = etNotes.getText() != null ? etNotes.getText().toString() : "";
            grantVehicleAccess(notes);

        });
        
        btnCancel.setOnClickListener(v -> onBackPressed());
    }

    private void populateUserData() {
        if (selectedUser != null) {
            // Set user name
            tvUserName.setText(selectedUser.getFullName() != null ? selectedUser.getFullName() : "Unknown User");
            
            // Set user code (you might need to get this from the API or generate it)
            // For now, we'll use the email or generate a code from the ID
            String userCode;
            if (selectedUser.getEmail() != null && !selectedUser.getEmail().isEmpty()) {
                // Use email prefix as user code
                String emailPrefix = selectedUser.getEmail().split("@")[0].toUpperCase();
                userCode = "USER-" + emailPrefix;
            } else if (selectedUser.getId() != null) {
                // Use ID as fallback
                userCode = "USER-" + selectedUser.getId().substring(0, Math.min(8, selectedUser.getId().length())).toUpperCase();
            } else {
                userCode = "USER-UNKNOWN";
            }
            tvUserCode.setText(userCode);
            
            // Set member since date
            if (selectedUser.getCreatedAt() != null) {
                String memberSince = "Member since " + DateTimeHelper.formatDate(selectedUser.getCreatedAt().toString());
                tvMemberSince.setText(memberSince);
            } else {
                tvMemberSince.setText("Member since Unknown");
            }
            
            // Set email
            if (selectedUser.getEmail() != null && !selectedUser.getEmail().isEmpty()) {
                tvUserEmail.setText(selectedUser.getEmail());
            } else {
                tvUserEmail.setText("No email available");
            }
            
            // Set phone number
            if (selectedUser.getPhoneNumber() != null && !selectedUser.getPhoneNumber().isEmpty()) {
                tvUserPhone.setText(selectedUser.getPhoneNumber());
            } else {
                tvUserPhone.setText("No phone available");
            }
        } else {
            // Handle case when no user data is available
            tvUserName.setText("Unknown User");
            tvUserCode.setText("USER-UNKNOWN");
            tvMemberSince.setText("Member since Unknown");
            tvUserEmail.setText("No email available");
            tvUserPhone.setText("No phone available");
        }
    }

    private void populateVehicleData() {
        if (selectedVehicle != null) {
            String vehicleInfo = selectedVehicle.getLicensePlate() + " - " + 
                               selectedVehicle.getBrand() + " " + selectedVehicle.getModel();
            if (selectedVehicle.getColor() != null && !selectedVehicle.getColor().isEmpty()) {
                vehicleInfo += " (" + selectedVehicle.getColor() + ")";
            }
            tvVehicleInfo.setText(vehicleInfo);
        } else {
            tvVehicleInfo.setText("No vehicle selected");
        }
    }

    private void grantVehicleAccess(String notes) {
        if (selectedUser == null || selectedVehicle == null) {
            Toast.makeText(this, getString(R.string.toast_missing_user_vehicle_data), Toast.LENGTH_SHORT).show();
            return;
        }

        String ownerId = tokenManager.getUserData().getId();
        String vehicleId = selectedVehicle.getId();
        String sharedPersonId = selectedUser.getId();

        // Create the request object
        ShareInvitationRequest request = new ShareInvitationRequest(vehicleId, ownerId, notes, sharedPersonId);

        // Show loading dialog
        loadingDialog.show("Granting vehicle access...", true, () -> {
            Toast.makeText(this, getString(R.string.toast_operation_cancelled), Toast.LENGTH_SHORT).show();
        });

        // Make API call
        shareVehicleApi.shareVehicle(request).enqueue(new retrofit2.Callback<Void>() {
            @Override
            public void onResponse(retrofit2.Call<Void> call, retrofit2.Response<Void> response) {
                loadingDialog.dismiss();
                
                if (response.isSuccessful()) {
                    // Success - navigate to success activity or show success message
                    Toast.makeText(ConfirmUserAccessActivity.this, 
                        "Vehicle access granted successfully!", Toast.LENGTH_LONG).show();
                    
                    // Navigate to success activity or back to previous screen
                    navigateToSuccessActivity();
                } else {
                    // Handle error response
                    String errorMessage = "Failed to grant access";
                    if (response.code() == 400) {
                        errorMessage = "Invalid request data";
                    } else if (response.code() == 403) {
                        errorMessage = "You don't have permission to share this vehicle";
                    } else if (response.code() == 404) {
                        errorMessage = "Vehicle or user not found";
                    } else if (response.code() == 409) {
                        errorMessage = "Vehicle is already shared with this user";
                    }
                    
                    Toast.makeText(ConfirmUserAccessActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(retrofit2.Call<Void> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(ConfirmUserAccessActivity.this, 
                    "Network error: " + (t.getMessage() != null ? t.getMessage() : "Connection failed"), 
                    Toast.LENGTH_LONG).show();
            }
        });
    }

    private void navigateToSuccessActivity() {
        // Navigate to success activity or back to previous screen
        // You can create a success activity or just go back
        Intent intent = new Intent(this, ShareVehicleSuccessActivity.class);
        intent.putExtra("user_name", selectedUser.getFullName());
        intent.putExtra("vehicle_info", selectedVehicle.getLicensePlate() + " - " + 
                       selectedVehicle.getBrand() + " " + selectedVehicle.getModel());
        startActivity(intent);
        finish(); // Close this activity
    }
}