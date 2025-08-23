package vn.edu.fpt.sapsmobile.activities.sharevehicle;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.auth.LoginActivity;
import vn.edu.fpt.sapsmobile.adapters.InvitationAdapter;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.ShareVehicleResponse;
import vn.edu.fpt.sapsmobile.enums.ShareVehicleStatus;
import vn.edu.fpt.sapsmobile.network.api.ShareVehicleApi;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class InvitationActivity extends AppCompatActivity implements InvitationAdapter.OnVehicleClickListener {
    private String TAG ="ViewListInvitationActivity ";
    // service
    private LoadingDialog loadingDialog;
    private TokenManager tokenManager;
    // ui component
    private RecyclerView recyclerView;
    private InvitationAdapter adapter;
    private MaterialToolbar toolbar;
    private LinearLayout llNotFoundSession;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_list_invitation);

        initViews();
        setupToolbar();
        setupRecyclerView();
        tokenManager = new TokenManager(this);
        loadingDialog = new LoadingDialog(this);
        loadShareVehicleData();
    }

    private void initViews() {
        toolbar = findViewById(R.id.topAppBar);
        recyclerView = findViewById(R.id.recyclerViewVehicles);
        llNotFoundSession = findViewById(R.id.emptyView);

        // default
        recyclerView.setVisibility(View.GONE);
        llNotFoundSession.setVisibility(View.VISIBLE);

    }

    private void setupToolbar() {


        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.invitation_activity_actionbar_title);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            int surface = SurfaceColors.SURFACE_0.getColor(this);
            getWindow().setStatusBarColor(surface);
            getWindow().setNavigationBarColor(surface);


            toolbar.setNavigationOnClickListener(v -> onBackPressed());

            // Add menu items if needed
//            toolbar.setOnMenuItemClickListener(item -> {
//                int id = item.getItemId();
//                if (id == R.id.action_add) {
//                    // Handle add vehicle action
//                    Toast.makeText(this, "Thêm xe mới", Toast.LENGTH_SHORT).show();
//                    return true;
//                } else if (id == R.id.action_filter) {
//                    // Handle filter action
//                    Toast.makeText(this, "Lọc danh sách", Toast.LENGTH_SHORT).show();
//                    return true;
//                }
//
//                return false;
//            });
        }
    }
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private void setupRecyclerView() {
        adapter = new InvitationAdapter(new ArrayList<>());
        adapter.setOnVehicleClickListener(this);

        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(adapter);

    }

    private void loadShareVehicleData(){
        ShareVehicleApi api = ApiTest.getServiceLast(this).create(ShareVehicleApi.class);
        var user = tokenManager.getUserData();
//        String sharedPersonId = "550e8400-e29b-41d4-a716-446655440006";

        if(user.getId() == null){
            finish();
        }
        loadingDialog.show("Loading vehicles...", true, this::finish);

// Updated code using the enum
        api.getSharedVehicles(user.getId()).enqueue(new retrofit2.Callback<java.util.List<ShareVehicleResponse>>() {
            @Override
            public void onResponse(retrofit2.Call<java.util.List<ShareVehicleResponse>> call, retrofit2.Response<java.util.List<ShareVehicleResponse>> response) {
                loadingDialog.dismiss();
                Log.i(TAG, "onResponse: " + response.body());
                if (response.isSuccessful() && response.body() != null) {
                    List<ShareVehicleResponse> list = new ArrayList<>(response.body()); // Create new list to avoid modification issues

                    Iterator<ShareVehicleResponse> iterator = list.iterator();
                    while (iterator.hasNext()) {
                        ShareVehicleResponse s = iterator.next();
                        if ( ShareVehicleStatus.SHARED.getValue().equals(s.getSharingStatus())) {
                            iterator.remove();
                        }
                    }

                    if(!list.isEmpty()){
                        recyclerView.setVisibility(View.VISIBLE);
                        llNotFoundSession.setVisibility(View.GONE);
                    }
                    adapter.updateVehicles(list);
                } else {
                    Toast.makeText(InvitationActivity.this, R.string.list_invitation_error_fetch, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(retrofit2.Call<java.util.List<ShareVehicleResponse>> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(InvitationActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onVehicleClick(ShareVehicleResponse vehicle, int position) {
        // Handle vehicle item click
//        Toast.makeText(this, "Clicked: " + vehicle.getLicensePlate(), Toast.LENGTH_SHORT).show();

        // You can navigate to detail activity here
        // Intent intent = new Intent(this, VehicleDetailActivity.class);
        // intent.putExtra("vehicle_id", vehicle.getId());
        // intent.putExtra("license_plate", vehicle.getLicensePlate());
        // startActivity(intent);
    }



    @Override
    public void onAcceptShareVehicle(ShareVehicleResponse vehicle, int position) {
        Intent detail = new Intent(this, InvitationDetailActivity.class);
        detail.putExtra("shareVehicleId", vehicle.getShareVehicleId());
        detail.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        this.startActivity(detail);


        // Handle accept share vehicle action
//        acceptShareVehicle(vehicle.getShareVehicleId());
    }

    @Override
    public void onRejectShareVehicle(ShareVehicleResponse vehicle, int position) {

       rejectShareVehicle(vehicle.getShareVehicleId()) ;
        
    }



    private void rejectShareVehicle(String shareVehicleId) {
        ShareVehicleApi api = ApiTest.getServiceLast(this).create(ShareVehicleApi.class);

        loadingDialog.show("Reject invitation...", true, this::finish);

        api.rejectShareVehicle(shareVehicleId).enqueue(new retrofit2.Callback<Void>() {
            @Override
            public void onResponse(retrofit2.Call<Void> call, retrofit2.Response<Void> response) {
                loadingDialog.dismiss();
                if (response.isSuccessful()) {
                    Toast.makeText(InvitationActivity.this, R.string.view_list_invitation_adapter_reject_200, Toast.LENGTH_SHORT).show();
                    // Refresh the list to update the UI
                    loadShareVehicleData();
                } else {
                    Toast.makeText(InvitationActivity.this, R.string.view_list_invitation_adapter_accept_400, Toast.LENGTH_SHORT).show();
                    loadShareVehicleData();
                }
            }

            @Override
            public void onFailure(retrofit2.Call<Void> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(InvitationActivity.this, "connection error", Toast.LENGTH_SHORT).show();
            }
        });

    }
}
