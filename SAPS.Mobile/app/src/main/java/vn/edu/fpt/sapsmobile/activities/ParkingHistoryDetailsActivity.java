package vn.edu.fpt.sapsmobile.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.button.MaterialButton;

import java.text.NumberFormat;
import java.util.Locale;

import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.ParkingSessionDetailsResponse;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.service.ParkingSessionApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.utils.DateTimeHelper;
import vn.edu.fpt.sapsmobile.utils.StringUtils;

public class ParkingHistoryDetailsActivity extends AppCompatActivity {

    private Vehicle vehicle;
    private ParkingSession parkingSession;
    private ParkingLot parkingLot;
    
    // View variables for session details
    private TextView tvEntryDate, tvEntryTime, tvExitDate, tvExitTime;
    private TextView tvLocation, tvVehicleModel, tvVehicle;
    private TextView tvDuration;
    
    // View variables for payment details
    private TextView tvBaseRate, tvTimeCharged, tvSubtotal, tvTax, tvTotalAmount;
    

    
    // View variables for action buttons
    private MaterialButton btnEmailReceipt, btnReportIssue;
    private LinearLayout timeChangedLine, transactiondDetailLine;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_parking_history_details);

        // Initialize views
        initViews();

        // Get data from Intent
        Intent intent = getIntent();

        String sessionId = "";
        if (intent != null) {
            sessionId = intent.getStringExtra("sessionId");
        }
        
        // Fetch parking session details
        if (sessionId != null && !sessionId.isEmpty()) {
            fetchParkingSessionDetails(sessionId);
        } else {
            Log.e("ParkingDetails", "Session ID is null or empty");
            // Handle error - could show a toast or finish activity
        }

        // action bar
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setTitle(R.string.session_details_title);
            actionBar.setSubtitle(R.string.session_details_subheading);
            actionBar.setDisplayHomeAsUpEnabled(true); // Show back arrow
        }

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

    }

    private void initViews() {
        // Session details views
        tvEntryDate = findViewById(R.id.tvEntryDate);
        tvEntryTime = findViewById(R.id.tvEntryTime);
        tvExitDate = findViewById(R.id.tvExitDate);
        tvExitTime = findViewById(R.id.tvCheckOutTime);
        tvLocation = findViewById(R.id.tvLocation);
        tvVehicleModel = findViewById(R.id.tvVehicleModel);
        tvVehicle = findViewById(R.id.tvVehicle);
        tvDuration = findViewById(R.id.tvDuration);

        timeChangedLine = findViewById(R.id.time_charged_line);
        transactiondDetailLine = findViewById(R.id.transaction_details_line);
        // set it disable
        timeChangedLine.setVisibility(View.GONE);
        // Payment details views
        tvBaseRate = findViewById(R.id.tvBaseRate);
        tvTimeCharged = findViewById(R.id.tvTimeCharged);
        tvSubtotal = findViewById(R.id.tvSubtotal);
        tvTax = findViewById(R.id.tvTax);
        tvTotalAmount = findViewById(R.id.tvTotalAmount);
        

        
        // Action buttons
        btnEmailReceipt = findViewById(R.id.btnEmailReceipt);
        btnReportIssue = findViewById(R.id.btnReportIssue);
        // hide button
        btnEmailReceipt.setVisibility(View.GONE);
        btnReportIssue.setVisibility(View.GONE);
    }

    private void fetchParkingSessionDetails(String sessionId) {
        ParkingSessionApiService apiService = ApiTest.getServiceLast(this).create(ParkingSessionApiService.class);
        retrofit2.Call<ParkingSessionDetailsResponse> call = apiService.getParkingSessionDetails(sessionId);

        call.enqueue(new Callback<ParkingSessionDetailsResponse>() {
            @Override
            public void onResponse(retrofit2.Call<ParkingSessionDetailsResponse> call, Response<ParkingSessionDetailsResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ParkingSessionDetailsResponse sessionDetails = response.body();
                    Log.d("ParkingDetails", "Session details fetched successfully");
                    
                    // Convert response to models and populate UI
                    populateDataFromResponse(sessionDetails);
                    
                } else {
                    String errorMessage = "Failed to fetch session details";
                    if (response.code() == 400) {
                        errorMessage = "Invalid session ID";
                    } else if (response.code() == 404) {
                        errorMessage = "Session not found";
                    } else if (response.code() == 500) {
                        errorMessage = "Server error occurred";
                    }
                    Log.e("ParkingDetails", "Error code: " + response.code() + ", Message: " + response.message());
                    // Could show a toast or error dialog here
                }
            }

            @Override
            public void onFailure(retrofit2.Call<ParkingSessionDetailsResponse> call, Throwable t) {
                String errorMessage = "Failed to fetch session details";
                if (t instanceof java.net.SocketTimeoutException) {
                    errorMessage = "Request timed out. Please try again.";
                } else if (t.getMessage() != null && t.getMessage().contains("Broken pipe")) {
                    errorMessage = "Connection lost. Please check your internet and try again.";
                } else if (t instanceof java.net.ConnectException) {
                    errorMessage = "Cannot connect to server. Please check your connection.";
                }
                Log.e("ParkingDetails", "Error fetching session details: " + t.getMessage(), t);
                // Could show a toast or error dialog here
            }
        });
    }

    private void populateDataFromResponse(ParkingSessionDetailsResponse sessionDetails) {
        // Get the actual data from the response
        ParkingSessionDetailsResponse.ParkingSessionData data = sessionDetails.getData();
        if (data == null) {
            Log.e("ParkingDetails", "Response data is null");
            return;
        }
        
        // Create ParkingSession model
        parkingSession = new ParkingSession();
        parkingSession.setId(data.getId());
        parkingSession.setEntryDateTime(data.getEntryDateTime());
        parkingSession.setExitDateTime(data.getExitDateTime());
        parkingSession.setCost(data.getCost());
        parkingSession.setParkingLotName(data.getParkingLotName());
        
        // Create Vehicle model
        vehicle = new Vehicle();
        vehicle.setLicensePlate(data.getLicensePlate());
        
        // Create ParkingLot model
        parkingLot = new ParkingLot();
        if (data.getParkingLot() != null) {
            parkingLot.setId(data.getParkingLot().getId());
            parkingLot.setName(data.getParkingLot().getName());
            parkingLot.setAddress(data.getParkingLot().getAddress());
        }
        
        // Initialize UI with the data
        initDetails();
    }

    private void initDetails() {
        // Format currency for Vietnamese Dong
        NumberFormat vndFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        
        // Populate session details
        if (parkingSession != null) {
            // Entry date and time
            if (parkingSession.getEntryDateTime() != null) {
                String entryDateTime = DateTimeHelper.formatDateTime(parkingSession.getEntryDateTime());
                String[] entryParts = entryDateTime.split(" ngày ");
                if (entryParts.length == 2) {
                    tvEntryTime.setText(entryParts[0]); // Time part
                    tvEntryDate.setText(entryParts[1]); // Date part
                } else {
                    tvEntryTime.setText(entryDateTime);
                    tvEntryDate.setText("");
                }
            }
            
            // Exit date and time
            if (parkingSession.getExitDateTime() != null) {
                String exitDateTime = DateTimeHelper.formatDateTime(parkingSession.getExitDateTime());
                String[] exitParts = exitDateTime.split(" ngày ");
                if (exitParts.length == 2) {
                    tvExitTime.setText(exitParts[0]); // Time part
                    tvExitDate.setText(exitParts[1]); // Date part
                } else {
                    tvExitTime.setText(exitDateTime);
                    tvExitDate.setText("");
                }
            } else {
                tvExitTime.setText("—");
                tvExitDate.setText("—");
            }
            
            // Duration
            if (parkingSession.getEntryDateTime() != null) {
                String duration;
                if (parkingSession.getExitDateTime() != null) {
                    duration = DateTimeHelper.calculateDuration(parkingSession.getEntryDateTime(), parkingSession.getExitDateTime());
                } else {
                    // Calculate duration from entry to current time
                    duration = DateTimeHelper.calculateDuration(parkingSession.getEntryDateTime(), java.time.LocalDateTime.now().toString());
                }
                tvDuration.setText(duration);
            }
            

        }
        
        // Populate vehicle details
        if (vehicle != null) {
            // Vehicle model (brand + model)
            String vehicleModel = "";
            if (vehicle.getBrand() != null) {
                vehicleModel += vehicle.getBrand();
            }
            if (vehicle.getModel() != null && !vehicle.getModel().isEmpty()) {
                vehicleModel += " " + vehicle.getModel();
            }
            tvVehicleModel.setText(vehicleModel.trim());
            
            // Vehicle plate
            if (vehicle.getLicensePlate() != null) {
                tvVehicle.setText(vehicle.getLicensePlate());
            } else {
                tvVehicle.setText("—");
            }
        }
        
        // Populate parking lot details
        if (parkingLot != null) {
            // Location (parking lot name + address)
            String location = "";
            if (parkingLot.getName() != null) {
                location += parkingLot.getName();
            }
            if (parkingLot.getAddress() != null && !parkingLot.getAddress().isEmpty()) {
                location += " - " + parkingLot.getAddress();
            }
            tvLocation.setText(location.trim());
        }
        
        // Populate payment details
        if (parkingSession != null) {
            double cost = parkingSession.getCost();

            double taxRate = 0.0;
            // Base rate (assuming 90% of total cost)
            double baseRate = cost * (1 - taxRate);
            tvBaseRate.setText(vndFormat.format(baseRate));

            // Time charged (assuming 1 hour = 10,000 VND)
            double timeCharged = cost / 10000.0;
            tvTimeCharged.setText(String.format("%.1f hours", timeCharged));
            
            // Subtotal (same as base rate)
            tvSubtotal.setText(vndFormat.format(baseRate));
            
            // Tax (10% of base rate)
            double tax = baseRate * taxRate;
            tvTax.setText(vndFormat.format(tax));
            
            // Total amount
            tvTotalAmount.setText(vndFormat.format(cost));
        }



        // Set up button click listeners
        btnEmailReceipt.setOnClickListener(v -> {
            // TODO: Implement email receipt functionality
            Log.d("ParkingDetails", "Email receipt button clicked");
        });
        
        btnReportIssue.setOnClickListener(v -> {
            // TODO: Implement report issue functionality
            Log.d("ParkingDetails", "Report issue button clicked");
        });
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