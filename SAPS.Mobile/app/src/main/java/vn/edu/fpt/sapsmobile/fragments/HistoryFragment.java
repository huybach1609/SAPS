package vn.edu.fpt.sapsmobile.fragments;

import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;

import com.google.android.material.textfield.TextInputLayout;

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
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;

public class HistoryFragment extends Fragment {
    private RecyclerView rvParkingHistory;
    private ParkingSessionAdapter parkingSessionAdapter;
    private List<ParkingSession> parkingSessionList;
    private TextInputLayout spinnerFilter;
    private AutoCompleteTextView autoCompleteTextView;
    private LoadingDialog loadingDialog;

    private Call<List<ParkingSession>> currentCall;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_history, container, false);

        // Set status bar color
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = requireActivity().getWindow();
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.TRANSPARENT);

        }



        loadingDialog = new LoadingDialog(getActivity());
        // Initialize Adapter
        rvParkingHistory = view.findViewById(R.id.rvParkingHistory);

        parkingSessionAdapter = new ParkingSessionAdapter(
                new ArrayList<>(),
                new HistoryFragmentHandler(requireContext()),
                requireContext(),
                "historyFragment");

        rvParkingHistory.setAdapter(parkingSessionAdapter);

        rvParkingHistory.setLayoutManager(new LinearLayoutManager(getContext()));

        // Initialize Material 3 dropdown filter
        spinnerFilter = view.findViewById(R.id.spinnerFilter);
        autoCompleteTextView = (AutoCompleteTextView) spinnerFilter.getEditText();

        // Get filter options from string array resource
        String[] filterOptions = getResources().getStringArray(R.array.history_view_methods);

        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                requireContext(),
                android.R.layout.simple_dropdown_item_1line,
                filterOptions
        );

        autoCompleteTextView.setAdapter(adapter);

        // Set default selection (first item)
        if (filterOptions.length > 0) {
            autoCompleteTextView.setText(filterOptions[0], false);
        }

        return view;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Initialize history list and data loading
        ParkingSessionApiService parkingSessionApi = ApiTest.getService(requireContext()).create(ParkingSessionApiService.class);

        // Load initial data (last 30 days)
        loadParkingSessionData(parkingSessionApi, 0);

        // Handle dropdown selection
        autoCompleteTextView.setOnItemClickListener((parent, view1, position, id) -> {
            loadParkingSessionData(parkingSessionApi, position);
        });
    }

    private void loadParkingSessionData(ParkingSessionApiService api, int filterPosition) {
        if (currentCall != null) currentCall.cancel(); // cancel previous request

        switch (filterPosition) {
            case 0: currentCall = api.getParkingSessionListLast30days(); break;
            case 1: currentCall = api.getParkingSessionListLast3Months(); break;
            case 2: currentCall = api.getParkingSessionListLastYear(); break;
            default: currentCall = api.getParkingSessionListLast30days(); break;
        }

        loadingDialog.show("");

        currentCall.enqueue(new Callback<List<ParkingSession>>() {
            @Override
            public void onResponse(Call<List<ParkingSession>> call, Response<List<ParkingSession>> response) {
                if (!isAdded()) { loadingDialog.hide(); return; }

                if (response.isSuccessful() && response.body() != null) {
                    parkingSessionList = response.body();
                    parkingSessionAdapter.updateItems(parkingSessionList);
                }
                loadingDialog.hide();
            }

            @Override
            public void onFailure(Call<List<ParkingSession>> call, Throwable t) {
                // If call was cancelled due to navigation, just ensure dialog is hidden
                loadingDialog.hide();
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (loadingDialog != null) loadingDialog.hide();
        if (currentCall != null) currentCall.cancel(); // explained below
    }

    public void onStop() {
        super.onStop();
        if (loadingDialog != null) loadingDialog.hide();
    }
}