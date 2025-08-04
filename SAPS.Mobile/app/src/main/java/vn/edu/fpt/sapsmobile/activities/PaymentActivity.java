package vn.edu.fpt.sapsmobile.activities;

import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.ImageView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NavUtils;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.journeyapps.barcodescanner.BarcodeEncoder;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.API.ApiTest;
import vn.edu.fpt.sapsmobile.API.apiinterface.ParkingLotApiService;
import vn.edu.fpt.sapsmobile.API.apiinterface.TransactionApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.main.MainActivity;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.Transaction;

public class PaymentActivity extends AppCompatActivity {
    ImageView imgQrCode;
    Button btnFinish;
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
        setContentView(R.layout.activity_payment);
        btnFinish = findViewById(R.id.btnFinish);
        imgQrCode = findViewById(R.id.imgQrCode);

        String jsonFromApi = "\"Bank: Agribank\\nAccount: 2204205387290\\nName: [NGHIEM PHU DUC]\";";
        generateQr("970405","2204205387290","NGHIEM PHU DUC");
        btnFinish.setOnClickListener(v -> {
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
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
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