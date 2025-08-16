package vn.edu.fpt.sapsmobile.fragments;

import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.API.ApiTest;
import vn.edu.fpt.sapsmobile.API.apiinterface.ParkingLotApiService;
import vn.edu.fpt.sapsmobile.API.apiinterface.ParkingSessionApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.HistoryFragmentHandler;
import vn.edu.fpt.sapsmobile.activities.NotificationsListActivity;
import vn.edu.fpt.sapsmobile.adapter.ParkingSessionAdapter;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.utils.DateTimeHelper;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class HomeFragment extends Fragment {

    // UI Components
    private RecyclerView rvParkingHistory;
    private SwipeRefreshLayout swipeRefreshLayout;
    private TextView tvVehicle, tvLocation, tvEntryTime, tvDuration, tvGreating;
    private Button btnCheckOut, btnNotification;

    private ImageView imageViewProfile;
    private View parkingSessionContainer, noSessionContainer;
    private TextView tvNoSessionMessage;

    // Data & Adapters
    private ParkingSessionAdapter parkingSessionAdapter;
    private List<ParkingSession> parkingSessionList;
    private ParkingSession session;
    private Vehicle vehicle;
    private ParkingLot parkingLot;
    private TokenManager tokenManager;

    // Timer for duration updates
    private Handler durationHandler;
    private Runnable durationRunnable;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        initializeComponents(view);
        setupStatusBar();
        setupSwipeRefresh(view);
        setupRecyclerView(view);
        setupDurationTimer();

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
        durationHandler = new Handler(Looper.getMainLooper());
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
        rvParkingHistory = view.findViewById(R.id.rvParkingHistory);
        rvParkingHistory.setLayoutManager(new LinearLayoutManager(getContext()));

        parkingSessionAdapter = new ParkingSessionAdapter(
                new ArrayList<>(),
                new HistoryFragmentHandler(requireContext()),
                requireContext(),
                "homeFragment"
        );
        rvParkingHistory.setAdapter(parkingSessionAdapter);
    }

    private void setupDurationTimer() {
        durationRunnable = new Runnable() {
            @Override
            public void run() {
                if (session != null && tvDuration != null) {
                    LocalDateTime now = LocalDateTime.now();
                    tvDuration.setText(DateTimeHelper.calculateDuration(session.getEntryDateTime(), now.toString()));
                }
                durationHandler.postDelayed(this, 1000);
            }
        };
    }

    private void findViews(View view) {
        tvVehicle = view.findViewById(R.id.tvVehicle);
        tvLocation = view.findViewById(R.id.tvLocation);
        tvEntryTime = view.findViewById(R.id.tvEntryTime);
        tvDuration = view.findViewById(R.id.tvDuration);
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
        fetchLatestParkingSession();
    }

    private void startRefreshing() {
        if (!swipeRefreshLayout.isRefreshing()) {
            swipeRefreshLayout.setRefreshing(true);
        }

        if (durationHandler != null && durationRunnable != null) {
            durationHandler.removeCallbacks(durationRunnable);
        }
    }

    private void resetSessionData() {
        session = null;
        vehicle = null;
        parkingLot = null;
    }

    private void fetchLatestParkingSession() {
        ParkingSessionApiService parkingSessionApi = ApiTest.getService(requireContext())
                .create(ParkingSessionApiService.class);

        parkingSessionApi.getParkingSessionLastestVehicleParking(tokenManager.getUserData().getId())
                .enqueue(new Callback<ParkingSession>() {
                    @Override
                    public void onResponse(Call<ParkingSession> call, Response<ParkingSession> response) {
                        if (!isAdded() || getContext() == null) {
                            swipeRefreshLayout.setRefreshing(false);
                            return;
                        }

                        if (response.isSuccessful() && response.body() != null) {
                            handleSuccessfulSessionResponse(response.body());
                        } else {
                            handleNoSessionFound();
                        }
                    }

                    @Override
                    public void onFailure(Call<ParkingSession> call, Throwable t) {
                        if (isAdded() && getContext() != null) {
                            swipeRefreshLayout.setRefreshing(false);
                        }
                    }
                });
    }

    private void handleSuccessfulSessionResponse(ParkingSession parkingSession) {
        session = parkingSession;

        showParkingSessionInfo();
        updateSessionUI();
        startDurationTimer();
        fetchParkingLotDetails();
        setupCheckoutButton();
    }

    private void setupBtnNotification() {
        btnNotification.setOnClickListener(v-> {
            Intent intent = new Intent(getActivity(), NotificationsListActivity.class);
            startActivity(intent);
        });
    }

    private void updateSessionUI() {
        tvEntryTime.setText(DateTimeHelper.formatDateTime(session.getEntryDateTime()));

        LocalDateTime now = LocalDateTime.now();
        tvDuration.setText(DateTimeHelper.calculateDuration(session.getEntryDateTime(), now.toString()));

        String vehicleInfo = session.getVehicle().getBrand() + " " +
                session.getVehicle().getModel() + " " +
                session.getVehicle().getLicensePlate();
        tvVehicle.setText(vehicleInfo);
    }

    private void startDurationTimer() {
        durationHandler.post(durationRunnable);
    }

    private void fetchParkingLotDetails() {
        ParkingLotApiService parkingLotApiService = ApiTest.getService(requireContext())
                .create(ParkingLotApiService.class);

        parkingLotApiService.getParkingLotById(session.getParkingLotId())
                .enqueue(new Callback<ParkingLot>() {
                    @Override
                    public void onResponse(Call<ParkingLot> call, Response<ParkingLot> response) {
                        if (!isAdded() || getContext() == null) {
                            swipeRefreshLayout.setRefreshing(false);
                            return;
                        }

                        if (response.isSuccessful() && response.body() != null) {
                            parkingLot = response.body();
                            tvLocation.setText(parkingLot.getName() + " - " + parkingLot.getAddress());
                        }

                        swipeRefreshLayout.setRefreshing(false);
                    }

                    @Override
                    public void onFailure(Call<ParkingLot> call, Throwable t) {
                        if (isAdded() && getContext() != null) {
                            swipeRefreshLayout.setRefreshing(false);
                        }
                    }
                });
    }

    private void setupCheckoutButton() {
        btnCheckOut.setOnClickListener(v -> {
            HistoryFragmentHandler handler = new HistoryFragmentHandler(requireContext());
            handler.onParkingSessionClickToCheckOut(session, vehicle, parkingLot);
        });

    }

    private void handleNoSessionFound() {
        showNoSessionMessage();
        swipeRefreshLayout.setRefreshing(false);
    }

    // ================ UI STATE METHODS ================

    private void showParkingSessionInfo() {
        if (parkingSessionContainer != null) {
            parkingSessionContainer.setVisibility(View.VISIBLE);
        }
        if (noSessionContainer != null) {
            noSessionContainer.setVisibility(View.GONE);
        }
    }

    private void showNoSessionMessage() {
        if (parkingSessionContainer != null) {
            parkingSessionContainer.setVisibility(View.GONE);
        }
        if (noSessionContainer != null) {
            noSessionContainer.setVisibility(View.VISIBLE);
        }
        stopDurationTimer();
    }

    private void stopDurationTimer() {
        if (durationHandler != null && durationRunnable != null) {
            durationHandler.removeCallbacks(durationRunnable);
        }
    }

    // ================ LIFECYCLE METHODS ================

    @Override
    public void onPause() {
        super.onPause();
        stopDurationTimer();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (session != null && durationHandler != null && durationRunnable != null) {
            durationHandler.post(durationRunnable);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopDurationTimer();
    }
}