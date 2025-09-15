package vn.edu.fpt.sapsmobile.fragments;

import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.PopupMenu;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.material.button.MaterialButtonToggleGroup;
import com.google.android.material.button.MaterialSplitButton;

import java.util.ArrayList;
import java.util.List;

import vn.edu.fpt.sapsmobile.activities.sharevehicle.InvitationActivity;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.VehicleFragmentHandler;
import vn.edu.fpt.sapsmobile.activities.auth.AddVehicleActivity;
import vn.edu.fpt.sapsmobile.adapters.VehicleAdapter;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;
import vn.edu.fpt.sapsmobile.services.vehicle.VehicleService;
import vn.edu.fpt.sapsmobile.utils.JwtUtils;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.RecyclerUtils;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class VehicleFragment extends Fragment implements VehicleService.VehicleCallBack {

    private static final String TAG = "VehicleFragment";

    // UI Components
    private LoadingDialog loadingDialog;
    private RecyclerView rvVehicles;
    private VehicleAdapter vehicleAdapter;
    private TextView tv_share_code;
    private Button btn_copy_code;
    //    private Button btn_add_vehicle;
    private MaterialButtonToggleGroup toggleTabs;
    private MaterialSplitButton splitButton;
    private Button btnViewInvitation;
    private Button expandButton;
    private SwipeRefreshLayout swipeRefreshLayout;

    // Data
    private List<Vehicle> vehicleList;
    private TokenManager tokenManager;

    // API Services
    private VehicleService vehicleService;

    // Tab states
    private static final int TAB_MY_VEHICLES = 0;
    private static final int TAB_SHARED_VEHICLES = 1;
    private int currentTab = TAB_MY_VEHICLES;

    public VehicleFragment() {
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vehicle, container, false);

        initializeComponents(view);
        setupStatusBar();
        setupSwipeRefresh(view);
        setupSplitButton();
        setupRecyclerView();
        setupClickListeners();

        return view;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setupToggleButtons();
        loadInitialData();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        loadingDialog.dismiss();
    }

    //region INITIALIZATION METHODS
    private void initializeComponents(View view) {
        tokenManager = new TokenManager(getActivity());
        loadingDialog = new LoadingDialog(getActivity());
        vehicleList = new ArrayList<>();
        vehicleService = new VehicleService(getContext());

        // Find views
        rvVehicles = view.findViewById(R.id.rvVehicles);
        tv_share_code = view.findViewById(R.id.tv_share_code);
        btn_copy_code = view.findViewById(R.id.btn_copy_code);
        toggleTabs = view.findViewById(R.id.toggleTabs);

        // split button
        splitButton = view.findViewById(R.id.splitbutton);
        btnViewInvitation = view.findViewById(R.id.btn_view_invitation);
        expandButton = view.findViewById(R.id.expand_more_or_less_filled);
        
        // swipe refresh layout
        swipeRefreshLayout = view.findViewById(R.id.swipeRefreshLayout);
    }

    private void setupStatusBar() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && getActivity() != null) {
            Window window = getActivity().getWindow();
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            );
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.TRANSPARENT);
        }
    }

    private void setupRecyclerView() {
        rvVehicles.setLayoutManager(new LinearLayoutManager(getContext()));
        VehicleFragmentHandler handler = new VehicleFragmentHandler(requireContext());
        handler.setCurrentTab(currentTab); // Set initial tab for handler
        handler.setOnActionCompletedListener(this::refreshCurrentTabData); // Set callback for data refresh
        vehicleAdapter = new VehicleAdapter(vehicleList, handler);
        vehicleAdapter.setCurrentTab(currentTab); // Set initial tab
        rvVehicles.setAdapter(vehicleAdapter);
    }

    private void setupSwipeRefresh(View view) {
        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setColorSchemeColors(
                    ContextCompat.getColor(getContext(), R.color.md_theme_primary)
            );
            swipeRefreshLayout.setOnRefreshListener(() -> {
                loadInitialData();
            });
        }
    }

    private void setupClickListeners() {
        btn_copy_code.setOnClickListener(this::onCopyCodeClicked);
    }

    private void setupToggleButtons() {
        toggleTabs.addOnButtonCheckedListener((group, checkedId, isChecked) -> {
            if (isChecked) {
                handleTabSelection(checkedId);
            }
        });
    }
    //endregion

    //region CLICK HANDLERS
    private void setupSplitButton() {
        btnViewInvitation.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), InvitationActivity.class);
            startActivitySafely(intent);
        });
        // Set up the dropdown button click
        expandButton.setOnClickListener(this::showDropdownMenu);
    }

    private void showDropdownMenu(View anchoView) {
        PopupMenu popup = new PopupMenu(this.getContext(), anchoView);
        popup.getMenuInflater().inflate(R.menu.vehicle_options_menu, popup.getMenu());

        popup.setOnMenuItemClickListener(menuItem -> {
            int itemId = menuItem.getItemId();
            if (itemId == R.id.menu_register_own) {
                startActivitySafely(new Intent(requireContext(), AddVehicleActivity.class));
                return true;
            } else {
                return false;
            }
        });
        popup.show();
    }

    private void onCopyCodeClicked(View v) {
        String code = tv_share_code.getText().toString();

        if (code.isEmpty() || code.equals(getString(R.string.loading_data))) {
            showToast(getString(R.string.no_code_to_copy));
            return;
        }

        try {
            ClipboardManager clipboard = (ClipboardManager) requireContext()
                    .getSystemService(Context.CLIPBOARD_SERVICE);
            ClipData clip = ClipData.newPlainText(getString(R.string.copied_code_label), code);
            clipboard.setPrimaryClip(clip);

            showToast(getString(R.string.copied_to_clipboard));
        } catch (Exception e) {
            Log.e(TAG, "Failed to copy code to clipboard", e);
            showToast("Failed to copy code");
        }
    }
    //endregion

    //region DATA LOADING METHODS
    private void loadInitialData() {
        loadShareCode();
        loadVehicle();
    }

    private void loadVehicle() {
        if (!isFragmentValid()) return;
        showLoadingDialog();
        vehicleService.loadMyVehicles(this);
    }

    private void loadShareCode() {
        if (!isFragmentValid()) return;
        String token = tokenManager.getAccessToken();
        String sharecode = JwtUtils.getShareCodeFromToken(token);
        tv_share_code.setText(sharecode);
//        Log.i(TAG, "loadShareCode: " + token);
    }

    private void handleTabSelection(int checkedId) {
        if (checkedId == R.id.btnMyVehicles) {
            currentTab = TAB_MY_VEHICLES;
            vehicleAdapter.setCurrentTab(currentTab);
            if (vehicleAdapter.getActionListener() instanceof VehicleFragmentHandler) {
                VehicleFragmentHandler handler = (VehicleFragmentHandler) vehicleAdapter.getActionListener();
                handler.setCurrentTab(currentTab);
                handler.setOnActionCompletedListener(this::refreshCurrentTabData);
            }
            loadVehicle();
        } else if (checkedId == R.id.btnSharedVehicles) {
            currentTab = TAB_SHARED_VEHICLES;
            vehicleAdapter.setCurrentTab(currentTab);
            if (vehicleAdapter.getActionListener() instanceof VehicleFragmentHandler) {
                VehicleFragmentHandler handler = (VehicleFragmentHandler) vehicleAdapter.getActionListener();
                handler.setCurrentTab(currentTab);
                handler.setOnActionCompletedListener(this::refreshCurrentTabData);
            }

            if (!isFragmentValid()) return;
            User user = tokenManager.getUserData();
            if (user == null || user.getId() == null) {
                showToast("User data not available");
                return;
            }
            showLoadingDialog();
            vehicleService.loadSharedVehicles(user.getId(), this);
        }
    }

    @Override
    public void OnVehicleFetchSuccess(List<VehicleSummaryDto> vehicleSummaryDtos) {
        loadingDialog.dismiss();
        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setRefreshing(false);
        }
        if (!isFragmentValid()) return;
        updateVehicleList(vehicleSummaryDtos);
    }

    @Override
    public void OnVehicleFetchFailure(String message) {
        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setRefreshing(false);
        }
        showToast(message);
        showEmptyVehicleList();
    }

    @Override
    public void OnSharedVehicleFetchSuccess(List<VehicleSummaryDto> vehicleSummaryDtos) {
        loadingDialog.dismiss();
        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setRefreshing(false);
        }
        if (!isFragmentValid()) return;
        updateVehicleList(vehicleSummaryDtos);
    }

    @Override
    public void OnSharedVehicleFetchFailure(String message) {
        loadingDialog.dismiss();
        if (swipeRefreshLayout != null) {
            swipeRefreshLayout.setRefreshing(false);
        }
        showToast(message);
        showEmptyVehicleList();
    }
    //endregion

    //region UI UPDATE METHODS

    private void updateVehicleList(List<VehicleSummaryDto> summaryDtos) {
        vehicleList.clear();
        vehicleList.addAll(convertToVehicleList(summaryDtos));
        RecyclerUtils.updateRecyclerView(rvVehicles, vehicleList);
    }

    private void showEmptyVehicleList() {
        vehicleList.clear();
        RecyclerUtils.updateRecyclerView(rvVehicles, vehicleList);
    }

    private void showLoadingDialog() {
        loadingDialog.show("Loading vehicles...", true, () -> {
            showToast("Loading cancelled");
        });
    }

    private void refreshCurrentTabData() {
        // Refresh data based on current tab
        if (currentTab == TAB_MY_VEHICLES) {
            showLoadingDialog();
            vehicleService.loadMyVehicles(this);
        } else if (currentTab == TAB_SHARED_VEHICLES) {
            User user = tokenManager.getUserData();
            if (user == null || user.getId() == null) {
                showToast("User data not available");
                return;
            }
            showLoadingDialog();
            vehicleService.loadSharedVehicles(user.getId(), this);
        }
    }
    //endregion

    //region UTILITY METHODS
    private boolean isFragmentValid() {
        return isAdded() && getContext() != null && !isDetached();
    }

    private void showToast(String message) {
        if (isFragmentValid()) {
            Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show();
        }
    }

    private void startActivitySafely(Intent intent) {
        try {
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start activity", e);
            showToast("Failed to open activity");
        }
    }

    private List<Vehicle> convertToVehicleList(List<VehicleSummaryDto> summaryDtos) {
        List<Vehicle> vehicles = new ArrayList<>();

        for (VehicleSummaryDto dto : summaryDtos) {
            if (dto == null) continue;

            Vehicle vehicle = new Vehicle();
            vehicle.setId(dto.getId());
            vehicle.setLicensePlate(dto.getLicensePlate() != null ? dto.getLicensePlate() : "");
            vehicle.setBrand(dto.getBrand() != null ? dto.getBrand() : "");
            vehicle.setModel(dto.getModel() != null ? dto.getModel() : "");
            vehicle.setColor(dto.getColor() != null ? dto.getColor() : "");
            vehicle.setStatus(dto.getStatus() != null ? dto.getStatus() : "");
            vehicle.setSharingStatus(dto.getSharingStatus() != null ? dto.getSharingStatus() : "");

            // Set default values for missing fields
            vehicle.setEngineNumber("");
            vehicle.setChassisNumber("");
            vehicle.setOwnerVehicleFullName("");
            vehicle.setCertificateTitle("");
            vehicle.setCreatedAt("");
            vehicle.setUpdatedAt("");
            vehicle.setOwnerId("");

            vehicles.add(vehicle);
        }

        return vehicles;
    }
    //endregion
}