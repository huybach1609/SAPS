package vn.edu.fpt.sapsmobile.fragments;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Spinner;


import java.util.ArrayList;
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
    Spinner spinner;
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_history, container, false);
        // Initialize Adapter
        rvParkingHistory = view.findViewById(R.id.rvParkingHistory);
        parkingSessionAdapter = new ParkingSessionAdapter(new ArrayList<>(), new HistoryFragmentHandler(requireContext()), requireContext(), "historyFragment");
        rvParkingHistory.setAdapter(parkingSessionAdapter);

        rvParkingHistory.setLayoutManager(new LinearLayoutManager(getContext()));
        // Initialize spinner filter
        spinner = view.findViewById(R.id.spinnerFilter);
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(
                requireContext(),
                R.array.history_view_methods,
                android.R.layout.simple_spinner_item
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinner.setAdapter(adapter);

        return view;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // Initialize history list and data loading
        ParkingSessionApiService parkingSessionApi = ApiTest.getService(requireContext()).create(ParkingSessionApiService.class);
        parkingSessionApi.getParkingSessionListLast30days().enqueue(new Callback<List<ParkingSession>>() {
            @Override
            public void onResponse(Call<List<ParkingSession>> call, Response<List<ParkingSession>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    if (!isAdded() || getContext() == null) return;
                    parkingSessionList = response.body();
                    parkingSessionAdapter = new ParkingSessionAdapter(parkingSessionList, new HistoryFragmentHandler(requireContext()), requireContext(),"historyFragment");
                    rvParkingHistory.setAdapter(parkingSessionAdapter);
                } else {
                }
            }

            @Override
            public void onFailure(Call<List<ParkingSession>> call, Throwable t) {

            }
        });

        spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                switch (position) {
                    case 0:
                        // position 0: last 30 day
                        parkingSessionApi.getParkingSessionListLast30days().enqueue(new Callback<List<ParkingSession>>() {
                            @Override
                            public void onResponse(Call<List<ParkingSession>> call, Response<List<ParkingSession>> response) {
                                if (response.isSuccessful() && response.body() != null) {
                                    if (!isAdded() || getContext() == null) return;
                                    parkingSessionList = response.body();
                                    parkingSessionAdapter = new ParkingSessionAdapter(parkingSessionList, new HistoryFragmentHandler(requireContext()), requireContext(),"historyFragment");
                                    rvParkingHistory.setAdapter(parkingSessionAdapter);
                                } else {
                                }
                            }

                            @Override
                            public void onFailure(Call<List<ParkingSession>> call, Throwable t) {

                            }
                        });
                        break;
                    case 1:
                        // position 1: last 3 month
                        parkingSessionApi.getParkingSessionListLast3Months().enqueue(new Callback<List<ParkingSession>>() {
                            @Override
                            public void onResponse(Call<List<ParkingSession>> call, Response<List<ParkingSession>> response) {
                                if (response.isSuccessful() && response.body() != null) {
                                    if (!isAdded() || getContext() == null) return;
                                    parkingSessionList = response.body();
                                    parkingSessionAdapter = new ParkingSessionAdapter(parkingSessionList, new HistoryFragmentHandler(requireContext()), requireContext(),"historyFragment");
                                    rvParkingHistory.setAdapter(parkingSessionAdapter);
                                } else {
                                }
                            }

                            @Override
                            public void onFailure(Call<List<ParkingSession>> call, Throwable t) {

                            }
                        });
                        break;
                    case 2:
                        // position 2: last year
                        parkingSessionApi.getParkingSessionListLastYear().enqueue(new Callback<List<ParkingSession>>() {
                            @Override
                            public void onResponse(Call<List<ParkingSession>> call, Response<List<ParkingSession>> response) {
                                if (response.isSuccessful() && response.body() != null) {
                                    if (!isAdded() || getContext() == null) return;
                                    parkingSessionList = response.body();
                                    parkingSessionAdapter = new ParkingSessionAdapter(parkingSessionList, new HistoryFragmentHandler(requireContext()), requireContext(),"historyFragment");
                                    rvParkingHistory.setAdapter(parkingSessionAdapter);
                                } else {
                                }
                            }

                            @Override
                            public void onFailure(Call<List<ParkingSession>> call, Throwable t) {

                            }
                        });
                        break;
                    default:
                        parkingSessionApi.getParkingSessionListLast30days().enqueue(new Callback<List<ParkingSession>>() {
                            @Override
                            public void onResponse(Call<List<ParkingSession>> call, Response<List<ParkingSession>> response) {
                                if (response.isSuccessful() && response.body() != null) {
                                    if (!isAdded() || getContext() == null) return;
                                    parkingSessionList = response.body();
                                    parkingSessionAdapter = new ParkingSessionAdapter(parkingSessionList, new HistoryFragmentHandler(requireContext()), requireContext(),"historyFragment");
                                    rvParkingHistory.setAdapter(parkingSessionAdapter);
                                } else {
                                }
                            }

                            @Override
                            public void onFailure(Call<List<ParkingSession>> call, Throwable t) {

                            }
                        });
                        break;
                }
            }


            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                // Không làm gì nếu không chọn
            }
        });





    }

}
