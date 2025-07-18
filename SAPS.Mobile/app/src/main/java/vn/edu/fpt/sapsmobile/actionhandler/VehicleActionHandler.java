package vn.edu.fpt.sapsmobile.actionhandler;

import android.app.AlertDialog;
import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.CheckoutActivity;
import vn.edu.fpt.sapsmobile.dialog.VehicleDetailDialog;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.listener.VehicleActionListener;

public class VehicleActionHandler implements VehicleActionListener {

    private final Context context;

    public VehicleActionHandler(Context context) {
        this.context = context;
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
        VehicleDetailDialog.show(context, vehicle , this);
    }
    @Override
    public void onCheckout(Vehicle vehicle, AlertDialog dialog) {
        // Đóng dialog
        dialog.dismiss();

        // Tạo Intent để chuyển sang CheckoutActivity
        Intent intent = new Intent(context, CheckoutActivity.class);

        // Truyền dữ liệu Vehicle (giả sử Vehicle implements Serializable hoặc Parcelable)
        intent.putExtra("vehicle", vehicle);

        // Bắt buộc phải thêm flag nếu context không phải là Activity
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        // Khởi chạy Activity
        context.startActivity(intent);
    }

}