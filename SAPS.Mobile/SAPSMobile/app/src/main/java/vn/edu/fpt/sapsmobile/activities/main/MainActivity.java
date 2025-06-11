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
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class MainActivity extends AppCompatActivity {
    private TokenManager tokenManager;

    private BottomNavigationView bottomNavigation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // check login info
        tokenManager = new TokenManager(this);
        if(!tokenManager.isLoggedIn()){
            Intent loginIntent = new Intent(this, LoginActivity.class);
            startActivity(loginIntent);
        }


        initializeBottomNavigation();
//        // Set up navigation item selection listener
//        bottomNavigation.setOnItemSelectedListener(new NavigationBarView.OnItemSelectedListener() {
//            @Override
//            public boolean onNavigationItemSelected(MenuItem item) {
//                int itemId = item.getItemId();
//
//                if (itemId == R.id.nav_home) {
//                    // Navigate to Home Fragment
//                    loadFragment(new HomeFragment());
//                    return true;
//                } else if (itemId == R.id.nav_vehicle) {
//                    // Navigate to Vehicle Fragment
//                    loadFragment(new VehicleFragment());
//                    return true;
//                } else if (itemId == R.id.nav_history) {
//                    // Navigate to History Fragment
//                    loadFragment(new HistoryFragment());
//                    return true;
//                } else if (itemId == R.id.nav_profile) {
//                    // Navigate to Profile Fragment
//                    loadFragment(new ProfileFragment());
//                    return true;
//                }
//                return false;
//            }
//        });
//
//        // Set default selection (Home)
//        bottomNavigation.setSelectedItemId(R.id.nav_home);
//
//        // Optional: Handle reselection (e.g., scroll to top)
//        bottomNavigation.setOnItemReselectedListener(new NavigationBarView.OnItemReselectedListener() {
//            @Override
//            public void onNavigationItemReselected(MenuItem item) {
//                int itemId = item.getItemId();
//
//                if (itemId == R.id.nav_home) {
//                    // Handle home reselection (e.g., scroll to top)
//                    // Example: scrollToTop() or refreshData()
//                } else if (itemId == R.id.nav_vehicle) {
//                    // Handle vehicle reselection
//                } else if (itemId == R.id.nav_history) {
//                    // Handle history reselection
//                } else if (itemId == R.id.nav_profile) {
//                    // Handle profile reselection
//                }
//            }
//        });
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


    private void loadFragment(Fragment fragment) {
        getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .commit();
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


}