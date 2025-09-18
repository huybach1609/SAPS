package vn.edu.fpt.sapsmobile.activities.checkout;


import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.journeyapps.barcodescanner.BarcodeEncoder;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentApiResponseDTO;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentCancelRequestDTO;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentStatusResponseDTO;
import vn.edu.fpt.sapsmobile.enums.PaymentStatus;
import vn.edu.fpt.sapsmobile.network.client.ApiClient;
import vn.edu.fpt.sapsmobile.network.api.TransactionApiService;
import vn.edu.fpt.sapsmobile.network.api.IParkingSessionApiService;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentResponseDTO;
import vn.edu.fpt.sapsmobile.dtos.payment.PaymentDataDTO;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.utils.StringUtils;

public class PaymentActivity extends AppCompatActivity {
    private static String TAG = "PaymentActivity";

    ImageView imgQrCode;
    Button btnIHavePaid, btnBrowser, btnCancel, btnSaveQr;
    TextView tvAccountNumber, tvAccountName, tvReferenceCode, tvAmount;
    ImageView btnCopyAccount, btnCopyName, btnCopyRef;
    String vehicleID, sessionID;
    PaymentResponseDTO payment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_payment);

        initializeViews();
        setupActionBar();
        handleIntentData();
        loadRequireData();
        setupButtonListeners();
        setupWindowInsets();

    }


    //region setup view , toolbar , btn listener
    private void initializeViews() {
        btnIHavePaid = findViewById(R.id.btnIHavePaid);
        imgQrCode = findViewById(R.id.imgQrCode);
        tvAccountName = findViewById(R.id.tvAccountName);
        tvAccountNumber = findViewById(R.id.tvAccountNumber);
        tvReferenceCode = findViewById(R.id.tvReferenceCode);
        tvAmount = findViewById(R.id.tvAmount);
        btnBrowser = findViewById(R.id.btnBrowse);
        btnCancel =findViewById(R.id.btnCancel);
        btnSaveQr = findViewById(R.id.btnSaveQr);
        if (btnSaveQr != null) btnSaveQr.setEnabled(false);
        
        // Initialize copy buttons
        btnCopyAccount = findViewById(R.id.btnCopyAccount);
        btnCopyName = findViewById(R.id.btnCopyName);
        btnCopyRef = findViewById(R.id.btnCopyRef);
    }

    private void setupWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

    }
    private void setupCheckStatus(String orderCode) {
        if (orderCode == null || orderCode.isEmpty()) return;
        btnIHavePaid.setEnabled(true);
        btnIHavePaid.setOnClickListener(v -> fetchCheckStatus(orderCode));
    }

    private void setupButtonListeners() {
        btnIHavePaid.setEnabled(false);
        
        // Setup copy button listeners
        setupCopyButtonListeners();

        // Cancel payment
        btnCancel.setOnClickListener(v -> performCancelPayment());

        // Save QR image
        btnSaveQr.setOnClickListener(v -> saveQrToGallery());
    }

    private void setupCopyButtonListeners() {
        // Copy account number
        btnCopyAccount.setOnClickListener(v -> {
            String accountNumber = tvAccountNumber.getText().toString();
            copyToClipboard("Account Number", accountNumber);
        });
        
        // Copy account name
        btnCopyName.setOnClickListener(v -> {
            String accountName = tvAccountName.getText().toString();
            copyToClipboard("Account Name", accountName);
        });
        
        // Copy reference code
        btnCopyRef.setOnClickListener(v -> {
            String referenceCode = tvReferenceCode.getText().toString();
            copyToClipboard("Reference Code", referenceCode);
        });
    }

    private void copyToClipboard(String label, String text) {
        if (text == null || text.isEmpty()) {
            Toast.makeText(this, "No text to copy", Toast.LENGTH_SHORT).show();
            return;
        }
        
        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = ClipData.newPlainText(label, text);
        clipboard.setPrimaryClip(clip);
        
        Toast.makeText(this, label + " copied to clipboard", Toast.LENGTH_SHORT).show();
    }


    private void setupActionBar() {
        MaterialToolbar toolbar = findViewById(R.id.topAppBar);
        setSupportActionBar(toolbar);

        if (getSupportActionBar() != null) {
//            getSupportActionBar().setTitle(R.string.checkout_activity_actionbar_title);
            getSupportActionBar().setTitle(R.string.payment_activity_actionbar_title);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true); // if you need the back arrow
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        int surface = SurfaceColors.SURFACE_0.getColor(this);
        getWindow().setStatusBarColor(surface);
        getWindow().setNavigationBarColor(surface);

    }
    //endregion


    // region load data from intent
    private void handleIntentData() {
        vehicleID = getIntent().getStringExtra("vehicleId");
        sessionID = getIntent().getStringExtra("sessionID");
        if (sessionID == null || sessionID.isEmpty()) {
            sessionID = getIntent().getStringExtra("sessionId");
        }
    }

    private void loadRequireData() {
        if (sessionID == null || sessionID.isEmpty()) return;

        IParkingSessionApiService api = ApiClient.getServiceLast(this).create(IParkingSessionApiService.class);
        api.getPaymentInfo(sessionID).enqueue(new Callback<PaymentApiResponseDTO>() {
            @Override
            public void onResponse(Call<PaymentApiResponseDTO> call, Response<PaymentApiResponseDTO> response) {
                if (!response.isSuccessful() || response.body() == null) return;

                PaymentApiResponseDTO apiResponse = response.body();
                PaymentResponseDTO paymentResponse = apiResponse.getData(); // Get the inner "data" object

                if (paymentResponse == null) {
                    Log.e(TAG, "PaymentResponseDTO is null");
                    return;
                }

                PaymentDataDTO data = paymentResponse.getData(); // Get the payment details
                Log.i(TAG, "onResponse: " + (data != null ? data.toString() : "PaymentDataDTO is null"));

                if (data == null) return;

                payment = paymentResponse;
                //update payment data
                updatePaymentData();

            }

            @Override
            public void onFailure(Call<PaymentApiResponseDTO> call, Throwable t) {
                Log.e(TAG, "API call failed: " + t.getMessage());
            }
        });
    }

    private void updatePaymentData() {
        tvAmount.setText(StringUtils.formatVNDLocale(payment.getData().getAmount()));
        tvAccountName.setText(payment.getData().getAccountName());
        tvAccountNumber.setText(payment.getData().getAccountNumber());
        tvReferenceCode.setText(payment.getData().getDescription());


        if (payment.getData().getQrCode() != null && !payment.getData().getQrCode().isEmpty()) {
            renderQrFromPayload(payment.getData().getQrCode());
        }
//        setupCheckStatus(payment.getData().getOrderCode() + "");
        setupCheckStatus(sessionID);

        if (payment.getData().getCheckoutUrl() != null) {
            Log.i(TAG, "updatePaymentData: " + payment.getData().getCheckoutUrl());
            btnBrowser.setOnClickListener(v -> {
                String url = payment.getData().getCheckoutUrl();
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(intent);
            });
        } else {
            btnBrowser.setVisibility(View.GONE);
        }
    }


    //endregion
    private void renderQrFromPayload(String payload) {
        if (payload == null || payload.isEmpty()) {
            Log.e(TAG, "QR payload is null or empty");
            return;
        }
        if (imgQrCode == null) {
            Log.e(TAG, "ImageView imgQrCode is null");
            return;
        }
        Log.d(TAG, "Generating QR code for payload: " + payload);
        BarcodeEncoder barcodeEncoder = new BarcodeEncoder();
        try {
            Bitmap bitmap = barcodeEncoder.encodeBitmap(
                    payload,
                    BarcodeFormat.QR_CODE,
                    400, 400
            );
            // Make sure we're on the main thread
            runOnUiThread(() -> {
                imgQrCode.setImageBitmap(bitmap);
                imgQrCode.setVisibility(View.VISIBLE);
                if (btnSaveQr != null) btnSaveQr.setEnabled(true);
            });
        } catch (WriterException e) {
            Log.e(TAG, "Error generating QR code: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void saveQrToGallery() {
        if (imgQrCode.getDrawable() == null) {
            Toast.makeText(this, "No QR image to save", Toast.LENGTH_SHORT).show();
            return;
        }

        Bitmap bitmap;
        if (imgQrCode.getDrawable() instanceof android.graphics.drawable.BitmapDrawable) {
            bitmap = ((android.graphics.drawable.BitmapDrawable) imgQrCode.getDrawable()).getBitmap();
        } else {
            bitmap = Bitmap.createBitmap(imgQrCode.getWidth(), imgQrCode.getHeight(), Bitmap.Config.ARGB_8888);
            android.graphics.Canvas canvas = new android.graphics.Canvas(bitmap);
            imgQrCode.getDrawable().setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
            imgQrCode.getDrawable().draw(canvas);
        }

        String fileName = "QR_" + System.currentTimeMillis() + ".png";
        try {
            Uri uri;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                android.content.ContentValues values = new android.content.ContentValues();
                values.put(MediaStore.Images.Media.DISPLAY_NAME, fileName);
                values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                values.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/SAPS");
                values.put(MediaStore.Images.Media.IS_PENDING, 1);

                uri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                if (uri == null) throw new IllegalStateException("Failed to create new MediaStore record");

                try (java.io.OutputStream out = getContentResolver().openOutputStream(uri)) {
                    if (out == null) throw new IllegalStateException("Failed to open output stream");
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
                }

                values.clear();
                values.put(MediaStore.Images.Media.IS_PENDING, 0);
                getContentResolver().update(uri, values, null, null);
            } else {
                String savedImageURL = MediaStore.Images.Media.insertImage(
                        getContentResolver(), bitmap, fileName, "Payment QR Code");
                uri = Uri.parse(savedImageURL);
            }

            Toast.makeText(this, "Saved to gallery", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            Log.e(TAG, "saveQrToGallery: ", e);
            Toast.makeText(this, "Save failed: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }
    private void fetchCheckStatus(String orderCode){
        TransactionApiService txApi = ApiClient.getServiceLast(this).create(TransactionApiService.class);
        txApi.getTransactionPayOs(orderCode).enqueue(new Callback<PaymentStatusResponseDTO>() {
            @Override
            public void onResponse(Call<PaymentStatusResponseDTO> call, Response<PaymentStatusResponseDTO> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    String statusString = response.body().getData().getStatus();
                    PaymentStatus status = PaymentStatus.fromString(statusString);

                    Log.i(TAG, "onResponse: " + response.body().getData().toString());

                    handlePaymentStatus(status);
                } else {
                    // API call successful but no valid data
//                        navigateToResultActivity(PaymentStatus.FAILED);
                }
            }

            @Override
            public void onFailure(Call<PaymentStatusResponseDTO> call, Throwable t) {
//                    navigateToResultActivity("Failure");
            }
        });
    }



    private void handlePaymentStatus(PaymentStatus status) {
        switch (status) {
            case PAID:
                navigateToResultActivity(status);
                break;

            case CANCELLED:
            case EXPIRED:
            case FAILED:
                navigateToResultActivity(status);
                break;

            case PENDING:
            case PROCESSING:
            case UNDERPAID:
                showPaymentStatusToast(status);
                break;

            case UNKNOWN:
            default:
                navigateToResultActivity(status);
                break;
        }
    }

    private void navigateToResultActivity(PaymentStatus status) {
        Intent intent = new Intent(PaymentActivity.this, PaymentResultActivity.class);
        intent.putExtra("status", status);
        
        // Pass payment data for success screen
        if (status == PaymentStatus.PAID && payment != null && payment.getData() != null) {
            intent.putExtra("transactionId", payment.getData().getOrderCode());
            intent.putExtra("amount", StringUtils.formatVNDLocale(payment.getData().getAmount()));
            intent.putExtra("paymentMethod", "Bank Transfer");
            intent.putExtra("vehicleInfo", vehicleID);
            intent.putExtra("dateTime", new java.text.SimpleDateFormat("MMM dd, yyyy - HH:mm a", java.util.Locale.getDefault()).format(new java.util.Date()));
        }
        
        // Pass original data for retry functionality
        intent.putExtra("vehicleId", vehicleID);
        intent.putExtra("sessionId", sessionID);
        
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(intent);
        finish();
    }

    private void showPaymentStatusToast(PaymentStatus status) {
        String message;
        switch (status) {
            case PENDING:
                message = "Payment is still pending. Please wait...";
                break;
            case PROCESSING:
                message = "Payment is being processed. Please wait...";
                break;
            case UNDERPAID:
                message = "Payment amount is insufficient. Please complete the payment.";
                break;
            default:
                message = "Payment status: " + status.name();
                break;
        }
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    private void performCancelPayment() {
        if (sessionID == null || sessionID.isEmpty()) {
            Toast.makeText(this, "Session ID is missing", Toast.LENGTH_SHORT).show();
            return;
        }

        TransactionApiService txApi = ApiClient.getServiceLast(this).create(TransactionApiService.class);
        PaymentCancelRequestDTO body = new PaymentCancelRequestDTO("User cancelled from app");
        txApi.cancelPayment(sessionID, body).enqueue(new Callback<PaymentStatusResponseDTO>() {
            @Override
            public void onResponse(Call<PaymentStatusResponseDTO> call, Response<PaymentStatusResponseDTO> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    navigateToResultActivity(PaymentStatus.CANCELLED);
                } else {
                    Toast.makeText(PaymentActivity.this, "Cancel failed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<PaymentStatusResponseDTO> call, Throwable t) {
                Toast.makeText(PaymentActivity.this, "Cancel error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}