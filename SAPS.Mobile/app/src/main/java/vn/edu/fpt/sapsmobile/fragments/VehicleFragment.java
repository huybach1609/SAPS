package vn.edu.fpt.sapsmobile.fragments;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

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

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.VehicleFragmentHandler;
import vn.edu.fpt.sapsmobile.activities.auth.AddVehicleActivity;
import vn.edu.fpt.sapsmobile.activities.sharevehicle.ShareVehicleAccessActivity;
import vn.edu.fpt.sapsmobile.activities.sharevehicle.ViewListInvitationActivity;
import vn.edu.fpt.sapsmobile.adapters.VehicleAdapter;
import vn.edu.fpt.sapsmobile.dialog.VerifyRequiredDialogFragment;
import vn.edu.fpt.sapsmobile.dtos.vehicle.ShareCodeReturnDto;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.service.ISharedvehicle;
import vn.edu.fpt.sapsmobile.network.service.IVehicleApi;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.RecyclerUtils;
import vn.edu.fpt.sapsmobile.utils.TokenManager;
import vn.edu.fpt.sapsmobile.utils.VerifyUtils;

public class VehicleFragment extends Fragment {

    private static final String TAG = "VehicleFragment";

    // UI
    private LoadingDialog loadingDialog;
    private RecyclerView rvVehicles;
    private VehicleAdapter vehicleAdapter;
    private TextView tv_share_code;
    private Button btn_copy_code;
    private MaterialButtonToggleGroup toggleTabs;
    private MaterialSplitButton splitButton;
    private Button btnViewInvitation;
    private Button expandButton;

    // Data
    private final List<Vehicle> vehicleList = new ArrayList<>();
    private TokenManager tokenManager;

    // API
    private IVehicleApi vehicleApi;
    private ISharedvehicle sharedVehicleApi;

    // Calls
    private Call<List<VehicleSummaryDto>> currentVehicleCall;
    private Call<ShareCodeReturnDto> shareCodeCall;

    // Tabs
    private static final int TAB_MY_VEHICLES = 0;
    private static final int TAB_SHARED_VEHICLES = 1;
    private int currentTab = TAB_MY_VEHICLES;

    // Guard
    private boolean allowLoad = false;

    public VehicleFragment() {}

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vehicle, container, false);

        tokenManager = new TokenManager(getActivity());
        loadingDialog = new LoadingDialog(getActivity());

        // find views
        rvVehicles = view.findViewById(R.id.rvVehicles);
        tv_share_code = view.findViewById(R.id.tv_share_code);
        btn_copy_code = view.findViewById(R.id.btn_copy_code);
        toggleTabs = view.findViewById(R.id.toggleTabs);
        splitButton = view.findViewById(R.id.splitbutton);
        btnViewInvitation = view.findViewById(R.id.btn_view_invitation);
        expandButton = view.findViewById(R.id.expand_more_or_less_filled);

        setupStatusBar();
        setupSplitButton();
        setupRecyclerView();
        setupClickListeners();

        // ===== VERIFY GUARD =====
        User user = tokenManager.getUserData();
        allowLoad = VerifyUtils.isUserVerified(user);
        if (!allowLoad) {
            VerifyRequiredDialogFragment.newInstance()
                    .show(getParentFragmentManager(), VerifyRequiredDialogFragment.TAG);
        }
        // ========================

        return view;
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        if (!allowLoad) return; // chưa verify -> dừng toàn bộ logic tải

        initializeApiServices();
        setupToggleButtons();
        loadInitialData();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        cancelAllApiCalls();
        if (loadingDialog != null) loadingDialog.hide();
    }

    // ===== INIT =====
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
        vehicleAdapter = new VehicleAdapter(vehicleList, handler);
        rvVehicles.setAdapter(vehicleAdapter);
    }

    private void setupClickListeners() {
        btn_copy_code.setOnClickListener(this::onCopyCodeClicked);
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

    private void initializeApiServices() {
        vehicleApi = ApiTest.getServiceLast(requireContext()).create(IVehicleApi.class);
        sharedVehicleApi = ApiTest.getServiceLast(requireContext()).create(ISharedvehicle.class);
    }

    private void setupToggleButtons() {
        toggleTabs.addOnButtonCheckedListener((group, checkedId, isChecked) -> {
            if (!isChecked) return;
            handleTabSelection(checkedId);
        });
    }

    // ===== SPLIT BUTTON =====
    private void setupSplitButton() {
        btnViewInvitation.setOnClickListener(v ->
                startActivitySafely(new Intent(getActivity(), ViewListInvitationActivity.class))
        );

        expandButton.setOnClickListener(this::showDropdownMenu);
    }

    private void showDropdownMenu(View anchorView) {
        PopupMenu popup = new PopupMenu(this.getContext(), anchorView);
        popup.getMenuInflater().inflate(R.menu.vehicle_options_menu, popup.getMenu());

        popup.setOnMenuItemClickListener(menuItem -> {
            int itemId = menuItem.getItemId();
            if (itemId == R.id.menu_register_own) {
                startActivitySafely(new Intent(requireContext(), AddVehicleActivity.class));
                return true;
            } else if (itemId == R.id.menu_receive_share) {
                startActivitySafely(new Intent(requireContext(), ShareVehicleAccessActivity.class));
                return true;
            } else {
                return false;
            }
        });
        popup.show();
    }

    // ===== LOAD DATA =====
    private void loadInitialData() {
        loadShareCode();
        loadMyVehicles();
    }

    private void loadShareCode() {
        if (!isFragmentValid()) return;

        tv_share_code.setText(getString(R.string.loading_data));

        shareCodeCall = sharedVehicleApi.getShareCode();
        shareCodeCall.enqueue(new Callback<ShareCodeReturnDto>() {
            @Override
            public void onResponse(Call<ShareCodeReturnDto> call, Response<ShareCodeReturnDto> response) {
                if (!isFragmentValid()) return;

                if (response.isSuccessful() && response.body() != null) {
                    tv_share_code.setText(response.body().getShareCode());
                } else {
                    handleApiError("Failed to load share code", response.code(), null);
                    tv_share_code.setText("Error loading code");
                }
            }

            @Override
            public void onFailure(Call<ShareCodeReturnDto> call, Throwable t) {
                if (!isFragmentValid() || call.isCanceled()) return;

                Log.e(TAG, "Failed to load share code", t);
                handleApiError("Network error loading share code", -1, t);
                tv_share_code.setText("Network error");
            }
        });
    }

    private void handleTabSelection(int checkedId) {
        if (checkedId == R.id.btnMyVehicles) {
            currentTab = TAB_MY_VEHICLES;
            loadMyVehicles();
        } else if (checkedId == R.id.btnSharedVehicles) {
            currentTab = TAB_SHARED_VEHICLES;
            loadSharedVehicles();
        }
    }

    private void loadMyVehicles() {
        if (!isFragmentValid()) return;

        cancelCurrentVehicleCall();

        currentVehicleCall = vehicleApi.getMyVehicles(null, null);
        showLoadingDialog();

        currentVehicleCall.enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                loadingDialog.hide();
                if (!isFragmentValid()) return;

                if (response.isSuccessful() && response.body() != null) {
                    updateVehicleList(response.body());
                } else {
                    handleApiError("Failed to load my vehicles", response.code(), null);
                    showEmptyVehicleList();
                }
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                loadingDialog.hide();
                if (!isFragmentValid() || call.isCanceled()) return;

                Log.e(TAG, "Failed to load my vehicles", t);
                handleApiError("Network error loading vehicles", -1, t);
                showEmptyVehicleList();
            }
        });
    }

    private void loadSharedVehicles() {
        if (!isFragmentValid()) return;

        User user = tokenManager.getUserData();
        if (user == null || user.getId() == null) {
            showToast("User data not available");
            return;
        }

        cancelCurrentVehicleCall();

        currentVehicleCall = sharedVehicleApi.getMyVehicles(user.getId());
        showLoadingDialog();

        currentVehicleCall.enqueue(new Callback<List<VehicleSummaryDto>>() {
            @Override
            public void onResponse(Call<List<VehicleSummaryDto>> call, Response<List<VehicleSummaryDto>> response) {
                loadingDialog.hide();
                if (!isFragmentValid()) return;

                if (response.isSuccessful() && response.body() != null) {
                    updateVehicleList(response.body());
                } else {
                    handleApiError("Failed to load shared vehicles", response.code(), null);
                    showEmptyVehicleList();
                }
            }

            @Override
            public void onFailure(Call<List<VehicleSummaryDto>> call, Throwable t) {
                loadingDialog.hide();
                if (!isFragmentValid() || call.isCanceled()) return;

                Log.e(TAG, "Failed to load shared vehicles", t);
                handleApiError("Network error loading shared vehicles", -1, t);
                showEmptyVehicleList();
            }
        });
    }

    // ===== UI HELPERS =====
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
            cancelCurrentVehicleCall();
            showToast("Loading cancelled");
        });
    }

    // ===== UTIL =====
    private boolean isFragmentValid() {
        return isAdded() && getContext() != null && !isDetached();
    }

    private void showToast(String message) {
        if (isFragmentValid()) {
            Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show();
        }
    }

    private void handleApiError(String message, int responseCode, Throwable throwable) {
        String errorMessage = message;

        if (responseCode > 0) {
            switch (responseCode) {
                case 400: errorMessage = "Bad request - please check your data"; break;
                case 401: errorMessage = "Unauthorized - please login again"; break;
                case 403: errorMessage = "Access forbidden"; break;
                case 404: errorMessage = "Data not found"; break;
                case 500: errorMessage = "Server error - please try again later"; break;
                default:  errorMessage = message + " (Code: " + responseCode + ")";
            }
        } else if (throwable != null) {
            String msg = throwable.getMessage();
            if (msg != null && msg.contains("timeout")) {
                errorMessage = "Request timeout - please check your connection";
            } else if (msg != null && msg.contains("Unable to resolve host")) {
                errorMessage = "No internet connection";
            }
        }

        Log.e(TAG, errorMessage, throwable);
        showToast(errorMessage);
    }

    private void startActivitySafely(Intent intent) {
        try {
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start activity", e);
            showToast("Failed to open activity");
        }
    }

    private void cancelCurrentVehicleCall() {
        if (currentVehicleCall != null && !currentVehicleCall.isCanceled()) {
            currentVehicleCall.cancel();
        }
    }

    private void cancelAllApiCalls() {
        cancelCurrentVehicleCall();
        if (shareCodeCall != null && !shareCodeCall.isCanceled()) {
            shareCodeCall.cancel();
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

            // defaults
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
}
