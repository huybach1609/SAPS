package vn.edu.fpt.sapsmobile.activities.sharevehicle;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.SharedVehicleDetails;
import vn.edu.fpt.sapsmobile.network.api.ShareVehicleApi;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.utils.DateTimeHelper;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;

public class InvitationDetailActivity extends AppCompatActivity {
    private String TAG ="InvitationDetailActivity";

    private MaterialToolbar toolbar;
    private LoadingDialog loadingDialog;
    
    // UI Elements
    private TextView tvLicensePlate, tvModel, tvColor, tvStatus;
    private TextView tvOwnerName, tvOwnerCode, tvMemberSince;
    private TextView tvAccessDuration, tvGrantedDate, tvExpires, tvLastUsed;
    private TextView tvOwnerNote;
    private Button btnAccept, btnCancel;

    private String shareVehicleId;
    private SharedVehicleDetails vehicleDetails;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_invitation_detail);

        //load intent
        shareVehicleId = getIntent().getStringExtra("shareVehicleId");
        Log.i(TAG, "onCreate: " + shareVehicleId);
        // get sharedVehicleId from invitationActivity
        initViews();
        setupToolbar();
        fetchData();

    }

    private void fetchData() {
        if (shareVehicleId == null || shareVehicleId.isEmpty()) {
            Toast.makeText(this, getString(R.string.toast_invalid_vehicle_id), Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        loadingDialog.show("Loading vehicle details...", false, null);

        ShareVehicleApi api = ApiTest.getServiceLast(this).create(ShareVehicleApi.class);
        api.getSharedVehicleDetails(shareVehicleId).enqueue(new retrofit2.Callback<SharedVehicleDetails>() {
            @Override
            public void onResponse(retrofit2.Call<SharedVehicleDetails> call, retrofit2.Response<SharedVehicleDetails> response) {
                loadingDialog.dismiss();
                if (response.isSuccessful() && response.body() != null) {
                    vehicleDetails = response.body();
                    populateUI(vehicleDetails);
                } else {
                    Toast.makeText(InvitationDetailActivity.this, getString(R.string.toast_failed_load_vehicle_details), Toast.LENGTH_SHORT).show();
                    finish();
                }
            }

            @Override
            public void onFailure(retrofit2.Call<SharedVehicleDetails> call, Throwable t) {
                loadingDialog.dismiss();
                Log.e(TAG, "Error fetching vehicle details", t);
                Toast.makeText(InvitationDetailActivity.this, getString(R.string.toast_connection_error), Toast.LENGTH_SHORT).show();
                finish();
            }
        });
    }

    private void populateUI(SharedVehicleDetails details) {
        Log.i(TAG, "populateUI: " + details);
        // Vehicle information
        tvLicensePlate.setText(getString(R.string.license_plate_label) + ": " + details.getLicensePlate());

        tvModel.setText(getString(R.string.model_label) + ": " + details.getBrand() + " " + details.getModel());

        tvColor.setText(getString(R.string.color_label) + ": " + details.getColor());
        tvStatus.setText(getString(R.string.status_label) + ": " + details.getStatus());

        // Owner information
        tvOwnerName.setText(details.getOwnerName());
        tvOwnerCode.setText("");
        tvMemberSince.setText(getString(R.string.owner_member_since) + ": " + 
            DateTimeHelper.formatDate(details.getCreatedAt()));

        if(details.getAccessDuration() != 0){
            tvAccessDuration.setText(getString(R.string.access_duration_label) + ": " +
                    details.getAccessDuration() + " days");
        }else{
            tvAccessDuration.setVisibility(TextView.GONE);
        }

        tvGrantedDate.setText(getString(R.string.access_granted_label) + ": " + 
            DateTimeHelper.formatDate(details.getInviteAt()));

        tvExpires.setText(getString(R.string.access_expires_label) + ": " + 
            DateTimeHelper.formatDate(details.getExpirationDate()));

        tvLastUsed.setText(getString(R.string.access_last_used_label) + ": " + 
            DateTimeHelper.formatDate(details.getUpdatedAt()));

        // Owner note
        if (details.getNote() != null && !details.getNote().isEmpty()) {
            tvOwnerNote.setText(details.getNote());
        } else {
            tvOwnerNote.setText("No note provided");
        }

        // Setup button click listeners
        setupButtonListeners();
    }

    private void setupButtonListeners() {
        btnAccept.setOnClickListener(v -> {
            if (vehicleDetails != null) {
                acceptShareVehicle(vehicleDetails.getId());
            }
        });

        btnCancel.setOnClickListener(v -> finish());
    }

    private void initViews() {
        loadingDialog = new LoadingDialog(this);
        toolbar = findViewById(R.id.topAppBar);
        
        // Initialize UI elements
        tvLicensePlate = findViewById(R.id.tv_license_plate);
        tvModel = findViewById(R.id.tv_model);
        tvColor = findViewById(R.id.tv_color);
        tvStatus = findViewById(R.id.tv_status);
        
        tvOwnerName = findViewById(R.id.tv_owner_name);
        tvOwnerCode = findViewById(R.id.tv_owner_code);
        tvMemberSince = findViewById(R.id.tv_member_since);
        
        tvAccessDuration = findViewById(R.id.tv_access_duration);
        tvGrantedDate = findViewById(R.id.tv_granted_date);
        tvExpires = findViewById(R.id.tv_expires);
        tvLastUsed = findViewById(R.id.tv_last_used);
        
        tvOwnerNote = findViewById(R.id.tv_owner_note);
        
        btnAccept = findViewById(R.id.btn_accept);
        btnCancel = findViewById(R.id.btn_cancel);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.invitation_activity_actionbar_title);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            int surface = SurfaceColors.SURFACE_0.getColor(this);
            getWindow().setStatusBarColor(surface);
            getWindow().setNavigationBarColor(surface);

            toolbar.setNavigationOnClickListener(v -> onBackPressed());//
        }
    }
    private void acceptShareVehicle(String shareVehicleId) {
        ShareVehicleApi api = ApiTest.getServiceLast(this).create(ShareVehicleApi.class);

        loadingDialog.show("Accepting invitation...", true, this::finish);

        api.acceptShareVehicle(shareVehicleId).enqueue(new retrofit2.Callback<Void>() {
            @Override
            public void onResponse(retrofit2.Call<Void> call, retrofit2.Response<Void> response) {
                loadingDialog.dismiss();
                if (response.isSuccessful()) {
                    Toast.makeText(InvitationDetailActivity.this, R.string.view_list_invitation_adapter_accept_200, Toast.LENGTH_SHORT).show();
                    redirectToVehicleFrament();
                } else {
                    Toast.makeText(InvitationDetailActivity.this, R.string.view_list_invitation_adapter_accept_400, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(retrofit2.Call<Void> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(InvitationDetailActivity.this, getString(R.string.toast_connection_error), Toast.LENGTH_SHORT).show();
            }
        });
    }
    private void redirectToVehicleFrament(){
        Intent intent = new Intent(this, vn.edu.fpt.sapsmobile.activities.main.MainActivity.class);
        intent.putExtra("selected_fragment", "vehicle"); // Flag to indicate vehicle fragment
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        finish();
    }

}
