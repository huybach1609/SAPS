package vn.edu.fpt.sapsmobile.listener;

import android.app.AlertDialog;

import vn.edu.fpt.sapsmobile.models.Vehicle;

public interface VehicleActionListener {
    void onEditClicked(Vehicle vehicle);
    void onShareClicked(Vehicle vehicle);
    void onVehicleClicked(Vehicle vehicle);
    void onCheckout(Vehicle vehicle, AlertDialog dialog);
}