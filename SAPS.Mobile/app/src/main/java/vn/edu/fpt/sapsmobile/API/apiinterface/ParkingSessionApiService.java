package vn.edu.fpt.sapsmobile.API.apiinterface;
import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;

import retrofit2.http.Path;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public interface ParkingSessionApiService {
    @GET("/parkingsession/{vehicleID}")
    Call<ParkingSession> getParkingSessionToCheckOut(@Path("vehicleID") String vehicleID);
    @GET("/parkingsessionLast30days")
    Call<List<ParkingSession>> getParkingSessionListLast30days();
    @GET("/parkingsessionLast3Months")
    Call<List<ParkingSession>> getParkingSessionListLast3Months();
    @GET("/parkingsessionLastYear")
    Call<List<ParkingSession>> getParkingSessionListLastYear();
    @GET("/parkingsessionOfVehicleParkingList")
    Call<List<ParkingSession>> getParkingSessionOfVehicleParkingList();
    @GET("/parkingsessionLastestVehicleParking")
    Call<ParkingSession> getParkingSessionLastestVehicleParking();

}
