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
    @GET("/parkingsession")
    Call<List<ParkingSession>> getParkingSessionList();
}
