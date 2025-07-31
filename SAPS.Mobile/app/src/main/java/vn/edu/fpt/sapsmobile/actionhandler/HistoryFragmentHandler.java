package vn.edu.fpt.sapsmobile.actionhandler;

import android.content.Context;
import android.content.Intent;

import vn.edu.fpt.sapsmobile.activities.ParkingLotSessionDetailActivity;
import vn.edu.fpt.sapsmobile.dialog.VehicleDetailDialog;
import vn.edu.fpt.sapsmobile.listener.HistoryFragmentListener;
import vn.edu.fpt.sapsmobile.listener.VehicleFragmentListener;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class HistoryFragmentHandler implements HistoryFragmentListener {
    private final Context context;
    // Truyền context khi khởi tạo

    public HistoryFragmentHandler(Context context) {
        this.context = context;
    }
    @Override
    public void onVehicleClicked(ParkingSession parkingSession, Vehicle vehicle, ParkingLot parkingLot) {
        Intent intent = new Intent(context, ParkingLotSessionDetailActivity.class);
        intent.putExtra("parkingSession", parkingSession);
        intent.putExtra("vehicle", vehicle);
        intent.putExtra("parkingLot", parkingLot);
        context.startActivity(intent);
    }
}
