package vn.edu.fpt.sapsmobile.dialog;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.textview.MaterialTextView;
import androidx.appcompat.app.AlertDialog;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.listener.VehicleDetailListener;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class VehicleDetailDialog {

    public static void show(Context context, Vehicle vehicle, VehicleDetailListener vehicleDetailListener) {
        View dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_vehicle_detail, null);

        // Use MaterialTextView instead of TextView
        MaterialTextView tvLicense = dialogView.findViewById(R.id.tvDetailLicense);
        MaterialTextView tvBrand = dialogView.findViewById(R.id.tvDetailBrand);
        MaterialTextView tvModel = dialogView.findViewById(R.id.tvDetailModel);
        MaterialTextView tvColor = dialogView.findViewById(R.id.tvDetailColor);
        MaterialTextView tvStatus = dialogView.findViewById(R.id.tvDetailStatus);
        MaterialButton btnCheckout = dialogView.findViewById(R.id.btnCheckout);
        MaterialButton btnCancel = dialogView.findViewById(R.id.btnCancel);


        // Set vehicle data
        tvLicense.setText(vehicle.getLicensePlate());
        tvBrand.setText(vehicle.getBrand());
        tvModel.setText(vehicle.getModel());
        tvColor.setText(vehicle.getColor());
        tvStatus.setText(vehicle.getSharingStatus());

        // Use MaterialAlertDialogBuilder for Material 3 styling
        AlertDialog dialog = new MaterialAlertDialogBuilder(context)
                .setView(dialogView)
                .create();

        btnCheckout.setOnClickListener(v -> {
            vehicleDetailListener.onCheckout(vehicle, dialog);
        });
        btnCancel.setOnClickListener(v -> {
            vehicleDetailListener.onClose(vehicle, dialog);
        });

        dialog.show();
    }
}