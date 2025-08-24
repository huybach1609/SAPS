package vn.edu.fpt.sapsmobile.actionhandler;

import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.sharevehicle.ShareVehicleAccessActivity;
import vn.edu.fpt.sapsmobile.dialog.VehicleDetailDialog;
import vn.edu.fpt.sapsmobile.enums.ShareVehicleStatus;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.listener.VehicleFragmentVehicleDetailListener;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.api.ShareVehicleApi;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.SharedVehicleDetails;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.RecallResponse;

public class VehicleFragmentHandler implements VehicleFragmentVehicleDetailListener {

    private final Context context;
    private int currentTab = 0;
    private OnActionCompletedListener actionCompletedListener;

    // service
    private LoadingDialog loadingDialog;

    public VehicleFragmentHandler(Context context) {
        this.context = context;
        this.loadingDialog = new LoadingDialog(context);
    }

    public void setCurrentTab(int currentTab) {
        this.currentTab = currentTab;
    }

    public void setOnActionCompletedListener(OnActionCompletedListener listener) {
        this.actionCompletedListener = listener;
    }

    public interface OnActionCompletedListener {
        void onActionCompleted();
    }

    @Override
    public void onEditClicked(Vehicle vehicle) {
        Toast.makeText(context, "Edit: " + vehicle.getLicensePlate(), Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onShareClicked(Vehicle vehicle) {
        Toast.makeText(context, "Share: " + vehicle.getLicensePlate(), Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onVehicleClicked(Vehicle vehicle) {
        VehicleDetailDialog.show(context, vehicle, this, currentTab);
    }

    @Override
    public void onAction(Vehicle vehicle, AlertDialog dialog) {
        if (ShareVehicleStatus.SHARED.getValue().equals(vehicle.getSharingStatus())) {
            if (currentTab == 0) {
                // Implement recall API call
                recallVehicle(vehicle);
            } else {
                Toast.makeText(context,  vehicle.getLicensePlate(), Toast.LENGTH_SHORT).show();
            }
        } else {
//            Toast.makeText(context,  vehicle.getLicensePlate(), Toast.LENGTH_SHORT).show();
        }
        if(ShareVehicleStatus.AVAILABLE.getValue().equals(vehicle.getSharingStatus())){
            if (currentTab == 0) {
                // Navigate to ShareVehicleAccessActivity with vehicle data
                Intent intent = new Intent(context, ShareVehicleAccessActivity.class);
                intent.putExtra("vehicle", vehicle);
                context.startActivity(intent);
            }
        }
        if(ShareVehicleStatus.PENDING.getValue().equals(vehicle.getSharingStatus())){
            if (currentTab == 0) {
                // Implement reject API call
                rejectVehicle(vehicle);
            }
        }
        dialog.dismiss();
    }
//    private void
    private void recallVehicle(Vehicle vehicle) {
        ShareVehicleApi api = ApiTest.getServiceLast(context).create(ShareVehicleApi.class);
        
        loadingDialog.show("Getting vehicle details...", true, () -> {
            Toast.makeText(context, "Operation cancelled", Toast.LENGTH_SHORT).show();
        });
        
        // Step 1: Get shared vehicle details using vehicle.getId()
        api.getSharedVehicleDetailsByVehicleId(vehicle.getId()).enqueue(new retrofit2.Callback<SharedVehicleDetails>() {
            @Override
            public void onResponse(retrofit2.Call<SharedVehicleDetails> call, retrofit2.Response<SharedVehicleDetails> response) {
                if (response.isSuccessful() && response.body() != null) {
                    SharedVehicleDetails sharedVehicleDetails = response.body();
                    
                    // Step 2: Call recall API with the shared vehicle ID
                    recallSharedVehicle(sharedVehicleDetails.getId());
                } else {
                    loadingDialog.dismiss();
                    Toast.makeText(context, "Failed to get vehicle details", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(retrofit2.Call<SharedVehicleDetails> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(context, "Network error getting vehicle details", Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void recallSharedVehicle(String sharedVehicleId) {
        ShareVehicleApi api = ApiTest.getServiceLast(context).create(ShareVehicleApi.class);
        
        loadingDialog.show("Recalling vehicle...", true, () -> {
            Toast.makeText(context, "Operation cancelled", Toast.LENGTH_SHORT).show();
        });
        
        api.recallSharedVehicle(sharedVehicleId).enqueue(new retrofit2.Callback<RecallResponse>() {
            @Override
            public void onResponse(retrofit2.Call<RecallResponse> call, retrofit2.Response<RecallResponse> response) {
                loadingDialog.dismiss();
                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(context, "Vehicle recalled successfully", Toast.LENGTH_SHORT).show();
                    refreshData();
                } else {
                    Toast.makeText(context, "Failed to recall vehicle", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(retrofit2.Call<RecallResponse> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(context, "Network error recalling vehicle", Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void rejectVehicle(Vehicle vehicle) {
        ShareVehicleApi api = ApiTest.getServiceLast(context).create(ShareVehicleApi.class);
        
        loadingDialog.show("Getting vehicle details...", true, () -> {
            Toast.makeText(context, "Operation cancelled", Toast.LENGTH_SHORT).show();
        });
        
        // Step 1: Get shared vehicle details using vehicle.getId()
        api.getSharedVehicleDetailsByVehicleId(vehicle.getId()).enqueue(new retrofit2.Callback<SharedVehicleDetails>() {
            @Override
            public void onResponse(retrofit2.Call<SharedVehicleDetails> call, retrofit2.Response<SharedVehicleDetails> response) {
                if (response.isSuccessful() && response.body() != null) {
                    SharedVehicleDetails sharedVehicleDetails = response.body();
                    
                    // Step 2: Call reject API with the shared vehicle ID
                    rejectSharedVehicle(sharedVehicleDetails.getId());
                } else {
                    loadingDialog.dismiss();
                    Toast.makeText(context, "Failed to get vehicle details", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(retrofit2.Call<SharedVehicleDetails> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(context, "Network error getting vehicle details", Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void rejectSharedVehicle(String sharedVehicleId) {
        ShareVehicleApi api = ApiTest.getServiceLast(context).create(ShareVehicleApi.class);
        
        loadingDialog.show("Rejecting invitation...", true, () -> {
            Toast.makeText(context, "Operation cancelled", Toast.LENGTH_SHORT).show();
        });
        
        api.rejectShareVehicle(sharedVehicleId).enqueue(new retrofit2.Callback<Void>() {
            @Override
            public void onResponse(retrofit2.Call<Void> call, retrofit2.Response<Void> response) {
                loadingDialog.dismiss();
                if (response.isSuccessful()) {
                    Toast.makeText(context, "Invitation rejected successfully", Toast.LENGTH_SHORT).show();
                    refreshData();
                } else {
                    Toast.makeText(context, "Failed to reject invitation", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(retrofit2.Call<Void> call, Throwable t) {
                loadingDialog.dismiss();
                Toast.makeText(context, "Network error rejecting invitation", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void refreshData(){
        // Notify fragment to refresh data
        if (actionCompletedListener != null) {
            actionCompletedListener.onActionCompleted();
        }
    }

    @Override
    public void onClose(Vehicle vehicle, AlertDialog dialog) {
        dialog.dismiss();
    }

}