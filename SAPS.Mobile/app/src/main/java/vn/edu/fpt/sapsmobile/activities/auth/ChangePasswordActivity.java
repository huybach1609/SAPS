package vn.edu.fpt.sapsmobile.activities.auth;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import vn.edu.fpt.sapsmobile.R;

public class ChangePasswordActivity extends AppCompatActivity {
    EditText edtCurrent, edtNew, edtConfirm;
    Button btnChange, btnBack;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_change_password);

        edtCurrent = findViewById(R.id.edt_current);
        edtNew = findViewById(R.id.edt_new);
        edtConfirm = findViewById(R.id.edt_confirm);
        btnChange = findViewById(R.id.btn_change);
        btnBack = findViewById(R.id.btn_back);

        btnChange.setOnClickListener(v -> {
            String current = edtCurrent.getText().toString();
            String newPass = edtNew.getText().toString();
            String confirm = edtConfirm.getText().toString();

            // Kiểm tra điều kiện mật khẩu
            if (newPass.length() < 8 || !newPass.matches(".*\\d.*") || !newPass.matches(".*[A-Z].*")) {
                Toast.makeText(this, "Password does not meet requirements", Toast.LENGTH_SHORT).show();
            } else if (!newPass.equals(confirm)) {
                Toast.makeText(this, "Password confirmation does not match", Toast.LENGTH_SHORT).show();
            } else {
                // Giả lập thay đổi thành công
                Toast.makeText(this, "Password changed successfully!", Toast.LENGTH_SHORT).show();
                finish();  // Đóng màn hình hiện tại sau khi thay đổi mật khẩu
            }
        });

        btnBack.setOnClickListener(v -> finish());  // Quay lại màn hình trước
    }
}

