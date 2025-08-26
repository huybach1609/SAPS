package vn.edu.fpt.sapsmobile.activities.checkout;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.main.MainActivity;
import vn.edu.fpt.sapsmobile.enums.PaymentStatus;
import vn.edu.fpt.sapsmobile.models.Transaction;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class PaymentResultActivity extends AppCompatActivity {

    private MaterialToolbar toolbar;
    private TextView tvTransactionId, tvAmountPaid, tvPaymentMethod, tvVehicle, tvDateTime;
    private Button btnBack, btnTryAgain;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);

        PaymentStatus status = (PaymentStatus) getIntent().getSerializableExtra("status");

        if (status == PaymentStatus.PAID) {
            setContentView(R.layout.activity_payment_success);
            setupSuccessUI();
        } else {
            setContentView(R.layout.activity_payment_fail);
            setupFailureUI(status);
        }

        setupWindowInsets();
    }

    private void setupSuccessUI() {
        initializeSuccessViews();
        setupToolbar("Payment Success");
        populateSuccessData();
        setupSuccessButtonListeners();
    }

    private void setupFailureUI(PaymentStatus status) {
        initializeFailureViews();
        setupToolbar("Payment Failed");
        setupFailureButtonListeners();
        updateFailureMessage(status);
    }

    private void initializeSuccessViews() {
        toolbar = findViewById(R.id.topAppBar);
        tvTransactionId = findViewById(R.id.tvTransactionId);
        tvAmountPaid = findViewById(R.id.tvAmountPaid);
        tvPaymentMethod = findViewById(R.id.tvPaymentMethod);
        tvVehicle = findViewById(R.id.tvVehicle);
        tvDateTime = findViewById(R.id.tvDateTime);
        btnBack = findViewById(R.id.btnBack);
    }

    private void initializeFailureViews() {
        toolbar = findViewById(R.id.topAppBar);
        btnBack = findViewById(R.id.btnBack);
        btnTryAgain = findViewById(R.id.btn_try_again);
    }

    private void setupToolbar(String title) {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(title);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        int surface = SurfaceColors.SURFACE_0.getColor(this);
        getWindow().setStatusBarColor(surface);
        getWindow().setNavigationBarColor(surface);
    }

    private void populateSuccessData() {
        // Get data from intent extras
        String transactionId = getIntent().getStringExtra("transactionId");
        String amount = getIntent().getStringExtra("amount");
        String paymentMethod = getIntent().getStringExtra("paymentMethod");
        String vehicleInfo = getIntent().getStringExtra("vehicleInfo");
        String dateTime = getIntent().getStringExtra("dateTime");

        // Set default values if data is not provided
        if (transactionId != null) {
            tvTransactionId.setText("Transaction ID: " + transactionId);
        }
        if (amount != null) {
            tvAmountPaid.setText("Amount Paid: " + amount);
        }
        if (paymentMethod != null) {
            tvPaymentMethod.setText("Payment Method: " + paymentMethod);
        }
        if (vehicleInfo != null) {
            tvVehicle.setText("Vehicle: " + vehicleInfo);
        }
        if (dateTime != null) {
            tvDateTime.setText("Date and Time: " + dateTime);
        }
    }

    private void setupSuccessButtonListeners() {
        btnBack.setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
        });
    }

    private void setupFailureButtonListeners() {
        btnBack.setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
        });

        btnTryAgain.setOnClickListener(v -> {
            Intent intent = new Intent(PaymentResultActivity.this, PaymentActivity.class);
            // Pass back the original payment data if available
            String vehicleId = getIntent().getStringExtra("vehicleId");
            String sessionId = getIntent().getStringExtra("sessionId");
            if (vehicleId != null) {
                intent.putExtra("vehicleId", vehicleId);
            }
            if (sessionId != null) {
                intent.putExtra("sessionId", sessionId);
            }
            startActivity(intent);
            finish();
        });
    }

    private void updateFailureMessage(PaymentStatus status) {
        TextView tvFailedTitle = findViewById(R.id.tv_failed_title);
        TextView tvFailedMessage = findViewById(R.id.tv_failed_message);
        TextView tvErrorDetailsMessage = findViewById(R.id.tv_error_details_message);

        if (tvFailedTitle != null && tvFailedMessage != null && tvErrorDetailsMessage != null) {
            switch (status) {
                case CANCELLED:
                    tvFailedTitle.setText("Payment Cancelled");
                    tvFailedMessage.setText("You cancelled the payment process. You can try again or return to the main menu.");
                    tvErrorDetailsMessage.setText("Payment was cancelled by the user.");
                    break;
                case EXPIRED:
                    tvFailedTitle.setText("Payment Expired");
                    tvFailedMessage.setText("The payment session has expired. Please initiate a new payment.");
                    tvErrorDetailsMessage.setText("Payment session timed out - please try again.");
                    break;
                case FAILED:
                default:
                    tvFailedTitle.setText("Payment Failed");
                    tvFailedMessage.setText("We were unable to process your payment. Please try again or contact support for assistance.");
                    tvErrorDetailsMessage.setText("Payment processing failed - please check your payment method and try again.");
                    break;
            }
        }
    }

    private void setupWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
