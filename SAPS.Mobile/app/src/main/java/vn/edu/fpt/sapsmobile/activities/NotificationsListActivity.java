package vn.edu.fpt.sapsmobile.activities;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.network.api.ApiService;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.adapters.NotificationAdapter;
import vn.edu.fpt.sapsmobile.models.Notification;
import vn.edu.fpt.sapsmobile.dtos.profile.NotificationsResponse;

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


        // action bar
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setTitle("Notifications");
            actionBar.setDisplayHomeAsUpEnabled(true); // Show back arrow
        }

        //
        recyclerView = findViewById(R.id.recycler_view);
        notificationList = new ArrayList<>();
        sharedPreferences = getSharedPreferences("NotificationsPrefs", MODE_PRIVATE);


       ApiService apiService =  ApiTest.getService(this).create(ApiService.class);

        apiService.getNotifications().enqueue(new Callback<NotificationsResponse>() {
            @Override
            public void onResponse(Call<NotificationsResponse> call, Response<NotificationsResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    notificationList = response.body().getNotifications();

                    // Lấy trạng thái "đã đọc" từ SharedPreferences và cập nhật
                    for (Notification notification : notificationList) {
                       sharedPreferences.getBoolean("isRead_" + notification.getId(), false);
                        boolean isRead = sharedPreferences.getBoolean("isRead_" + notification.getId(), false);
                        notification.setRead(isRead);
                    }

                    // Cập nhật adapter và RecyclerView
                    adapter = new NotificationAdapter(notificationList, NotificationsListActivity.this,  (notification, position) ->{
                        notification.setRead(true);
                        sharedPreferences.edit().putBoolean("isRead_" + notification.getId(), true).apply();

                        Log.i("check", "onResponse: " + notification.isRead());


                        // update ui
                        adapter.notifyItemChanged(position);

                        // open detaild scree or show toast
                        Toast.makeText(NotificationsListActivity.this,notification.getHeader() ,Toast.LENGTH_SHORT ).show();
                    });
                    recyclerView.setLayoutManager(new LinearLayoutManager(NotificationsListActivity.this));
                    recyclerView.setAdapter(adapter);

//                    adapter = new NotificationAdapter(notificationList, (notification, position) -> {
//                        // Mark as read
//                        notification.setRead(true);
//                        sharedPreferences.edit().putBoolean("isRead_" + notification.getId(), true).apply();
//
//                        // Update UI
//                        adapter.notifyItemChanged(position);
//
//                        // Open details screen or show toast
//                        Toast.makeText(this, "Clicked: " + notification.getTitle(), Toast.LENGTH_SHORT).show();
//                    });
//                    recyclerView.setLayoutManager(new LinearLayoutManager(this));
//                    recyclerView.setAdapter(adapter);

                } else {
                    Toast.makeText(NotificationsListActivity.this, getString(R.string.toast_error_unable_to_fetch_data), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<NotificationsResponse> call, Throwable t) {
                Toast.makeText(NotificationsListActivity.this, getString(R.string.toast_request_failed, t.getMessage()), Toast.LENGTH_SHORT).show();
            }
        });

    }

    private void markAllAsRead(){
        // Logic to mark all notifications as read
        for (Notification notification : notificationList) {
            notification.setRead(true);
            // Save to SharedPreferences
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putBoolean("isRead_" + notification.getId(), true);
            editor.apply();
        }
                    Toast.makeText(NotificationsListActivity.this, getString(R.string.toast_all_notifications_marked_read), Toast.LENGTH_SHORT).show();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.notification_actionbar_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        else if (item.getItemId() == R.id.btn_mark_all_read) {
            markAllAsRead();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
