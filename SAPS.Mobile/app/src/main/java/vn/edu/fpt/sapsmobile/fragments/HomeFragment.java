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
import android.widget.Toast;

import com.bumptech.glide.Glide;

import java.util.ArrayList;
import java.util.List;

import vn.edu.fpt.sapsmobile.activities.auth.LoginActivity;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.HistoryFragmentHandler;
import vn.edu.fpt.sapsmobile.activities.NotificationsListActivity;
import vn.edu.fpt.sapsmobile.adapters.ParkingSessionParkingAdapter;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.services.ParkingSessionService;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class HomeFragment extends Fragment implements 
        ParkingSessionService.ParkingSessionCallback,
        ParkingSessionService.DataLoadingCallback {

    // UI Components
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

    // Services
    private ParkingSessionService parkingSessionService;
    private TokenManager tokenManager;

    private final String TAG = "HomeFragment";

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
        parkingSessionService = new ParkingSessionService(requireContext());
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
        parkingSessionService.fetchOwnedSessions(this, this);
    }

    // ================ PARKING SESSION SERVICE CALLBACKS ================

    @Override
    public void onSuccess(List<ParkingSession> parkingSessions) {
        if (!isAdded() || getContext() == null) return;
        
        parkingSessionList = parkingSessions;
        parkingSessionAdapter.updateItems(parkingSessionList);
        
        // Hide both containers when we have data
        if (parkingSessionContainer != null) {
            parkingSessionContainer.setVisibility(View.GONE);
        }
        if (noSessionContainer != null) {
            noSessionContainer.setVisibility(View.GONE);
        }
    }

    @Override
    public void onError(String errorMessage) {
        if (!isAdded() || getContext() == null) return;
        
        Toast.makeText(getContext(), errorMessage, Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onNoSessions() {
        if (!isAdded() || getContext() == null) return;
        
        showNoSessionMessage();
    }

    @Override
    public void onDataLoadingStarted() {
        if (!isAdded() || getContext() == null) return;
        
        if (!swipeRefreshLayout.isRefreshing()) {
            swipeRefreshLayout.setRefreshing(true);
        }
    }

    @Override
    public void onDataLoadingFinished() {
        if (!isAdded() || getContext() == null) return;
        
        swipeRefreshLayout.setRefreshing(false);
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

    private void setupBtnNotification() {
        btnNotification.setOnClickListener(v-> {
            Intent intent = new Intent(getActivity(), NotificationsListActivity.class);
            startActivity(intent);
        });
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