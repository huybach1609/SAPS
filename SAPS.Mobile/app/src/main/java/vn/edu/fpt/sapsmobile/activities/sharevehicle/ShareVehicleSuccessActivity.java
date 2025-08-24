package vn.edu.fpt.sapsmobile.activities.sharevehicle;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;

import vn.edu.fpt.sapsmobile.R;

public class ShareVehicleSuccessActivity extends AppCompatActivity {

    private MaterialToolbar toolbar;
    private TextView tvSuccessMessage;
    private TextView tvUserInfo;
    private TextView tvVehicleInfo;
    private Button btnDone;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_share_vehicle_success);

        initViews();
        setupToolbar();
        setupClickListeners();
        populateData();
    }

    private void initViews() {
        toolbar = findViewById(R.id.topAppBar);
        tvSuccessMessage = findViewById(R.id.tvSuccessMessage);
        tvUserInfo = findViewById(R.id.tvUserInfo);
        tvVehicleInfo = findViewById(R.id.tvVehicleInfo);
        btnDone = findViewById(R.id.btnDone);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("Success");
            getSupportActionBar().setDisplayHomeAsUpEnabled(false); // No back button

            int surface = SurfaceColors.SURFACE_0.getColor(this);
            getWindow().setStatusBarColor(surface);
            getWindow().setNavigationBarColor(surface);
        }
    }

    private void setupClickListeners() {
        btnDone.setOnClickListener(v -> {
            // Navigate back to main activity with vehicle fragment selected
            Intent intent = new Intent(this, vn.edu.fpt.sapsmobile.activities.main.MainActivity.class);
            intent.putExtra("selected_fragment", "vehicle"); // Flag to indicate vehicle fragment
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
            finish();
        });
    }

    private void populateData() {
        Intent intent = getIntent();
        if (intent != null) {
            String userName = intent.getStringExtra("user_name");
            String vehicleInfo = intent.getStringExtra("vehicle_info");

            if (userName != null) {
                tvUserInfo.setText("User: " + userName);
            }
            if (vehicleInfo != null) {
                tvVehicleInfo.setText("Vehicle: " + vehicleInfo);
            }
        }
    }
}
