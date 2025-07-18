package vn.edu.fpt.sapsmobile.activities.auth;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import androidx.appcompat.app.AppCompatActivity;
import vn.edu.fpt.sapsmobile.R;

public class NotificationsListActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notifications_list);

        Button btnBack = findViewById(R.id.btn_back);
        btnBack.setOnClickListener(v -> finish());

        // Thêm logic để xử lý các notifications ở đây, ví dụ:
        // Mark All Read
        Button btnMarkAllRead = findViewById(R.id.btn_mark_all_read);
        btnMarkAllRead.setOnClickListener(v -> {
            // Xử lý đánh dấu tất cả thông báo là đã đọc
            // Logic này sẽ xử lý khi tất cả thông báo được đánh dấu đã đọc
        });
    }
}