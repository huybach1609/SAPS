package vn.edu.fpt.sapsmobile.activities.sharevehicle;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import vn.edu.fpt.sapsmobile.R;

public class ShareVehicleAccessActivity extends AppCompatActivity {
    private Button btnFindUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_share_vehicle_access);
        btnFindUser = findViewById(R.id.btnFindUser);
        btnFindUser.setOnClickListener(v -> {
            Intent intent = new Intent(ShareVehicleAccessActivity.this, ConfirmUserAccessActivity.class);
            startActivity(intent);
            finish();
        });
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}
