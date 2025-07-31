package vn.edu.fpt.sapsmobile.fragments;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;


import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.API.ApiTest;
import vn.edu.fpt.sapsmobile.API.apiinterface.ParkingSessionApiService;
import vn.edu.fpt.sapsmobile.API.apiinterface.VehicleApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.HistoryFragmentHandler;
import vn.edu.fpt.sapsmobile.actionhandler.VehicleFragmentHandler;
import vn.edu.fpt.sapsmobile.adapter.ParkingSessionAdapter;
import vn.edu.fpt.sapsmobile.adapter.VehicleAdapter;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;


public class HistoryFragment extends Fragment {
    private RecyclerView rvParkingHistory;
    private ParkingSessionAdapter parkingSessionAdapter;
    private List<ParkingSession> parkingSessionList;
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_history, container, false);

        rvParkingHistory = view.findViewById(R.id.rvParkingHistory);
        rvParkingHistory.setLayoutManager(new LinearLayoutManager(getContext()));

        return view;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // Initialize history list and data loading
        ParkingSessionApiService parkingSessionApi = ApiTest.getService(requireContext()).create(ParkingSessionApiService.class);
        parkingSessionApi.getParkingSessionList().enqueue(new Callback<List<ParkingSession>>() {
            @Override
            public void onResponse(Call<List<ParkingSession>> call, Response<List<ParkingSession>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    parkingSessionList = response.body();
                    parkingSessionAdapter = new ParkingSessionAdapter(parkingSessionList, new HistoryFragmentHandler(requireContext()));
                    rvParkingHistory.setAdapter(parkingSessionAdapter);
                } else {
                }
            }

            @Override
            public void onFailure(Call<List<ParkingSession>> call, Throwable t) {

            }
        });
    }
}
