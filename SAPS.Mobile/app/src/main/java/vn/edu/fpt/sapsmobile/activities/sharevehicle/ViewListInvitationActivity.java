package vn.edu.fpt.sapsmobile.activities.sharevehicle;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NavUtils;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;

import java.util.ArrayList;
import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.adapters.InvitationAdapter;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.ShareVehicleResponse;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;

public class ViewListInvitationActivity extends AppCompatActivity implements InvitationAdapter.OnVehicleClickListener {
    private String TAG ="ViewListInvitationActivity ";
    // service
    private LoadingDialog loadingDialog;
    // ui component
    private RecyclerView recyclerView;
    private InvitationAdapter adapter;
    private MaterialToolbar toolbar;

    //
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_list_invitation);

        initViews();
        setupToolbar();
        setupRecyclerView();
        loadSampleData();
        loadingDialog = new LoadingDialog(this);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    private void initViews() {
        toolbar = findViewById(R.id.topAppBar);
        recyclerView = findViewById(R.id.recyclerViewVehicles);
    }

    private void setupToolbar() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.invitation_activity_actionbar_title);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            int surface = SurfaceColors.SURFACE_0.getColor(this);
            getWindow().setStatusBarColor(surface);
            getWindow().setNavigationBarColor(surface);


            toolbar.setNavigationOnClickListener(v -> onBackPressed());

            // Add menu items if needed
            toolbar.setOnMenuItemClickListener(item -> {
                int id = item.getItemId();
                if (id == R.id.action_add) {
                    // Handle add vehicle action
                    Toast.makeText(this, "Thêm xe mới", Toast.LENGTH_SHORT).show();
                    return true;
                } else if (id == R.id.action_filter) {
                    // Handle filter action
                    Toast.makeText(this, "Lọc danh sách", Toast.LENGTH_SHORT).show();
                    return true;
                }
                return false;
            });
        }
    }

    private void setupRecyclerView() {
        adapter = new InvitationAdapter(new ArrayList<>());
        adapter.setOnVehicleClickListener(this);

        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(adapter);

        // Add item decoration for spacing if needed
        // recyclerView.addItemDecoration(new DividerItemDecoration(this, DividerItemDecoration.VERTICAL));
    }

    private void loadSampleData() {
        // Sample data matching your JSON structure
        List<ShareVehicleResponse> vehicles = new ArrayList<>();

        ShareVehicleResponse vehicle1 = new ShareVehicleResponse();
        vehicle1.setShareVehicleId("880e8400-e29b-41d4-a716-446655440011");
        vehicle1.setLicensePlate("59G-30303");
        vehicle1.setBrand("Honda");
        vehicle1.setModel("Air Blade");
        vehicle1.setColor("Gold");
        vehicle1.setOwnerVehicleFullName("Tran Thi Binh");
        vehicle1.setRegistrationDate("2023-01-15");
        vehicle1.setVehicleType("Motorcycle");

        ShareVehicleResponse vehicle2 = new ShareVehicleResponse();
        vehicle1.setShareVehicleId("880e8400-e29b-41d4-a716-446655440014");
        vehicle2.setLicensePlate("30A-12345");
        vehicle2.setBrand("Yamaha");
        vehicle2.setModel("Exciter");
        vehicle2.setColor("Blue");
        vehicle2.setOwnerVehicleFullName("Nguyen Van An");
        vehicle2.setRegistrationDate("2023-03-20");
        vehicle2.setVehicleType("Motorcycle");

        ShareVehicleResponse vehicle3 = new ShareVehicleResponse();
        vehicle1.setShareVehicleId("880e8400-e29b-41d4-a716-446655440012");
        vehicle3.setLicensePlate("29B-67890");
        vehicle3.setBrand("Honda");
        vehicle3.setModel("Vision");
        vehicle3.setColor("White");
        vehicle3.setOwnerVehicleFullName("Le Thi Mai");
        vehicle3.setRegistrationDate("2023-02-10");
        vehicle3.setVehicleType("Scooter");

        vehicles.add(vehicle1);
        vehicles.add(vehicle2);
        vehicles.add(vehicle3);

        adapter.updateVehicles(vehicles);
    }

    @Override
    public void onVehicleClick(ShareVehicleResponse vehicle, int position) {
        // Handle vehicle item click
        Toast.makeText(this, "Clicked: " + vehicle.getLicensePlate(), Toast.LENGTH_SHORT).show();

        // You can navigate to detail activity here
        // Intent intent = new Intent(this, VehicleDetailActivity.class);
        // intent.putExtra("vehicle_id", vehicle.getId());
        // intent.putExtra("license_plate", vehicle.getLicensePlate());
        // startActivity(intent);
    }

    @Override
    public void onVehicleShareClick(ShareVehicleResponse vehicle, int position) {
        // Handle share button click
        Toast.makeText(this, "Share: " + vehicle.getLicensePlate(), Toast.LENGTH_SHORT).show();

        // Implement sharing functionality
        shareVehicle(vehicle);
    }

    @Override
    public void onAcceptShareVehicle(ShareVehicleResponse vehicle, int position) {
        // Handle accept share vehicle action
        acceptShareVehicle(vehicle.getShareVehicleId());
    }

    private void shareVehicle(ShareVehicleResponse vehicle) {
        // Example sharing implementation
        String shareText = String.format(
                "Xe %s %s\nBiển số: %s\nChủ sở hữu: %s\nMàu sắc: %s",
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getLicensePlate(),
                vehicle.getOwnerVehicleFullName(),
                vehicle.getColor()
        );

        android.content.Intent shareIntent = new android.content.Intent(android.content.Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(android.content.Intent.EXTRA_TEXT, shareText);
        startActivity(android.content.Intent.createChooser(shareIntent, "Chia sẻ thông tin xe"));
    }

    private void acceptShareVehicle(String shareVehicleId) {
        Toast.makeText(this, "Go here " + shareVehicleId, Toast.LENGTH_LONG).show();

        // TODO: Implement your API call here
        // Example:
        // loadingDialog.show();
        // vehicleApiService.acceptShareVehicle(shareVehicleId)
        //     .enqueue(new Callback<ResponseBody>() {
        //         @Override
        //         public void onResponse(Call<ResponseBody> call, Response<ResponseBody> response) {
        //             loadingDialog.dismiss();
        //             if (response.isSuccessful()) {
        //                 Toast.makeText(ViewListInvitationActivity.this, "Đã chấp nhận lời mời", Toast.LENGTH_SHORT).show();
        //                 // Optionally refresh the list or remove the item
        //                 // adapter.removeVehicle(position);
        //             } else {
        //                 Toast.makeText(ViewListInvitationActivity.this, "Lỗi khi chấp nhận lời mời", Toast.LENGTH_SHORT).show();
        //             }
        //         }
        //
        //         @Override
        //         public void onFailure(Call<ResponseBody> call, Throwable t) {
        //             loadingDialog.dismiss();
        //             Toast.makeText(ViewListInvitationActivity.this, "Lỗi kết nối", Toast.LENGTH_SHORT).show();
        //         }
        //     });
        
        // For now, just show a toast
        Toast.makeText(this, "Accepting share vehicle: " + shareVehicleId, Toast.LENGTH_SHORT).show();
    }

    // Method to refresh data from API
    public void refreshVehicleList() {
        // Call your API here and update the adapter
        // For example:
        // vehicleApiService.getVehicles()
        //     .enqueue(new Callback<List<VehicleResponse>>() {
        //         @Override
        //         public void onResponse(Call<List<VehicleResponse>> call, Response<List<VehicleResponse>> response) {
        //             if (response.isSuccessful() && response.body() != null) {
        //                 adapter.updateVehicles(response.body());
        //             }
        //         }
        //
        //         @Override
        //         public void onFailure(Call<List<VehicleResponse>> call, Throwable t) {
        //             Toast.makeText(VehicleListActivity.this, "Lỗi tải dữ liệu", Toast.LENGTH_SHORT).show();
        //         }
        //     });
    }

    // Method to add new vehicle
//    public void addNewVehicle(VehicleResponse newVehicle) {
//        adapter.addVehicle(newVehicle);
//        recyclerView.smoothScrollToPosition(adapter.getItemCount() - 1);
//    }

    // Method to remove vehicle
    public void removeVehicle(int position) {
        adapter.removeVehicle(position);
    }


}
