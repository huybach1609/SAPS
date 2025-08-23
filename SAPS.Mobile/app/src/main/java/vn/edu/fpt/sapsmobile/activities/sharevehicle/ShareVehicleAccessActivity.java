package vn.edu.fpt.sapsmobile.activities.sharevehicle;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.LinearLayout;
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
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class ShareVehicleAccessActivity extends AppCompatActivity {

    // Views
    private MaterialToolbar toolbar;
    private TextInputEditText etSearchShareCode;
    private MaterialButton btnClearSearch;
    private RecyclerView rvSearchResults;
//    private LinearLayout llDefaultState;
    private LinearLayout llEmptyState;
    private LinearLayout llLoadingOverlay;

    // Services
    private LoadingDialog loadingDialog;
    private TokenManager tokenManager;

    // Search handling
    private Handler searchHandler = new Handler();
    private Runnable searchRunnable;
    private static final int SEARCH_DELAY = 1000; // ms

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_share_vehicle_access);

        initViews();
        setupToolbar();
        setupSearchFunctionality();
        setupClickListeners();

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
//        llDefaultState = findViewById(R.id.llDefaultState);
        llEmptyState = findViewById(R.id.llEmptyState);
        llLoadingOverlay = findViewById(R.id.llLoadingOverlay);

        // Setup RecyclerView
        rvSearchResults.setLayoutManager(new LinearLayoutManager(this));
        // TODO: Set your adapter here
        // rvSearchResults.setAdapter(yourAdapter);
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

        // TODO: Add click listeners for recent items in default state
        // You can add click listeners to the card views in the default state
    }

    private void performSearch(String query) {
        if (query.trim().isEmpty()) {
            showDefaultState();
            return;
        }

        showLoadingState();

        // TODO: Implement your actual search logic here
        // This is a mock implementation
        searchHandler.postDelayed(() -> {
            // Mock search results - replace with actual API call
            boolean foundResults = query.toLowerCase().contains("sarah") ||
                    query.toLowerCase().contains("user-sarah2024");

            if (foundResults) {
                showSearchResults();
                // TODO: Update your RecyclerView adapter with search results
            } else {
                showEmptyState();
            }
        }, 1000); // Simulate network delay
    }

    private void showDefaultState() {
//        llDefaultState.setVisibility(View.VISIBLE);
        rvSearchResults.setVisibility(View.GONE);
        llEmptyState.setVisibility(View.GONE);
        llLoadingOverlay.setVisibility(View.GONE);
    }

    private void showSearchResults() {
//        llDefaultState.setVisibility(View.GONE);
        rvSearchResults.setVisibility(View.VISIBLE);
        llEmptyState.setVisibility(View.GONE);
        llLoadingOverlay.setVisibility(View.GONE);
    }

    private void showEmptyState() {
//        llDefaultState.setVisibility(View.GONE);
        rvSearchResults.setVisibility(View.GONE);
        llEmptyState.setVisibility(View.VISIBLE);
        llLoadingOverlay.setVisibility(View.GONE);
    }

    private void showLoadingState() {
        llLoadingOverlay.setVisibility(View.VISIBLE);
    }

    private void navigateToConfirmAccess(String shareCode) {
        Intent intent = new Intent(ShareVehicleAccessActivity.this, ConfirmUserAccessActivity.class);
        intent.putExtra("share_code", shareCode);
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