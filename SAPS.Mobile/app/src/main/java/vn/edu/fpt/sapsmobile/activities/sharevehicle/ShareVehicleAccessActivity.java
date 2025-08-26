package vn.edu.fpt.sapsmobile.activities.sharevehicle;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.elevation.SurfaceColors;
import com.google.android.material.textfield.TextInputEditText;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.adapters.ShareCodeSearchAdapter;
import vn.edu.fpt.sapsmobile.dtos.profile.ClientProfileSummaryDto;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.api.ClientApiService;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

import java.util.ArrayList;
import java.util.List;

public class ShareVehicleAccessActivity extends AppCompatActivity {

    // Views
    private MaterialToolbar toolbar;
    private TextInputEditText etSearchShareCode;
    private MaterialButton btnClearSearch;
    private RecyclerView rvSearchResults;
//    private LinearLayout llDefaultState;
    private LinearLayout llEmptyState;
    private LinearLayout llLoadingOverlay;
    private LinearLayout llVehicleInfo;
    private TextView tvVehicleLicensePlate;
    private TextView tvVehicleDetails;

    // Services
    private LoadingDialog loadingDialog;
    private TokenManager tokenManager;
    
    // Vehicle data
    private Vehicle selectedVehicle;

    // Search handling
    private Handler searchHandler = new Handler();
    private Runnable searchRunnable;
    private static final int SEARCH_DELAY = 1000; // ms
    
    // API and Adapter
    private ClientApiService clientApiService;
    private ShareCodeSearchAdapter searchAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_share_vehicle_access);


        initViews();
        setupToolbar();
        setupSearchFunctionality();
        setupClickListeners();

        extractVehicleData();
        // Show default state initially
        showDefaultState();
    }

    private void initViews() {
        tokenManager = new TokenManager(this);
        loadingDialog = new LoadingDialog(this);

        toolbar = findViewById(R.id.topAppBar);
        etSearchShareCode = findViewById(R.id.etSearchShareCode);
        btnClearSearch = findViewById(R.id.btnClearSearch);
        rvSearchResults = findViewById(R.id.rvSearchResults);
        llEmptyState = findViewById(R.id.llEmptyState);
        llLoadingOverlay = findViewById(R.id.llLoadingOverlay);

        // Initialize vehicle info views
        llVehicleInfo = findViewById(R.id.llVehicleInfo);
        tvVehicleLicensePlate = findViewById(R.id.tvVehicleLicensePlate);
        tvVehicleDetails = findViewById(R.id.tvVehicleDetails);

        // Setup API service
        clientApiService = ApiTest.getServiceLast(this).create(ClientApiService.class);
        
        // Setup RecyclerView and Adapter
        rvSearchResults.setLayoutManager(new LinearLayoutManager(this));
        searchAdapter = new ShareCodeSearchAdapter();
        rvSearchResults.setAdapter(searchAdapter);
        
        // Set adapter listener
        searchAdapter.setOnUserSelectedListener(user -> {
            // Navigate to confirm access with user data
            navigateToConfirmAccess(user);
        });
    }

    private void setupToolbar() {
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.share_vehicle_access_activity_actionbar_title);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            int surface = SurfaceColors.SURFACE_0.getColor(this);
            getWindow().setStatusBarColor(surface);
            getWindow().setNavigationBarColor(surface);

            toolbar.setNavigationOnClickListener(v -> onBackPressed());
        }
    }

    private void setupSearchFunctionality() {
        etSearchShareCode.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                // Show/hide clear button
                if (s.length() > 0) {
                    btnClearSearch.setVisibility(View.VISIBLE);
                } else {
                    btnClearSearch.setVisibility(View.GONE);
                }

                // Cancel previous search
                if (searchRunnable != null) {
                    searchHandler.removeCallbacks(searchRunnable);
                }

                // Schedule new search
                searchRunnable = () -> performSearch(s.toString());
                searchHandler.postDelayed(searchRunnable, SEARCH_DELAY);
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Handle search action from keyboard
        etSearchShareCode.setOnEditorActionListener((v, actionId, event) -> {
            String query = etSearchShareCode.getText().toString().trim();
            if (!query.isEmpty()) {
                performSearch(query);
            }
            return true;
        });
    }

    private void setupClickListeners() {
        btnClearSearch.setOnClickListener(v -> {
            etSearchShareCode.setText("");
            etSearchShareCode.clearFocus();
            showDefaultState();
        });
    }

    private void performSearch(String query) {
        if (query.trim().isEmpty()) {
            showDefaultState();
            return;
        }

        showLoadingState();

        // Call API to get client by share code
        clientApiService.getClientByShareCode(query.trim()).enqueue(new retrofit2.Callback<ClientProfileSummaryDto>() {
            @Override
            public void onResponse(retrofit2.Call<ClientProfileSummaryDto> call, retrofit2.Response<ClientProfileSummaryDto> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ClientProfileSummaryDto user = response.body();
                    // Show search results with the found user
                    showSearchResults();
                    List<ClientProfileSummaryDto> userList = new ArrayList<>();
                    userList.add(user);
                    searchAdapter.setSearchResults(userList);
                } else {
                    // No user found or error
                    showEmptyState();
                    searchAdapter.clearResults();
                    
                    // Show specific error message for 404
                    if (response.code() == 404) {
                        Toast.makeText(ShareVehicleAccessActivity.this, 
                            "No user found with this share code", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(ShareVehicleAccessActivity.this, 
                            "Search failed: " + response.message(), Toast.LENGTH_SHORT).show();
                    }
                }
            }

            @Override
            public void onFailure(retrofit2.Call<ClientProfileSummaryDto> call, Throwable t) {
                // Network error or other failure
                showEmptyState();
                searchAdapter.clearResults();
                Toast.makeText(ShareVehicleAccessActivity.this, 
                    "Search failed: " + (t.getMessage() != null ? t.getMessage() : "Network error"), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showDefaultState() {
        rvSearchResults.setVisibility(View.GONE);
        llEmptyState.setVisibility(View.GONE);
        llLoadingOverlay.setVisibility(View.GONE);
        searchAdapter.clearResults();
    }

    private void showSearchResults() {
        rvSearchResults.setVisibility(View.VISIBLE);
        llEmptyState.setVisibility(View.GONE);
        llLoadingOverlay.setVisibility(View.GONE);
    }

    private void showEmptyState() {
        rvSearchResults.setVisibility(View.GONE);
        llEmptyState.setVisibility(View.VISIBLE);
        llLoadingOverlay.setVisibility(View.GONE);
    }

    private void extractVehicleData() {
        Intent intent = getIntent();
        if (intent != null && intent.hasExtra("vehicle")) {
            selectedVehicle = (Vehicle) intent.getSerializableExtra("vehicle");
            if (selectedVehicle != null) {
                // Update toolbar title with vehicle info
                updateToolbarWithVehicleInfo();
            }
        }
    }
    
    private void updateToolbarWithVehicleInfo() {
        if (selectedVehicle != null) {
            // Update toolbar title
            if (toolbar != null && getSupportActionBar() != null) {
                String vehicleInfo = selectedVehicle.getLicensePlate() + " - " +
                                   selectedVehicle.getBrand() + " " + selectedVehicle.getModel();
                getSupportActionBar().setTitle(vehicleInfo);
            }
            
            // Update vehicle info section
            if (llVehicleInfo != null && tvVehicleLicensePlate != null) {
                llVehicleInfo.setVisibility(View.VISIBLE);
                tvVehicleLicensePlate.setText(selectedVehicle.getLicensePlate());
                
                String vehicleDetails = selectedVehicle.getBrand() + " " + selectedVehicle.getModel();
                if (selectedVehicle.getColor() != null && !selectedVehicle.getColor().isEmpty()) {
                    vehicleDetails += " - " + selectedVehicle.getColor();
                }
                tvVehicleDetails.setText(vehicleDetails);
            }
        }
    }

    private void showLoadingState() {
        llLoadingOverlay.setVisibility(View.VISIBLE);
    }

    private void navigateToConfirmAccess(ClientProfileSummaryDto user) {
        Intent intent = new Intent(ShareVehicleAccessActivity.this, ConfirmUserAccessActivity.class);
        intent.putExtra("user", user);
        if (this.selectedVehicle != null) {
            intent.putExtra("vehicle", this.selectedVehicle);
        }
        startActivity(intent);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (searchHandler != null && searchRunnable != null) {
            searchHandler.removeCallbacks(searchRunnable);
        }
    }
}