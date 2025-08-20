package vn.edu.fpt.sapsmobile.fragments;

import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.bumptech.glide.Glide;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.service.ParkingSessionApiService;
import vn.edu.fpt.sapsmobile.network.service.IVehicleApi;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.HistoryFragmentHandler;
import vn.edu.fpt.sapsmobile.activities.NotificationsListActivity;
import vn.edu.fpt.sapsmobile.adapters.ParkingSessionParkingAdapter;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.OwnedSessionRequest;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.OwnedSessionResponse;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class HomeFragment extends Fragment {

    // UI Components
//    private RecyclerView rvParkingHistory;
    private RecyclerView rvCurrentSessions;
    private SwipeRefreshLayout swipeRefreshLayout;
    private TextView tvGreating;
    private Button btnCheckOut, btnNotification;

    private ImageView imageViewProfile;
    private View parkingSessionContainer, noSessionContainer;
    private TextView tvNoSessionMessage;

    // Data & Adapters
    private ParkingSessionParkingAdapter parkingSessionAdapter;
    private List<ParkingSession> parkingSessionList;

    private TokenManager tokenManager;


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        initializeComponents(view);
        setupStatusBar();
        setupSwipeRefresh(view);
        setupRecyclerView(view);

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            ImageView bg = view.findViewById(R.id.bgImage);
            bg.setRenderEffect(android.graphics.RenderEffect.createBlurEffect(
                    20f, 20f, android.graphics.Shader.TileMode.CLAMP  // radiusX, radiusY
            ));
        }

        return view;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        findViews(view);
        setupUserProfile();
        loadParkingSessionData();
    }

    // ================ INITIALIZATION METHODS ================

    private void initializeComponents(View view) {
        tokenManager = new TokenManager(getActivity());
//        durationHandler = new Handler(Looper.getMainLooper());
    }

    private void setupStatusBar() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = requireActivity().getWindow();
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(ContextCompat.getColor(getContext(), R.color.md_theme_primary));
        }
    }

    private void setupSwipeRefresh(View view) {
        swipeRefreshLayout = view.findViewById(R.id.swipeRefreshLayout);
        swipeRefreshLayout.setColorSchemeColors(
                ContextCompat.getColor(getContext(), R.color.md_theme_primary)
        );
        swipeRefreshLayout.setOnRefreshListener(() -> loadParkingSessionData());
    }

    private void setupRecyclerView(View view) {
        // current sessions list inside the card container
        rvCurrentSessions = view.findViewById(R.id.rvCurrentSessions);
        if (rvCurrentSessions != null) {
            rvCurrentSessions.setLayoutManager(new LinearLayoutManager(getContext()));
        }


        parkingSessionAdapter = new ParkingSessionParkingAdapter(
                new ArrayList<>(),
                new HistoryFragmentHandler(requireContext()),
                requireContext(),
                "homeFragment"
        );

        if (rvCurrentSessions != null) {
            rvCurrentSessions.setAdapter(parkingSessionAdapter);
        }

    }



    private void findViews(View view) {

        btnCheckOut = view.findViewById(R.id.btnCheckOut);
        btnNotification = view.findViewById(R.id.btnNotification);
        tvGreating = view.findViewById(R.id.tvGreeting);
        imageViewProfile = view.findViewById(R.id.profileImage);
        parkingSessionContainer = view.findViewById(R.id.parkingSessionContainer);
        noSessionContainer = view.findViewById(R.id.noSessionContainer);
        tvNoSessionMessage = view.findViewById(R.id.tvNoSessionMessage);

        setupBtnNotification();
    }

    private void setupUserProfile() {
        User user = tokenManager.getUserData();

        tvGreating.setText(getString(R.string.home_fragment_hello, user.getFullName()));

        if (imageViewProfile != null) {
            if (user.getProfileImageUrl() != null && !user.getProfileImageUrl().isEmpty()) {
                Log.i("ProfileImage", user.getProfileImageUrl());
                Glide.with(this)
                        .load(user.getProfileImageUrl())
                        .placeholder(R.drawable.ic_person)
                        .error(R.drawable.ic_person)
                        .circleCrop()
                        .into(imageViewProfile);
            } else {
                imageViewProfile.setImageResource(R.drawable.ic_person);
            }
        }
    }

    // ================ DATA LOADING METHODS ================

    private void loadParkingSessionData() {
        startRefreshing();
        resetSessionData();
        fetchOwnedSessions();
    }

    private void startRefreshing() {
        if (!swipeRefreshLayout.isRefreshing()) {
            swipeRefreshLayout.setRefreshing(true);
        }
    }

    private void resetSessionData() {
    }

    private void fetchOwnedSessions() {
        ParkingSessionApiService parkingSessionApi = ApiTest.getServiceLast(requireContext())
                .create(ParkingSessionApiService.class);

        List<OwnedSessionResponse.OwnedParkingSessionDto> sessionDtoList = new ArrayList<>();

        final AtomicInteger completedCalls = new AtomicInteger(0);
        final int totalCalls = 2;

        Runnable onCallComplete = () -> {
            if (completedCalls.incrementAndGet() == totalCalls) {
                swipeRefreshLayout.setRefreshing(false);
                if (sessionDtoList.isEmpty()) {
                    showNoSessionMessage();
                } else {
                    fetchVehiclesAndBind(sessionDtoList);
                }
            }
        };

        // Generic callback for both calls
        Callback<OwnedSessionResponse> sessionCallback = new Callback<OwnedSessionResponse>() {
            @Override
            public void onResponse(Call<OwnedSessionResponse> call, Response<OwnedSessionResponse> response) {
                if (!isAdded() || getContext() == null) {
                    swipeRefreshLayout.setRefreshing(false);
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
                    swipeRefreshLayout.setRefreshing(false);
                }
            }
        };

        // Make both calls simultaneously
        String userId = tokenManager.getUserData().getId();

        OwnedSessionRequest parkingRequest = new OwnedSessionRequest("Asc", "entryDateTime", "Parking");
        parkingSessionApi.getOwnedSessions(userId, parkingRequest).enqueue(sessionCallback);

        OwnedSessionRequest checkedOutRequest = new OwnedSessionRequest("Asc", "entryDateTime", "CheckedOut");
        parkingSessionApi.getOwnedSessions(userId, checkedOutRequest).enqueue(sessionCallback);
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
        IVehicleApi vehicleApi = ApiTest.getServiceLast(requireContext()).create(IVehicleApi.class);
        vehicleApi.getMyVehicles(null, null).enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                if (!isAdded() || getContext() == null) {
                    swipeRefreshLayout.setRefreshing(false);
                    return;
                }

                List<VehicleSummaryDto> vehicles = response.isSuccessful() && response.body() != null ? response.body() : new ArrayList<>();
                List<ParkingSession> mapped = mapDtosToSessions(dtoList, vehicles);
                parkingSessionList = mapped;
                parkingSessionAdapter.updateItems(parkingSessionList);

                if (parkingSessionContainer != null) {
                    parkingSessionContainer.setVisibility(View.GONE);
                }
                if (noSessionContainer != null) {
                    noSessionContainer.setVisibility(View.GONE);
                }

                swipeRefreshLayout.setRefreshing(false);
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                if (!isAdded() || getContext() == null) {
                    return;
                }
                List<ParkingSession> mapped = mapDtosToSessions(dtoList, new ArrayList<>());
                parkingSessionList = mapped;
                parkingSessionAdapter.updateItems(parkingSessionList);

                if (parkingSessionContainer != null) {
                    parkingSessionContainer.setVisibility(View.GONE);
                }
                if (noSessionContainer != null) {
                    noSessionContainer.setVisibility(View.GONE);
                }

                swipeRefreshLayout.setRefreshing(false);
            }
        });
    }

    private List<ParkingSession> mapDtosToSessions(List<OwnedSessionResponse.OwnedParkingSessionDto> dtoList, List<VehicleSummaryDto> vehicles) {
        List<ParkingSession> result = new ArrayList<>();
        for (OwnedSessionResponse.OwnedParkingSessionDto dto : dtoList) {
            ParkingSession ps = new ParkingSession();
            ps.setId(dto.getId());
            ps.setEntryDateTime(dto.getEntryDateTime());
            ps.setExitDateTime(dto.getExitDateTime());
            ps.setCost(dto.getCost());
            ps.setParkingLotName(dto.getParkingLotName());

            // map vehicle by license plate
            VehicleSummaryDto match = null;
            for (VehicleSummaryDto v : vehicles) {
                if (v.getLicensePlate() != null && v.getLicensePlate().equalsIgnoreCase(dto.getLicensePlate())) {
                    match = v; break;
                }
            }
            if (match != null) {
                Vehicle v = new Vehicle();
                v.setId(match.getId());
                v.setLicensePlate(match.getLicensePlate());
                v.setBrand(match.getBrand());
                v.setModel(match.getModel());
                ps.setVehicle(v);
                ps.setVehicleId(v.getId());
            } else {
                Vehicle v = new Vehicle();
                v.setLicensePlate(dto.getLicensePlate());
                ps.setVehicle(v);
            }
            result.add(ps);
        }
        return result;
    }



    private void setupBtnNotification() {
        btnNotification.setOnClickListener(v-> {
            Intent intent = new Intent(getActivity(), NotificationsListActivity.class);
            startActivity(intent);
        });
    }

   // ================ UI STATE METHODS ================



    private void showNoSessionMessage() {
        if (parkingSessionContainer != null) {
            parkingSessionContainer.setVisibility(View.GONE);
        }
        if (noSessionContainer != null) {
            noSessionContainer.setVisibility(View.GONE);
        }
    }



    // ================ LIFECYCLE METHODS ================

    @Override
    public void onPause() {
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
    }
}