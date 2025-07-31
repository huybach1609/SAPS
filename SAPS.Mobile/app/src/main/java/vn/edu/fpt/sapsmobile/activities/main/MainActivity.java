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
        setContentView(R.layout.activity_main);

//         check login info

//        tokenManager = new TokenManager(this);
//        if (!tokenManager.isLoggedIn()) {
//            Intent loginIntent = new Intent(this, LoginActivity.class);
//            startActivity(loginIntent);
//        }
//
//
//        authService = new AuthenticationService(this, this);

        initializeBottomNavigation();

    }

    public void logoutProgress() {
        Intent loginIntent = new Intent(this, LoginActivity.class);
        startActivity(loginIntent);
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

    ;

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

    }

    @Override
    public void onAuthFailure(String error) {

    }
}