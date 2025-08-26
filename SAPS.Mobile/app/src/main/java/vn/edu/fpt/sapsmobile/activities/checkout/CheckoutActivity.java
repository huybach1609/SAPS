package vn.edu.fpt.sapsmobile.activities.checkout;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import androidx.core.app.NavUtils;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.api.ParkingSessionApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.utils.DateTimeHelper;
import vn.edu.fpt.sapsmobile.utils.StringUtils;
import vn.edu.fpt.sapsmobile.dtos.payment.CheckoutRequest;
import vn.edu.fpt.sapsmobile.dtos.payment.CheckoutResponse;

public class CheckoutActivity extends AppCompatActivity {
    private static final String TAG = "CheckoutActivity";


    // UI Components
    private TextView tvVehicle, tvLocation, tvEntryTime, tvCheckOutTime, tvDuration;
    private TextView  tvTotalAmount;
    private Button btnConfirmCheckout, btnBack;
    
    // Data Models
    private Vehicle vehicle;
    private ParkingSession parkingSessionToCheckOut;
    private ParkingLot parkingLotCheckOut;
    
    // Constants
    private static final String DEFAULT_ENTRY_TIME = "N/A";
    private static final String DEFAULT_EXIT_TIME = "N/A";
    private static final String DEFAULT_DURATION = "N/A";
    private static final String DEFAULT_LOCATION = "N/A";
    private static final String DEFAULT_VEHICLE_INFO = "N/A";
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            NavUtils.navigateUpFromSameTask(this);
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_checkout);

        initializeViews();
        setupActionBar();
        handleIntentData();
        setupButtonListeners();
        setupWindowInsets();
    }
    

    private void initializeViews() {
        tvVehicle = findViewById(R.id.tvVehicle);
        tvLocation = findViewById(R.id.tvLocation);
        tvEntryTime = findViewById(R.id.tvEntryTime);
        tvCheckOutTime = findViewById(R.id.tvCheckOutTime);
        tvDuration = findViewById(R.id.tvDuration);

        tvTotalAmount = findViewById(R.id.tvTotalAmount);

        btnConfirmCheckout = findViewById(R.id.btnConfirmCheckout);
        btnBack = findViewById(R.id.btnBack);
    }
    

    private void setupActionBar() {

        MaterialToolbar toolbar = findViewById(R.id.topAppBar);
        setSupportActionBar(toolbar);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.checkout_activity_actionbar_title);
             getSupportActionBar().setDisplayHomeAsUpEnabled(true); // if you need the back arrow
        }

        int surface = SurfaceColors.SURFACE_0.getColor(this);
        getWindow().setStatusBarColor(surface);
        getWindow().setNavigationBarColor(surface);

    }
    

    private void handleIntentData() {
        try {
            // Extract vehicle from intent
            vehicle = (Vehicle) getIntent().getSerializableExtra("vehicle");
            parkingSessionToCheckOut= (ParkingSession) getIntent().getSerializableExtra("parkingSession");
            parkingLotCheckOut = (ParkingLot) getIntent().getSerializableExtra("parkingLot");

            if (vehicle == null) {
                Log.w(TAG, "Vehicle data is null");
                showErrorAndFinish("Vehicle information is missing");
                return;
            }

            Log.d(TAG, "Vehicle loaded: " + vehicle.toString());
            Log.d(TAG, "ParkingSession loaded: " + parkingSessionToCheckOut.toString());
            Log.d(TAG, "ParkingLot loaded: " + (parkingLotCheckOut != null ? parkingLotCheckOut.toString() : "null"));

            // Load parking session data
            loadParkingSessionData();
            
        } catch (Exception e) {
            Log.e(TAG, "Error handling intent data", e);
            showErrorAndFinish("Error loading checkout data");
        }
    }
    
    /**
     * Load parking session data from API
     */
    private void loadParkingSessionData() {
        if (vehicle == null || vehicle.getId() == null) {
            Log.e(TAG, "Vehicle or vehicle ID is null");
            showErrorAndFinish("Invalid vehicle information");
            return;
        }
        if(parkingSessionToCheckOut != null){
            Log.i(TAG, "loadParkingSessionData: " + parkingSessionToCheckOut.toString());
            updateSessionInfo();
            loadParkingLotData();
            return;
        }
        
        ParkingSessionApiService parkingSessionApi = ApiTest.getService(this).create(ParkingSessionApiService.class);
        
        parkingSessionApi.getParkingSessionToCheckOut(vehicle.getId()).enqueue(new Callback<ParkingSession>() {
            @Override
            public void onResponse(Call<ParkingSession> call, Response<ParkingSession> response) {
                if (response.isSuccessful() && response.body() != null) {
                    parkingSessionToCheckOut = response.body();
                    Log.d(TAG, "Parking session loaded successfully");
                    
                    // Update UI with session data
                    updateSessionInfo();
                    
                    // Load parking lot data
                    loadParkingLotData();
                    
                } else {
                    Log.e(TAG, "Failed to load parking session: " + response.code());
                    showErrorAndFinish("Failed to load parking session");
                }
            }

            @Override
            public void onFailure(Call<ParkingSession> call, Throwable t) {
                Log.e(TAG, "Error loading parking session", t);
                showErrorAndFinish("Network error while loading parking session");
            }
        });
    }
    
    /**
     * Load parking lot data from API
     */
    private void loadParkingLotData() {
        if (parkingSessionToCheckOut == null ) {
            Log.e(TAG, "Parking session or parking lot ID is null");
            updateLocationInfo(DEFAULT_LOCATION);
            return;
        }

        if(parkingLotCheckOut != null) {
            Log.i(TAG, "loadParkingLotData: " + parkingLotCheckOut.toString());
            String location = parkingLotCheckOut.getName();
            updateLocationInfo(location);
            return;
        }
    }

    private void updateSessionInfo() {
        if (parkingSessionToCheckOut == null) {
            Log.w(TAG, "Parking session is null");
            return;
        }
        
        // Update vehicle information
        updateVehicleInfo();
        
        // Update time information
        updateTimeInfo();
        
        // Update payment information
        updatePaymentInfo();
    }

    private void updateVehicleInfo() {
        if (vehicle == null) {
            tvVehicle.setText(DEFAULT_VEHICLE_INFO);
            return;
        }
        
        String licensePlate = vehicle.getLicensePlate() != null ? vehicle.getLicensePlate() : "";
        String brand = vehicle.getBrand() != null ? vehicle.getBrand() : "";
        String model = vehicle.getModel() != null ? vehicle.getModel() : "";
        
        String vehicleInfo = String.format("Vehicle: %s (%s %s)", 
            licensePlate, brand, model).trim();
        
        tvVehicle.setText(vehicleInfo.isEmpty() ? DEFAULT_VEHICLE_INFO : vehicleInfo);
    }
    
    /**
     * Update time information in UI
     */
    private void updateTimeInfo() {
        if (parkingSessionToCheckOut == null) {
            Log.i(TAG, "updateTimeInfo: " + parkingSessionToCheckOut.toString());
            tvEntryTime.setText("Entry Time: " + DEFAULT_ENTRY_TIME);
            tvCheckOutTime.setText("Exit Time: " + DEFAULT_EXIT_TIME);
            tvDuration.setText("Duration: " + DEFAULT_DURATION);
            return;
        }
        
        // Entry time
        String entryTime = parkingSessionToCheckOut.getEntryDateTime();
        if (entryTime != null && !entryTime.isEmpty()) {
            tvEntryTime.setText( DateTimeHelper.formatDateTime(entryTime));
        } else {
            tvEntryTime.setText( DEFAULT_ENTRY_TIME);
        }
        
        // Exit time
//        LocalDate today = LocalDate.now();
        String exitTime = LocalDateTime.now().toString();
        Log.i(TAG, "updateTimeInfo: " +exitTime);
        if (exitTime != null && !exitTime.isEmpty()) {
            tvCheckOutTime.setText(DateTimeHelper.formatDateTime(exitTime));
        } else {
            // Use current time as exit time for ongoing sessions
            String currentTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
            tvCheckOutTime.setText( DateTimeHelper.formatDateTime(currentTime));
        }
        
        // Duration

//        String duration = calculateDuration(entryTime, exitTime);
        tvDuration.setText(DateTimeHelper.calculateDuration(entryTime,exitTime));
    }
    

    private void updateLocationInfo(String location) {
        tvLocation.setText(location);
    }
    

    private void updatePaymentInfo() {
        if (parkingSessionToCheckOut == null) {
            setDefaultPaymentInfo();
            return;
        }
        
        tvTotalAmount.setText(StringUtils.formatVNDLocale(parkingSessionToCheckOut.getCost()));

    }

    private void setDefaultPaymentInfo() {
        tvTotalAmount.setText("Total: ₫0");
    }

    private void setupButtonListeners() {
        btnBack.setOnClickListener(v -> getOnBackPressedDispatcher().onBackPressed());
        btnConfirmCheckout.setOnClickListener(v -> fetchTransactionDetails());
    }

    private void fetchTransactionDetails(){
        if (parkingSessionToCheckOut == null) {
            Toast.makeText(this, R.string.activity_check_out_not_available, Toast.LENGTH_SHORT).show();
            return;
        }
        ParkingSessionApiService api = ApiTest.getServiceLast(this).create(ParkingSessionApiService.class);
        CheckoutRequest request = new CheckoutRequest(parkingSessionToCheckOut.getId(), "Bank");
        api.checkout(request).enqueue(new Callback<CheckoutResponse>() {
            @Override
            public void onResponse(Call<CheckoutResponse> call, Response<CheckoutResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // Handle successful response (199-299 status codes)
                    CheckoutResponse body = response.body();
                    String message = body.getMessage();

                    if (message != null && message.equals("PARKING_SESSION_CHECKOUT_UPDATED_SUCCESSFULLY")) {
                        Toast.makeText(CheckoutActivity.this, "Checkout successful", Toast.LENGTH_SHORT).show();
                        navigateToPayment();
                        return;
                    }
                    Toast.makeText(CheckoutActivity.this, "Checkout failed", Toast.LENGTH_SHORT).show();

                } else if (response.code() == 400) {
                    try {
                        if (response.errorBody() != null) {
                            String errorJson = response.errorBody().string();
                            // Parse the error JSON manually or use Gson
                            if (errorJson.contains("PARKING_SESSION_ALREADY_CHECKED_OUT")) {
                                Toast.makeText(CheckoutActivity.this, "Session already checked out", Toast.LENGTH_SHORT).show();
                                navigateToPayment();
                                return;
                            }
                        }
                        Toast.makeText(CheckoutActivity.this, "Invalid checkout request", Toast.LENGTH_SHORT).show();
                    } catch (IOException e) {
                        Log.e(TAG, "Error reading error response", e);
                        Toast.makeText(CheckoutActivity.this, "Checkout failed", Toast.LENGTH_SHORT).show();
                    }

                } else {
                    // Handle other error status codes
                    Toast.makeText(CheckoutActivity.this, "Checkout failed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<CheckoutResponse> call, Throwable t) {
                Log.e(TAG, "Checkout API error", t);
                Toast.makeText(CheckoutActivity.this, "Network error during checkout", Toast.LENGTH_SHORT).show();
            }
        });


    }

    private void navigateToPayment() {
        if (parkingSessionToCheckOut == null) return;
        Intent intent = new Intent(this, PaymentActivity.class);
        intent.putExtra("vehicleId", parkingSessionToCheckOut.getVehicleId());
        intent.putExtra("sessionId", parkingSessionToCheckOut.getId());
        startActivity(intent);
        finish();
    }

    private void setupWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
    

    private void showErrorAndFinish(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
        finish();
    }
}