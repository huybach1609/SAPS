package vn.edu.fpt.sapsmobile.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.TextView;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import android.widget.Spinner;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import androidx.core.app.NavUtils;

import com.google.android.material.button.MaterialButton;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.API.ApiTest;
import vn.edu.fpt.sapsmobile.API.apiinterface.ParkingLotApiService;
import vn.edu.fpt.sapsmobile.API.apiinterface.ParkingSessionApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class CheckoutActivity extends AppCompatActivity {
    TextView tvVehicle, tvLocation, tvEntryTime, tvExitTime, tvDuration;
    TextView tvBaseRate, tvTimeParked, tvSubtotal, tvTax, tvTotalAmount;
    Spinner spinnerPaymentMethod;
    Button btnConfirmCheckout,btnBack;
    ParkingSession parkingSessionToCheckOut;
    ParkingLot parkingLotCheckOut;
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

        Vehicle vehicle = (Vehicle) getIntent().getSerializableExtra("vehicle");
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }


        // Ánh xạ view
        tvVehicle = findViewById(R.id.tvVehicle);
        tvLocation = findViewById(R.id.tvLocation);
        tvEntryTime = findViewById(R.id.tvEntryTime);
        tvExitTime = findViewById(R.id.tvExitTime);
        tvDuration = findViewById(R.id.tvDuration);

        tvBaseRate = findViewById(R.id.tvBaseRate);
        tvTimeParked = findViewById(R.id.tvTimeParked);
        tvSubtotal = findViewById(R.id.tvSubtotal);
        tvTax = findViewById(R.id.tvTax);
        tvTotalAmount = findViewById(R.id.tvTotalAmount);

        spinnerPaymentMethod = findViewById(R.id.spinnerPaymentMethod);
        btnConfirmCheckout = findViewById(R.id.btnConfirmCheckout);
        btnBack = findViewById(R.id.btnBack);
        btnBack.setOnClickListener(v ->
                getOnBackPressedDispatcher().onBackPressed()
        );
        btnConfirmCheckout.setOnClickListener(v -> {
            // Tạo Intent
            Intent intent = new Intent(CheckoutActivity.this, PaymentActivity.class);

            // Nếu muốn truyền kèm dữ liệu:
            intent.putExtra("vehicleId", parkingSessionToCheckOut.getVehicleId());
            intent.putExtra("sessionId", parkingSessionToCheckOut.getId());

            // Chạy Activity mới
            startActivity(intent);

            // Optionally: đóng activity hiện tại
            finish();
        });
        if (vehicle != null) {
            Log.d("CheckoutActivity", "Vehicle: " + vehicle.getLicensePlate());
            ParkingSessionApiService parkingSessionApi = ApiTest.getService(this).create(ParkingSessionApiService.class);

            parkingSessionApi.getParkingSessionToCheckOut(vehicle.getId()).enqueue(new Callback<ParkingSession>() {
                @Override
                public void onResponse(Call<ParkingSession> call, Response<ParkingSession> response) {
                    parkingSessionToCheckOut = response.body();
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
                    LocalDateTime entryTime = LocalDateTime.parse(parkingSessionToCheckOut.getEntryDateTime(), formatter);
                    tvVehicle.setText("Vehicle: " + vehicle.getLicensePlate() +" ( "+vehicle.getBrand()+vehicle.getModel()+" ) ");
                    tvEntryTime.setText("Entry Time: " + parkingSessionToCheckOut.getEntryDateTime());
                    LocalDateTime now = LocalDateTime.now();
                    String exitTime = now.format(formatter);
                    tvExitTime.setText("Exit Time: " + (parkingSessionToCheckOut.getExitDateTime() != null ? exitTime  : "N/A"));
                    // Tính số ngày, giờ, phút
                    long totalMinutes = java.time.Duration.between(entryTime, now).toMinutes();
                    long days = totalMinutes / (24 * 60);
                    long hours = (totalMinutes % (24 * 60)) / 60;
                    long minutes = totalMinutes % 60;
                    String durationStr = days + " days " + hours + " hours " + minutes + " minutes";
                    tvDuration.setText("Duration: " + durationStr);
                    ParkingLotApiService parkingLotApiService = ApiTest.getService(CheckoutActivity.this).create(ParkingLotApiService.class);
                    parkingLotApiService.getParkingLotById(parkingSessionToCheckOut.getParkingLotId()).enqueue(new Callback<ParkingLot>() {
                        @Override
                        public void onResponse(Call<ParkingLot> call, Response<ParkingLot> response) {
                            parkingLotCheckOut = response.body();
                            tvLocation.setText("Location: " + parkingLotCheckOut.getAddress());
                        }

                        @Override
                        public void onFailure(Call<ParkingLot> call, Throwable t) {
                            Log.e("CheckoutActivity", "Failed to get ParkingLot: " + t.getMessage());
                        }
                    });
                }

                @Override
                public void onFailure(Call<ParkingSession> call, Throwable t) {
                }
            });

        }

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}