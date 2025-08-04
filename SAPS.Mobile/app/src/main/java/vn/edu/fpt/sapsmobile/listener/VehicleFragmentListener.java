package vn.edu.fpt.sapsmobile.listener;

import android.app.AlertDialog;

import vn.edu.fpt.sapsmobile.models.Vehicle;

public interface VehicleFragmentListener  extends Listener {
    void onEditClicked(Vehicle vehicle);
    void onShareClicked(Vehicle vehicle);
    void onVehicleClicked(Vehicle vehicle);

}