package vn.edu.fpt.sapsmobile.actionhandler;
import android.content.Context;
import android.widget.Toast;

import vn.edu.fpt.sapsmobile.adapter.VehicleAdapter;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class VehicleActionHandler implements VehicleAdapter.OnVehicleActionListener {

    private Context context;

    public VehicleActionHandler(Context context) {
        this.context = context;
    }

    @Override
    public void onEditClicked(Vehicle vehicle) {
        // Thực hiện logic khi nhấn Edit
        Toast.makeText(context, "Edit: " + vehicle.getLicensePlate(), Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onShareClicked(Vehicle vehicle) {
        // Thực hiện logic khi nhấn Share
        Toast.makeText(context, "Share: " + vehicle.getLicensePlate(), Toast.LENGTH_SHORT).show();
    }
}