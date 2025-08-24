package vn.edu.fpt.sapsmobile.listener;

import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public interface HistoryFragmentVehicleDetailListener extends VehicleDetailListener {
    void onParkingSessionSeeDetailClick(String sessionId, Vehicle vehicle, ParkingLot parkingLot);
    void onParkingSessionClickToCheckOut(ParkingSession parkingSession, Vehicle vehicle, ParkingLot parkingLot);
}

