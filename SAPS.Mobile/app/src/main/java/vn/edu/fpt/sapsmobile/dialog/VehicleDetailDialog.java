package vn.edu.fpt.sapsmobile.dialog;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.textview.MaterialTextView;

import androidx.appcompat.app.AlertDialog;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.enums.ShareVehicleStatus;
import vn.edu.fpt.sapsmobile.listener.VehicleDetailListener;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class VehicleDetailDialog {
    private static String TAG = "VehicleDetailDialog";

    public static void show(Context context, Vehicle vehicle, VehicleDetailListener vehicleDetailListener, int currentTab) {
        View dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_vehicle_detail, null);

        // Use MaterialTextView instead of TextView
        MaterialTextView tvLicense = dialogView.findViewById(R.id.tvDetailLicense);
        MaterialTextView tvBrand = dialogView.findViewById(R.id.tvDetailBrand);
        MaterialTextView tvModel = dialogView.findViewById(R.id.tvDetailModel);
        MaterialTextView tvColor = dialogView.findViewById(R.id.tvDetailColor);
        MaterialTextView tvStatus = dialogView.findViewById(R.id.tvDetailStatus);
        MaterialButton btnAction = dialogView.findViewById(R.id.btnCheckout);
        MaterialButton btnCancel = dialogView.findViewById(R.id.btnCancel);


        Log.i(TAG, "show: " + vehicle.toString());
        // Set vehicle data
        tvLicense.setText(vehicle.getLicensePlate());
        tvBrand.setText(vehicle.getBrand());
        tvModel.setText(vehicle.getModel());
        tvColor.setText(vehicle.getColor());
        tvStatus.setText(vehicle.getSharingStatus());

        if (ShareVehicleStatus.SHARED.getValue().equals(vehicle.getSharingStatus())) {
            if (currentTab == 0) {
                btnAction.setText(R.string.vehicle_detail_dialog_recall);
            } else if (currentTab == 1) {
                btnAction.setText(R.string.vehicle_detail_dialog_remove);
                btnAction.setVisibility(View.GONE);
            } else {
                btnAction.setVisibility(View.GONE);
            }
        } else {
            btnAction.setVisibility(View.GONE);
        }
        if(ShareVehicleStatus.AVAILABLE.getValue().equals(vehicle.getSharingStatus())){
            if (currentTab == 0) {
                btnAction.setText(R.string.vehicle_detail_dialog_share);
                btnAction.setVisibility(View.VISIBLE);
            }
        }
        if(ShareVehicleStatus.PENDING.getValue().equals(vehicle.getSharingStatus())){
            if (currentTab == 0) {
                btnAction.setText(R.string.btn_decline_access);
                btnAction.setVisibility(View.VISIBLE);
            }
        }

        // Use MaterialAlertDialogBuilder for Material 3 styling
        AlertDialog dialog = new MaterialAlertDialogBuilder(context)
                .setView(dialogView)
                .create();

        btnAction.setOnClickListener(v -> {
            String title = context.getString(R.string.dialog_confirm_action_title);
            String message = context.getString(R.string.dialog_confirm_action_message);
            
            // Set specific messages based on vehicle status and action
            if (ShareVehicleStatus.SHARED.getValue().equals(vehicle.getSharingStatus())) {
                title = context.getString(R.string.dialog_confirm_recall_title);
                message = context.getString(R.string.dialog_confirm_recall_message);
            } else if (ShareVehicleStatus.PENDING.getValue().equals(vehicle.getSharingStatus())) {
                title = context.getString(R.string.dialog_confirm_reject_title);
                message = context.getString(R.string.dialog_confirm_reject_message);
            } else if (ShareVehicleStatus.AVAILABLE.getValue().equals(vehicle.getSharingStatus())) {
                title = context.getString(R.string.dialog_confirm_share_title);
                message = context.getString(R.string.dialog_confirm_share_message);
            }
            
            new AlertDialog.Builder(v.getContext())
                    .setTitle(title)
                    .setMessage(message)
                    .setPositiveButton(context.getString(R.string.dialog_yes), (dialogInterface, which) -> {
                        vehicleDetailListener.onAction(vehicle, dialog);
                    })
                    .setNegativeButton(context.getString(R.string.dialog_no), (dialogInterface, which) -> {
                        dialogInterface.dismiss();
                    })
                    .show();
        });
        btnCancel.setOnClickListener(v -> {
            vehicleDetailListener.onClose(vehicle, dialog);
        });

        dialog.show();
    }
}