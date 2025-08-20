package vn.edu.fpt.sapsmobile.listener;

import vn.edu.fpt.sapsmobile.models.Vehicle;

public interface VehicleFragmentVehicleDetailListener extends VehicleDetailListener {
    void onEditClicked(Vehicle vehicle);
    void onShareClicked(Vehicle vehicle);
    void onVehicleClicked(Vehicle vehicle);

}