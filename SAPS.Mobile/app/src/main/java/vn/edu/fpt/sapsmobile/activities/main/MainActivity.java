package vn.edu.fpt.sapsmobile.activities.main;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.fragment.app.Fragment;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationBarView;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.auth.LoginActivity;
import vn.edu.fpt.sapsmobile.activities.auth.WelcomeActivity;
import vn.edu.fpt.sapsmobile.fragments.HistoryFragment;
import vn.edu.fpt.sapsmobile.fragments.HomeFragment;
import vn.edu.fpt.sapsmobile.fragments.ProfileFragment;
import vn.edu.fpt.sapsmobile.fragments.VehicleFragment;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.services.AuthenticationService;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class MainActivity extends AppCompatActivity implements AuthenticationService.AuthCallback {
    private TokenManager tokenManager;

    private BottomNavigationView bottomNavigation;
    private AuthenticationService authService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable edge-to-edge display
        EdgeToEdge.enable(this);

        setContentView(R.layout.activity_main);

        // Setup window insets for safe zone
        setupWindowInsets();

        // Check login info
        tokenManager = new TokenManager(this);
//        if (!tokenManager.isLoggedIn()) {
//            Intent loginIntent = new Intent(this, LoginActivity.class);
//            startActivity(loginIntent);
//            finish(); // Prevent going back to MainActivity without login
//            return;
//        }
        if (!tokenManager.isLoggedIn()) {
            Intent welcome = new Intent(this, WelcomeActivity.class);
            startActivity(welcome);
            finish(); // Prevent going back to MainActivity without login
            return;
        }


        authService = new AuthenticationService(this, this);
        initializeBottomNavigation();
    }

    private void setupWindowInsets() {
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main_container), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            Insets navigationBars = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
            Insets statusBars = insets.getInsets(WindowInsetsCompat.Type.statusBars());
            Insets displayCutout = insets.getInsets(WindowInsetsCompat.Type.displayCutout());

            // Combine cutout and status bar insets
            int topInset = Math.max(statusBars.top, displayCutout.top);
            int leftInset = Math.max(systemBars.left, displayCutout.left);
            int rightInset = Math.max(systemBars.right, displayCutout.right);

            // Apply padding for status bar and display cutout
            v.setPadding(leftInset, topInset, rightInset, 0);

            // Apply bottom padding to BottomNavigation for navigation bar
            BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);
            if (bottomNav != null) {
                bottomNav.setPadding(
                        leftInset, // Also apply left cutout padding to bottom nav
                        bottomNav.getPaddingTop(),
                        rightInset, // Also apply right cutout padding to bottom nav
                        navigationBars.bottom
                );
            }
            return insets;
        });
    }

    public void logoutProgress() {
        Intent loginIntent = new Intent(this, LoginActivity.class);
        startActivity(loginIntent);
        finish();
    }

    public AuthenticationService getAuthService() {
        return authService;
    }

    private void initializeBottomNavigation() {
        bottomNavigation = findViewById(R.id.bottom_navigation);

        bottomNavigation.setOnItemSelectedListener(item -> {
            Fragment selectedFragment = getFragmentForMenuItem(item.getItemId());
            if (selectedFragment != null) {
                loadFragment(selectedFragment);
                return true;
            }
            return false;
        });

        bottomNavigation.setOnItemReselectedListener(item -> {
            handleReselection(item.getItemId());
        });

        // Load default fragment
        loadFragment(new HomeFragment());
        bottomNavigation.setSelectedItemId(R.id.nav_home);
    }

    private Fragment getFragmentForMenuItem(int itemId) {
        if (itemId == R.id.nav_home) {
            return new HomeFragment();
        } else if (itemId == R.id.nav_vehicle) {
            return new VehicleFragment();
        } else if (itemId == R.id.nav_history) {
            return new HistoryFragment();
        } else if (itemId == R.id.nav_profile) {
            return new ProfileFragment();
        }
        return null;
    }

    private void handleReselection(int itemId) {
        // Handle what happens when user taps the same tab again
        if (itemId == R.id.nav_home) {
            // Scroll to top or refresh home data
        } else if (itemId == R.id.nav_vehicle) {
            // Refresh vehicle data
        } else if (itemId == R.id.nav_history) {
            // Scroll to top of history list
        } else if (itemId == R.id.nav_profile) {
            // Refresh profile data
        }
    }


    private Fragment currentFragment;

    private void loadFragment(Fragment fragment) {
        if (fragment != null && fragment.getClass() != (currentFragment != null ? currentFragment.getClass() : null)) {
            currentFragment = fragment;
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, fragment)
                    .commit();
        }
    }


    public TokenManager getTokenManager() {
        return tokenManager;
    }

    // Method to programmatically change navigation
    public void navigateToTab(int tabId) {
        bottomNavigation.setSelectedItemId(tabId);
    }

    // Method to add badges to navigation items
    public void addBadgeToNavigationItem(int menuItemId, int badgeNumber) {
        bottomNavigation.getOrCreateBadge(menuItemId).setNumber(badgeNumber);
    }

    // Method to remove badges
    public void removeBadgeFromNavigationItem(int menuItemId) {
        bottomNavigation.removeBadge(menuItemId);
    }

    @Override
    public void onAuthSuccess(User user) {
        // Handle successful authentication
    }

    @Override
    public void onAuthFailure(String error) {
        // Handle authentication failure
        logoutProgress();
    }
}