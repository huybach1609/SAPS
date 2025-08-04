package vn.edu.fpt.sapsmobile.activities.auth;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.sapsmobile.API.ApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.adapters.NotificationAdapter;
import vn.edu.fpt.sapsmobile.models.Notification;
import vn.edu.fpt.sapsmobile.models.NotificationsResponse;

import java.util.ArrayList;
import java.util.List;

public class NotificationsListActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private NotificationAdapter adapter;
    private List<Notification> notificationList;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notifications_list);

        recyclerView = findViewById(R.id.recycler_view);
        notificationList = new ArrayList<>();
        sharedPreferences = getSharedPreferences("NotificationsPrefs", MODE_PRIVATE);

        // Retrofit setup
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://10.0.2.2:3001/")  // Địa chỉ của API giả lập
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        ApiService apiService = retrofit.create(ApiService.class);

        // Gọi API để lấy dữ liệu thông báo
        apiService.getNotifications().enqueue(new Callback<NotificationsResponse>() {
            @Override
            public void onResponse(Call<NotificationsResponse> call, Response<NotificationsResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    notificationList = response.body().getNotifications();

                    // Lấy trạng thái "đã đọc" từ SharedPreferences và cập nhật
                    for (Notification notification : notificationList) {
                        boolean isRead = sharedPreferences.getBoolean("isRead_" + notification.getId(), false);
                        notification.setRead(isRead);
                    }

                    // Cập nhật adapter và RecyclerView
                    adapter = new NotificationAdapter(notificationList, NotificationsListActivity.this);
                    recyclerView.setLayoutManager(new LinearLayoutManager(NotificationsListActivity.this));
                    recyclerView.setAdapter(adapter);
                } else {
                    Toast.makeText(NotificationsListActivity.this, "Error: Unable to fetch data", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<NotificationsResponse> call, Throwable t) {
                Toast.makeText(NotificationsListActivity.this, "Request failed: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });

        Button btnBack = findViewById(R.id.btn_back);
        btnBack.setOnClickListener(v -> finish());

        Button btnMarkAllRead = findViewById(R.id.btn_mark_all_read);
        btnMarkAllRead.setOnClickListener(v -> {
            // Logic to mark all notifications as read
            for (Notification notification : notificationList) {
                notification.setRead(true);
                // Save to SharedPreferences
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.putBoolean("isRead_" + notification.getId(), true);
                editor.apply();
            }
            Toast.makeText(NotificationsListActivity.this, "All notifications marked as read", Toast.LENGTH_SHORT).show();
        });
    }
}
