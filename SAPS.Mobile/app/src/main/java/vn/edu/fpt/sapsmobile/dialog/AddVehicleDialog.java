package vn.edu.fpt.sapsmobile.dialog;

import android.app.Dialog;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import vn.edu.fpt.sapsmobile.R;

public class AddVehicleDialog {

    public interface AddVehicleListener {
        void onRegisterMyVehicle();
        void onReceiveFromShareCode();
    }

    public static void show(Context context, AddVehicleListener listener) {
        if (context == null) return;

        View dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_add_vehicle, null);

        Button btnRegisterMyVehicle = dialogView.findViewById(R.id.btnRegisterMyVehicle);
        Button btnReceiveFromShareCode = dialogView.findViewById(R.id.btnReceiveFromShareCode);

        Dialog dialog = new MaterialAlertDialogBuilder(context)
                .setView(dialogView)
                .create();

        btnRegisterMyVehicle.setOnClickListener(v -> {
            if (listener != null) listener.onRegisterMyVehicle();
            dialog.dismiss();
        });

        btnReceiveFromShareCode.setOnClickListener(v -> {
            if (listener != null) listener.onReceiveFromShareCode();
            dialog.dismiss();
        });

        dialog.show();
    }
}