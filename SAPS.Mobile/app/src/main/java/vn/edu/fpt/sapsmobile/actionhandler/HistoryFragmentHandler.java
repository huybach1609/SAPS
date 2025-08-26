package vn.edu.fpt.sapsmobile.actionhandler;

import androidx.appcompat.app.AlertDialog;
import android.content.Context;
import android.content.Intent;

import vn.edu.fpt.sapsmobile.activities.checkout.CheckoutActivity;
import vn.edu.fpt.sapsmobile.activities.ParkingHistoryDetailsActivity;
import vn.edu.fpt.sapsmobile.dialog.VehicleDetailDialog;
import vn.edu.fpt.sapsmobile.listener.HistoryFragmentVehicleDetailListener;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class HistoryFragmentHandler implements HistoryFragmentVehicleDetailListener {
    private final Context context;
    // Truyền context khi khởi tạo

    private ParkingSession parkingSession;
    private  Vehicle vehicle;
    private  ParkingLot parkingLot;



    public HistoryFragmentHandler(Context context) {
        this.context = context;
    }

    @Override
    public void onParkingSessionSeeDetailClick(String sessionId, Vehicle vehicle, ParkingLot parkingLot) {
        Intent intent = new Intent(context, ParkingHistoryDetailsActivity.class);
        intent.putExtra("vehicle", vehicle);
        intent.putExtra("sessionId", sessionId);
        intent.putExtra("parkingLot", parkingLot);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }
    @Override
    public void onParkingSessionClickToCheckOut(ParkingSession parkingSession, Vehicle vehicle, ParkingLot parkingLot) {
        this.parkingSession = parkingSession;
        this.parkingLot = parkingLot;
        this.vehicle = vehicle;
        VehicleDetailDialog.show(context, vehicle , this, -1);
    }

    @Override
    public void onAction(Vehicle vehicle, AlertDialog dialog) {
        // Đóng dialog
        dialog.dismiss();

        // Tạo Intent để chuyển sang CheckoutActivity
        Intent intent = new Intent(context, CheckoutActivity.class);

        // Truyền dữ liệu Vehicle (giả sử Vehicle implements Serializable hoặc Parcelable)
        intent.putExtra("vehicle", vehicle);
        intent.putExtra("parkingSession", parkingSession);
        intent.putExtra("parkingLot", parkingLot);

        // Bắt buộc phải thêm flag nếu context không phải là Activity
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        // Khởi chạy Activity
        context.startActivity(intent);
    }

    @Override
    public void onClose(Vehicle vehicle, AlertDialog dialog) {

        dialog.dismiss();
    }
}
