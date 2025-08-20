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

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.main.MainActivity;
import vn.edu.fpt.sapsmobile.enums.PaymentStatus;
import vn.edu.fpt.sapsmobile.models.Transaction;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class PaymentResultActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);

//        vehicle = (Vehicle) intent.getSerializableExtra("vehicle");

        PaymentStatus status = (PaymentStatus) getIntent().getSerializableExtra("status");

        if (status == PaymentStatus.PAID) {
            setContentView(R.layout.activity_payment_success);

            // Lấy dữ liệu Transaction
            Transaction transaction = (Transaction) getIntent().getSerializableExtra("transaction");

            if (transaction != null) {
                // Ánh xạ view
                TextView tvTransactionId = findViewById(R.id.tvTransactionId);
                TextView tvAmountPaid = findViewById(R.id.tvAmountPaid);
                TextView tvPaymentMethod = findViewById(R.id.tvPaymentMethod);
                TextView tvDateTime = findViewById(R.id.tvDateTime);
                TextView tvVehicle = findViewById(R.id.tvVehicle);
                Button btnBack = findViewById(R.id.btnBack);
                // Gán dữ liệu
                tvTransactionId.setText("Transaction ID: " + transaction.getTransactionId());
                tvAmountPaid.setText("Amount Paid: $" + transaction.getAmountPaid());
                tvPaymentMethod.setText("Payment Method: " + transaction.getPaymentMethod());
                tvDateTime.setText("Date and Time: " + transaction.getDateTime());
                tvVehicle.setText("Vehicle: " + transaction.getVehicle());
                btnBack.setOnClickListener(v -> {
                    Intent intent = new Intent(this, MainActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    this.startActivity(intent);
                });
            }

        } else if (status == PaymentStatus.CANCELLED || status == PaymentStatus.EXPIRED || status == PaymentStatus.FAILED) {
//            case PAID:
//                navigateToResultActivity(status);
//                break;
//
//            case CANCELLED:
//            case EXPIRED:
//            case FAILED:
//                navigateToResultActivity(status);
//                break;
//
//            case PENDING:
//            case PROCESSING:
//            case UNDERPAID:
//                showPaymentStatusToast(status);
//                break;
//
//            case UNKNOWN:
//            default:
//                navigateToResultActivity(status);
//                break;

            setContentView(R.layout.activity_payment_fail);
            Button btnBack = findViewById(R.id.btnBack);
            btnBack.setOnClickListener(v -> {
                Intent intent = new Intent(this, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                this.startActivity(intent);
            });
            Button btnTryAgain = findViewById(R.id.btn_try_again);
            btnTryAgain.setOnClickListener(v -> {
                // Tạo Intent
                Intent intent = new Intent(PaymentResultActivity.this, PaymentActivity.class);

                // Nếu muốn truyền kèm dữ liệu:

//                intent.putExtra("vehicleId", parkingSessionToCheckOut.getVehicleId());
//                intent.putExtra("sessionId", parkingSessionToCheckOut.getId());

                // Chạy Activity mới
                startActivity(intent);

                // Optionally: đóng activity hiện tại
                finish();
            });
        }
        else {
            setContentView(R.layout.activity_payment_fail);
            Button btnBack = findViewById(R.id.btnBack);
            btnBack.setOnClickListener(v -> {
                Intent intent = new Intent(this, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                this.startActivity(intent);
            });
            Button btnTryAgain = findViewById(R.id.btn_try_again);
            btnTryAgain.setOnClickListener(v -> {
                // Tạo Intent
                Intent intent = new Intent(PaymentResultActivity.this, PaymentActivity.class);

                // Nếu muốn truyền kèm dữ liệu:

//                intent.putExtra("vehicleId", parkingSessionToCheckOut.getVehicleId());
//                intent.putExtra("sessionId", parkingSessionToCheckOut.getId());

                // Chạy Activity mới
                startActivity(intent);

                // Optionally: đóng activity hiện tại
                finish();
            });

        }

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

}
