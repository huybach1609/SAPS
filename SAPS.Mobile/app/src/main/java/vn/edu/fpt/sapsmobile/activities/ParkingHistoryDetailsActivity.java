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
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentStatusDataDTO;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentStatusResponseDTO;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.service.TransactionApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentDataDTO;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentResponseDTO;
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
    
    // View variables for transaction details
    private TextView tvTransactionId, tvPaymentMethod, tvPaymentStatus, tvPaymentDate, tvReferenceCode;
    
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

        if (intent != null) {
            vehicle = (Vehicle) intent.getSerializableExtra("vehicle");
            parkingSession = (ParkingSession) intent.getSerializableExtra("parkingSession");
            parkingLot = (ParkingLot) intent.getSerializableExtra("parkingLot");
        }

        // Example usage
        if (vehicle != null && parkingSession != null & parkingLot != null) {
            Log.d("ParkingDetails", "Vehicle : " + vehicle.toString());
            Log.d("ParkingDetails", "parkingLot: " + parkingLot.toString());
            Log.d("ParkingDetails", "Parking session: " + parkingSession.toString());

            initDetails();
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
        transactiondDetailLine= findViewById(R.id.transaction_details_line);
        // set it disable
        timeChangedLine.setVisibility(View.GONE);
        // Payment details views
        tvBaseRate = findViewById(R.id.tvBaseRate);
        tvTimeCharged = findViewById(R.id.tvTimeCharged);
        tvSubtotal = findViewById(R.id.tvSubtotal);
        tvTax = findViewById(R.id.tvTax);
        tvTotalAmount = findViewById(R.id.tvTotalAmount);
        
        // Transaction details views
        tvTransactionId = findViewById(R.id.tvTransactionId);
        tvPaymentMethod = findViewById(R.id.tvPaymentMethod);
        tvPaymentStatus = findViewById(R.id.tvPaymentStatus);
        tvPaymentDate = findViewById(R.id.tvPaymentDate);
        tvReferenceCode = findViewById(R.id.tvReferenceCode);
        
        // Action buttons
        btnEmailReceipt = findViewById(R.id.btnEmailReceipt);
        btnReportIssue = findViewById(R.id.btnReportIssue);
        // hide button
        btnEmailReceipt.setVisibility(View.GONE);
        btnReportIssue.setVisibility(View.GONE);
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
            
            // Transaction details
            if (parkingSession.getTransactionId() != null) {
                tvTransactionId.setText(parkingSession.getTransactionId());
            } else {
                tvTransactionId.setText("—");
            }
            
            if (parkingSession.getPaymentMethod() != null) {
                tvPaymentMethod.setText(parkingSession.getPaymentMethod());
            } else {
                tvPaymentMethod.setText("—");
            }
            
            // Payment status based on transaction ID
            if (parkingSession.getTransactionId() != null) {
                tvPaymentStatus.setText("Paid");
            } else if (parkingSession.getExitDateTime() != null) {
                tvPaymentStatus.setText("Pending");
            } else {
                tvPaymentStatus.setText("On Going");
            }
            
            // Payment date (use checkout time or exit time)
            if (parkingSession.getCheckOutTime() != null) {
                tvPaymentDate.setText(DateTimeHelper.formatDateTime(parkingSession.getCheckOutTime()));
            } else if (parkingSession.getExitDateTime() != null) {
                tvPaymentDate.setText(DateTimeHelper.formatDateTime(parkingSession.getExitDateTime()));
            } else {
                tvPaymentDate.setText("—");
            }
            
            // Reference code (using transaction ID as reference)
            if (parkingSession.getTransactionId() != null) {
                tvReferenceCode.setText(parkingSession.getTransactionId().substring(0, Math.min(8, parkingSession.getTransactionId().length())));
            } else {
                tvReferenceCode.setText("—");
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

            double taxRate= 0.0;
            // Base rate (assuming 90% of total cost)
            double baseRate = cost * (1- taxRate);
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

        // fetch transaction

         fetchTransaction() ;



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

    private void fetchTransaction() {
        // Only fetch if we have a transaction ID
        if (parkingSession == null || parkingSession.getTransactionId() == null) {
            transactiondDetailLine.setVisibility(View.GONE);
            Log.d("FetchTransaction", "No transaction ID available, skipping fetch");
            return;
        }

        TransactionApiService apiService = ApiTest.getService(this).create(TransactionApiService.class);
        retrofit2.Call<PaymentStatusResponseDTO> call = apiService.getTransactionPayOsById(parkingSession.getTransactionId());

        call.enqueue(new Callback<PaymentStatusResponseDTO>() {
            @Override
            public void onResponse(retrofit2.Call<PaymentStatusResponseDTO> call, Response<PaymentStatusResponseDTO> response) {
                if (response.isSuccessful() && response.body() != null) {
                    PaymentStatusResponseDTO paymentResponse = response.body();
                    Log.d("FetchTransaction", "Transaction fetched successfully: " + paymentResponse.getCode());
                    
                    // Update UI with fetched transaction data
                    updateTransactionDetails(paymentResponse);
                    
//                    Toast.makeText(ParkingHistoryDetailsActivity.this, "Transaction details updated", Toast.LENGTH_SHORT).show();
                } else {
                    String errorMessage = "Failed to fetch transaction details";
                    if (response.code() == 400) {
                        errorMessage = "Invalid transaction ID";
                    } else if (response.code() == 404) {
                        errorMessage = "Transaction not found";
                    } else if (response.code() == 500) {
                        errorMessage = "Server error occurred";
                    }
                    transactiondDetailLine.setVisibility(View.GONE);
//                    Toast.makeText(ParkingHistoryDetailsActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
                    Log.e("FetchTransaction", "Error code: " + response.code() + ", Message: " + response.message());
                }
            }

            @Override
            public void onFailure(retrofit2.Call<PaymentStatusResponseDTO> call, Throwable t) {

                String errorMessage = "Failed to fetch transaction";
                if (t instanceof java.net.SocketTimeoutException) {
                    errorMessage = "Request timed out. Please try again.";
                } else if (t.getMessage() != null && t.getMessage().contains("Broken pipe")) {
                    errorMessage = "Connection lost. Please check your internet and try again.";
                } else if (t instanceof java.net.ConnectException) {
                    errorMessage = "Cannot connect to server. Please check your connection.";
                }
                transactiondDetailLine.setVisibility(View.GONE);
//                Toast.makeText(ParkingHistoryDetailsActivity.this, errorMessage, Toast.LENGTH_LONG).show();
                Log.e("FetchTransaction", "Error fetching transaction: " + t.getMessage(), t);
            }
        });
    }

    private void updateTransactionDetails(PaymentStatusResponseDTO paymentResponse) {
        if (paymentResponse == null || paymentResponse.getData() == null) {
            Log.w("UpdateTransaction", "Payment response or data is null");
            return;
        }

        PaymentStatusDataDTO paymentData = paymentResponse.getData();
        NumberFormat vndFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));

        // Update transaction details
        if (paymentData.getOrderCode() != null) {
            tvTransactionId.setText(paymentData.getOrderCode());
        }

        // Update payment method based on account info
//        if (paymentData.getAccountName() != null && !paymentData.getAccountName().isEmpty()) {
//            String paymentMethod = paymentData.();
//            if (paymentData.getBin() != null && !paymentData.getBin().isEmpty()) {
//                paymentMethod += " (" + paymentData.getBin() + ")";
//            }
            tvPaymentMethod.setText("Bank");
//        }

        // Update payment status
        if (paymentData.getStatus() != null) {
            String status = paymentData.getStatus();
            // Convert status to user-friendly format
            switch (status.toLowerCase()) {
                case "paid":
                case "success":
                    tvPaymentStatus.setText("Paid");
                    break;
                case "pending":
                    tvPaymentStatus.setText("Pending");
                    break;
                case "failed":
                    tvPaymentStatus.setText("Failed");
                    break;
                case "expired":
                    tvPaymentStatus.setText("Expired");
                    break;
                default:
                    tvPaymentStatus.setText(status);
                    break;
            }
        }

        // Update payment date (use expiredAt if available, otherwise keep existing)
        if (paymentData.getStatus().equals("EXPIRED")) {
            // Convert timestamp to readable date
//            java.time.Instant instant = java.time.Instant.ofEpochMilli(paymentData.getExpiredAt());
//            java.time.LocalDateTime dateTime = java.time.LocalDateTime.ofInstant(instant, java.time.ZoneId.systemDefault());
//            String formattedDate = DateTimeHelper.formatDateTime(dateTime.toString());
            tvPaymentDate.setText(paymentData.getCreatedAt());
        }

        // Update reference code (use orderCode if available)
        if (paymentData.getOrderCode() > 0) {
            tvReferenceCode.setText(String.valueOf(paymentData.getOrderCode()));
        }

        // Update payment amount if different from session cost
        if (paymentData.getAmount() > 0) {

        }

        // Log the update
        Log.d("UpdateTransaction", "Transaction details updated successfully");
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