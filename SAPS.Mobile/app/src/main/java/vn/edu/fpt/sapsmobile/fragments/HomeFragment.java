package vn.edu.fpt.sapsmobile.fragments;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.API.ApiTest;
import vn.edu.fpt.sapsmobile.API.apiinterface.ParkingLotApiService;
import vn.edu.fpt.sapsmobile.API.apiinterface.ParkingSessionApiService;
import vn.edu.fpt.sapsmobile.API.apiinterface.VehicleApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.HistoryFragmentHandler;
import vn.edu.fpt.sapsmobile.adapter.ParkingSessionAdapter;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.utils.DateTimeHelper;


public class HomeFragment extends Fragment {
    private RecyclerView rvParkingHistory;
    private ParkingSessionAdapter parkingSessionAdapter;
    private List<ParkingSession> parkingSessionList;
    TextView tvVehicle, tvLocation, tvEntryTime, tvDuration;
    Button btnCheckOut;
    ParkingSession session;
    Vehicle vehicle;
    ParkingLot parkingLot;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        rvParkingHistory = view.findViewById(R.id.rvParkingHistory);
        rvParkingHistory.setLayoutManager(new LinearLayoutManager(getContext()));

        parkingSessionAdapter = new ParkingSessionAdapter(new ArrayList<>(),
                new HistoryFragmentHandler(requireContext()),
                requireContext(),
                "homeFragment");
        rvParkingHistory.setAdapter(parkingSessionAdapter);

        return view;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        tvVehicle = view.findViewById(R.id.tvVehicle);
        tvLocation = view.findViewById(R.id.tvLocation);
        tvEntryTime = view.findViewById(R.id.tvEntryTime);
        tvDuration = view.findViewById(R.id.tvDuration);
        btnCheckOut = view.findViewById(R.id.btnCheckOut);

        // Gọi API lấy session mới nhất
        ParkingSessionApiService parkingSessionApi = ApiTest.getService(requireContext()).create(ParkingSessionApiService.class);
        parkingSessionApi.getParkingSessionLastestVehicleParking().enqueue(new Callback<ParkingSession>() {
            @Override
            public void onResponse(Call<ParkingSession> call, Response<ParkingSession> response) {
                if (!isAdded() || getContext() == null) return;

                if (response.isSuccessful() && response.body() != null) {
                    session = response.body();

//                     Hiển thị thời gian

                    tvEntryTime.setText(DateTimeHelper.formatDateTime(session.getEntryDateTime()));
                    LocalDateTime now = LocalDateTime.now();
                    tvDuration.setText(DateTimeHelper.calculateDuration(session.getEntryDateTime(),now.toString())+" onGoing");

                    // Gọi tiếp API lấy Vehicle
                    VehicleApiService vehicleApiService = ApiTest.getService(requireContext()).create(VehicleApiService.class);
                    vehicleApiService.getVehiclebyID(session.getVehicleId()).enqueue(new Callback<Vehicle>() {
                        @Override
                        public void onResponse(Call<Vehicle> call, Response<Vehicle> response) {
                            if (response.isSuccessful() && response.body() != null) {
                                vehicle = response.body();
                                tvVehicle.setText(vehicle.getBrand() + " " + vehicle.getModel() + " " + vehicle.getLicensePlate());

                            }
                        }

                        @Override
                        public void onFailure(Call<Vehicle> call, Throwable t) { }
                    });

                    // Gọi tiếp API lấy ParkingLot
                    ParkingLotApiService parkingLotApiService = ApiTest.getService(requireContext()).create(ParkingLotApiService.class);
                    parkingLotApiService.getParkingLotById(session.getParkingLotId()).enqueue(new Callback<ParkingLot>() {
                        @Override
                        public void onResponse(Call<ParkingLot> call, Response<ParkingLot> response) {
                            if (response.isSuccessful() && response.body() != null) {
                                parkingLot = response.body();
                                tvLocation.setText(parkingLot.getName() + " - " + parkingLot.getAddress());
                            }
                        }

                        @Override
                        public void onFailure(Call<ParkingLot> call, Throwable t) { }
                    });
                    btnCheckOut.setOnClickListener(v -> {
                        HistoryFragmentHandler handler = new HistoryFragmentHandler(requireContext());
                        handler.onParkingSessionClickToCheckOut(session,vehicle,parkingLot);
                    });
                }
            }

            @Override
            public void onFailure(Call<ParkingSession> call, Throwable t) {

            }
        });


        // Lấy lịch sử
        parkingSessionApi.getParkingSessionOf5VehicleLastest().enqueue(new Callback<List<ParkingSession>>() {
            @Override
            public void onResponse(Call<List<ParkingSession>> call, Response<List<ParkingSession>> response) {
                if (!isAdded() || getContext() == null) return;

                if (response.isSuccessful() && response.body() != null) {
                    parkingSessionList = response.body();
                    parkingSessionAdapter = new ParkingSessionAdapter(
                            parkingSessionList,
                            new HistoryFragmentHandler(requireContext()),
                            requireContext(),
                            "homeFragment"
                    );
                    rvParkingHistory.setAdapter(parkingSessionAdapter);
                }
            }

            @Override
            public void onFailure(Call<List<ParkingSession>> call, Throwable t) {

            }
        });
    }

}
