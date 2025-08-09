package vn.edu.fpt.sapsmobile.listener;

import android.app.AlertDialog;

import vn.edu.fpt.sapsmobile.models.Vehicle;

public interface Listener {
    void onCheckout(Vehicle vehicle, AlertDialog dialog);
}
