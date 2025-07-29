package vn.edu.fpt.sapsmobile.dialog;

import android.app.AlertDialog;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.listener.VehicleFragmentListener;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class VehicleDetailDialog {
    public static void show(Context context, Vehicle vehicle, VehicleFragmentListener listener) {
        View dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_vehicle_detail, null);

        TextView tvLicense = dialogView.findViewById(R.id.tvDetailLicense);
        TextView tvBrand = dialogView.findViewById(R.id.tvDetailBrand);
        TextView tvModel = dialogView.findViewById(R.id.tvDetailModel);
        TextView tvColor = dialogView.findViewById(R.id.tvDetailColor);
        TextView tvStatus = dialogView.findViewById(R.id.tvDetailStatus);
        Button btnCheckout = dialogView.findViewById(R.id.btnCheckout);

        tvLicense.setText(vehicle.getLicensePlate());
        tvBrand.setText(vehicle.getBrand());
        tvModel.setText(vehicle.getModel());
        tvColor.setText(vehicle.getColor());
        tvStatus.setText(vehicle.getSharingStatus());

        AlertDialog dialog = new AlertDialog.Builder(context)
                .setView(dialogView)
                .create();

        btnCheckout.setOnClickListener(v -> {
            //gọi qua biến instance listener
            listener.onCheckout(vehicle, dialog);
        });

        dialog.show();
    }
}
