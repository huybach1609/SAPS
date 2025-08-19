package vn.edu.fpt.sapsmobile.activities.checkout;

import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageView;

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
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.service.TransactionApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Transaction;

public class PaymentActivity extends AppCompatActivity {
    ImageView imgQrCode;
    Button btnIHavePaid;

    String vehicleID, sessionID;

    ParkingSession session;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_payment);

        initializeViews();
        setupActionBar();
        handleIntentData();
        setupButtonListeners();
        setupWindowInsets();

    }

    private void initializeViews() {
        btnIHavePaid = findViewById(R.id.btnIHavePaid);
        imgQrCode = findViewById(R.id.imgQrCode);

    }
    private void setupWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

    }
    private void handleIntentData() {
       vehicleID = getIntent().getStringExtra("vehicleId");
       sessionID= getIntent().getStringExtra("sessionID");
    }

    private void setupButtonListeners() {

        btnIHavePaid.setOnClickListener(v -> {
            Intent intent = new Intent(PaymentActivity.this, PaymentResultActivity.class);
            intent.putExtra("status", "SUCCESS");
            TransactionApiService transactionApiService = ApiTest.getService(this).create(TransactionApiService.class);

            transactionApiService.getTransactionById("TXN-20250603-001").enqueue(new Callback<Transaction>() {
                @Override
                public void onResponse(Call<Transaction> call, Response<Transaction> response) {
                    Transaction transaction = response.body();

                    Intent intent = new Intent(PaymentActivity.this, PaymentResultActivity.class);
                    intent.putExtra("status", "Failure");
                    intent.putExtra("transaction", transaction);
                    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

                    startActivity(intent);
                    finish();
                }

                @Override
                public void onFailure(Call<Transaction> call, Throwable t) {
                    intent.putExtra("status", "Failure");
                }
            });
        });

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

    private void generateQr(String bin,String accountNo,String accountName) {
            BarcodeEncoder barcodeEncoder = new BarcodeEncoder();
            try {
                Bitmap bitmap = barcodeEncoder.encodeBitmap(
                        bin+accountNo+accountName,
                        BarcodeFormat.QR_CODE,
                        400, 400
                );
                imgQrCode.setImageBitmap(bitmap);
            } catch (WriterException e) {
                e.printStackTrace();
            }
    }
}