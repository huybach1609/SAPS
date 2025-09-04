package vn.edu.fpt.sapsmobile.fragments;

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
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;

import com.google.android.material.textfield.TextInputLayout;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.OwnedSessionRequest;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.OwnedSessionResponse;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;
import vn.edu.fpt.sapsmobile.network.client.ApiClient;
import vn.edu.fpt.sapsmobile.network.api.IVehicleApi;
import vn.edu.fpt.sapsmobile.network.api.IParkingSessionApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.HistoryFragmentHandler;
import vn.edu.fpt.sapsmobile.adapters.ParkingSessionAdapter;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class HistoryFragment extends Fragment {
    private RecyclerView rvParkingHistory;
    private ParkingSessionAdapter parkingSessionAdapter;
    private List<OwnedSessionResponse.OwnedParkingSessionDto> parkingSessionList;
    private TextInputLayout spinnerFilter;
    private AutoCompleteTextView autoCompleteTextView;
    private LoadingDialog loadingDialog;
    private TokenManager tokenManager;
    private View emptyStateLayout;

    private Call<OwnedSessionResponse> currentCall;

    // Filter constants
    private static final String FILTER_LAST_30_DAYS = "Last 30 days";
    private static final String FILTER_LAST_3_MONTHS = "Last 3 months";
    private static final String FILTER_LAST_YEAR = "Last year";
    private static final String FILTER_ALL = "All time";

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

        tokenManager = new TokenManager(getContext());
        loadingDialog = new LoadingDialog(getActivity());

        // Initialize views
        rvParkingHistory = view.findViewById(R.id.rvParkingHistory);
        emptyStateLayout = view.findViewById(R.id.emptyStateLayout);

        parkingSessionAdapter = new ParkingSessionAdapter(
                new ArrayList<>(),
                new HistoryFragmentHandler(requireContext()),
                requireContext(),
                "historyFragment");

        rvParkingHistory.setAdapter(parkingSessionAdapter);

        rvParkingHistory.setLayoutManager(new LinearLayoutManager(getContext()));

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

        // Load initial data
        loadParkingSessionData();

        // Handle dropdown selection
        autoCompleteTextView.setOnItemClickListener((parent, view1, position, id) -> {
            loadParkingSessionData();
        });
    }

    private void loadParkingSessionData() {
        if (currentCall != null) currentCall.cancel(); // cancel previous request

        loadingDialog.show("");
        fetchOwnedSessions();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        if (loadingDialog != null) loadingDialog.dismiss();
        if (currentCall != null) currentCall.cancel(); // explained below
    }

    public void onStop() {
        super.onStop();
        if (loadingDialog != null) loadingDialog.dismiss();
    }

    private void fetchOwnedSessions() {
        IParkingSessionApiService parkingSessionApi = ApiClient.getServiceLast(requireContext())
                .create(IParkingSessionApiService.class);

        List<OwnedSessionResponse.OwnedParkingSessionDto> sessionDtoList = new ArrayList<>();

        final AtomicInteger completedCalls = new AtomicInteger(0);
        final int totalCalls = 1;

        Runnable onCallComplete = () -> {
            if (completedCalls.incrementAndGet() == totalCalls) {
                loadingDialog.dismiss();
                if (!sessionDtoList.isEmpty()) {
                    fetchVehiclesAndBind(sessionDtoList);
                } else {
                    // Handle empty results
                    parkingSessionList = new ArrayList<>();
                    parkingSessionAdapter.updateItems(parkingSessionList);
                    showEmptyState();
                }
            }
        };

        // Generic callback for both calls
        Callback<OwnedSessionResponse> sessionCallback = new Callback<OwnedSessionResponse>() {
            @Override
            public void onResponse(Call<OwnedSessionResponse> call, Response<OwnedSessionResponse> response) {
                if (!isAdded() || getContext() == null) {
                    loadingDialog.dismiss();
                    return;
                }

                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    synchronized (sessionDtoList) {
                        addUniqueItems(sessionDtoList, response.body().getData());
                    }
                }
                onCallComplete.run();
            }

            @Override
            public void onFailure(Call<OwnedSessionResponse> call, Throwable t) {
                if (isAdded() && getContext() != null) {
                    // Continue even if one call fails
                    onCallComplete.run();
                } else {
                    loadingDialog.dismiss();
                }
            }
        };

        // Make the API call
        String userId = tokenManager.getUserData().getId();
        OwnedSessionRequest parkingRequest = new OwnedSessionRequest("Desc", "entryDateTime", "Parking");
        parkingRequest.setStatus(null);

        currentCall = parkingSessionApi.getOwnedSessions(
                userId,
                parkingRequest.getStatus(),
                parkingRequest.getStartEntryDate() != null ? parkingRequest.getStartEntryDate().toString() : null,
                parkingRequest.getEndEntryDate() != null ? parkingRequest.getEndEntryDate().toString() : null,
                parkingRequest.getStartExitDate() != null ? parkingRequest.getStartExitDate().toString() : null,
                parkingRequest.getEndExitDate() != null ? parkingRequest.getEndExitDate().toString() : null,
                parkingRequest.getOrder(),
                parkingRequest.getSortBy(),
                parkingRequest.getSearchCriteria()
        );
        currentCall.enqueue(sessionCallback);
    }

    private void addUniqueItems(List<OwnedSessionResponse.OwnedParkingSessionDto> target,
                                List<OwnedSessionResponse.OwnedParkingSessionDto> source) {
        for (OwnedSessionResponse.OwnedParkingSessionDto dto : source) {
            boolean exists = target.stream()
                    .anyMatch(existing -> existing.getId() != null && existing.getId().equals(dto.getId()));
            if (!exists) {
                target.add(dto);
            }
        }
    }

    private void fetchVehiclesAndBind(List<OwnedSessionResponse.OwnedParkingSessionDto> dtoList) {
        IVehicleApi vehicleApi = ApiClient.getServiceLast(requireContext()).create(IVehicleApi.class);
        vehicleApi.getMyVehicles(null, null).enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                List<VehicleSummaryDto> vehicles = response.isSuccessful() && response.body() != null ? response.body() : new ArrayList<>();

                // Update the adapter with the DTOs directly
                parkingSessionList = dtoList;
                parkingSessionAdapter.updateItems(parkingSessionList);
                parkingSessionAdapter.setVehicles(vehicles);

                // Show/hide empty state based on data
                if (parkingSessionList.isEmpty()) {
                    showEmptyState();
                } else {
                    hideEmptyState();
                }
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                if (!isAdded() || getContext() == null) {
                    return;
                }
                // Update the adapter with the DTOs directly even if vehicle fetch fails
                parkingSessionList = dtoList;
                parkingSessionAdapter.updateItems(parkingSessionList);
                parkingSessionAdapter.setVehicles(new ArrayList<>());

                // Show/hide empty state based on data
                if (parkingSessionList.isEmpty()) {
                    showEmptyState();
                } else {
                    hideEmptyState();
                }
            }
        });
    }

    private void showEmptyState() {
        if (emptyStateLayout != null) {
            emptyStateLayout.setVisibility(View.VISIBLE);
        }
        if (rvParkingHistory != null) {
            rvParkingHistory.setVisibility(View.GONE);
        }
    }

    private void hideEmptyState() {
        if (emptyStateLayout != null) {
            emptyStateLayout.setVisibility(View.GONE);
        }
        if (rvParkingHistory != null) {
            rvParkingHistory.setVisibility(View.VISIBLE);
        }
    }
}