package vn.edu.fpt.sapsmobile.activities.sharevehicle;

import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.network.api.ShareVehicleApi;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class InvitationDetailActivity extends AppCompatActivity {
    private String TAG ="InvitationDetailActivity";

    private MaterialToolbar toolbar;

    private LoadingDialog loadingDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_invitation_detail);

        //load intent

        String shareVehicleId = getIntent().getStringExtra("shareVehicleId");
        Log.i(TAG, "onCreate: " + shareVehicleId);
        // get sharedVehicleId from invitationActivity
        initViews();
        setupToolbar();
        fetchData();

    }

    private void fetchData() {


    }

    private void initViews() {

        loadingDialog = new LoadingDialog(this);
        toolbar = findViewById(R.id.topAppBar);
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.invitation_activity_actionbar_title);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            int surface = SurfaceColors.SURFACE_0.getColor(this);
            getWindow().setStatusBarColor(surface);
            getWindow().setNavigationBarColor(surface);


            toolbar.setNavigationOnClickListener(v -> onBackPressed());//
        }
    }
    private void acceptShareVehicle(String shareVehicleId) {
        ShareVehicleApi api = ApiTest.getServiceLast(this).create(ShareVehicleApi.class);

        loadingDialog.show("Accepting invitation...", true, this::finish);

        api.acceptShareVehicle(shareVehicleId).enqueue(new retrofit2.Callback<Void>() {
            @Override
            public void onResponse(retrofit2.Call<Void> call, retrofit2.Response<Void> response) {
                loadingDialog.dismiss();
                if (response.isSuccessful()) {
                    Toast.makeText(InvitationDetailActivity.this, R.string.view_list_invitation_adapter_accept_200, Toast.LENGTH_SHORT).show();
                    // Refresh the list to update the UI
//                    loadShareVehicleData();
                } else {
                    Toast.makeText(InvitationDetailActivity.this, R.string.view_list_invitation_adapter_accept_400, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(retrofit2.Call<Void> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(InvitationDetailActivity.this, "connection error", Toast.LENGTH_SHORT).show();
            }
        });
    }

}
