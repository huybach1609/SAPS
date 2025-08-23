package vn.edu.fpt.sapsmobile.listener;


import vn.edu.fpt.sapsmobile.models.Vehicle;
import androidx.appcompat.app.AlertDialog;


public interface VehicleDetailListener {
    void onAction(Vehicle vehicle, AlertDialog dialog);
    void onClose(Vehicle vehicle, AlertDialog dialog);
}
