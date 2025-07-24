package vn.edu.fpt.sapsmobile.activities.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.util.Patterns;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.main.MainActivity;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.services.AuthenticationService;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class LoginActivity extends AppCompatActivity implements AuthenticationService.AuthCallback {

    private static final String TAG = "LoginActivity";
    private static final int RC_SIGN_IN = 9001;

    private AuthenticationService authenticationService;
    private Button signInGoogleButton, signOutButton, signInButton;
    private TextView userInfoText;
    private TokenManager tokenManager;
    private EditText emailInput, passwordInput;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Hide ActionBar
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
        setContentView(R.layout.activity_login);

        // Initialize TokenManager to check if the user is already logged in
        tokenManager = new TokenManager(this);
        if (tokenManager.isLoggedIn()) {
            Log.d(TAG, "User already logged in, redirecting to MainActivity");
            // If the user is already logged in, redirect to MainActivity
            Intent mainIntent = new Intent(this, MainActivity.class);
            startActivity(mainIntent);
            finish(); // Close LoginActivity
            return; // Exit early
        }

        // Initialize views
        initializeViews();
        initializeAuthService();
        checkLoginStatus();
    }

    private void initializeViews() {
        signInGoogleButton = findViewById(R.id.sign_in_google_button);
        signOutButton = findViewById(R.id.sign_out_button);
        userInfoText = findViewById(R.id.user_info_text);

        Button registerButton = findViewById(R.id.register);
        signInButton = findViewById(R.id.sign_in_button);

        emailInput = findViewById(R.id.email_input_edit_text);
        passwordInput = findViewById(R.id.password_input_edit_text);

        // Button clicks
        signInGoogleButton.setOnClickListener(v -> handleSignInClick());
        signOutButton.setOnClickListener(v -> handleSignOutClick());

        registerButton.setOnClickListener(v -> {
            // Redirect to RegisterActivity
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });

        signInButton.setOnClickListener(v -> handleEmailLogin());
    }

    private void handleEmailLogin() {
        // Get email and password from input fields
        String email = emailInput.getText().toString().trim();
        String password = passwordInput.getText().toString().trim();

        // Validate input fields
        if (!validateLoginInput(email, password)) {
            return;
        }

        // Disable login button to prevent multiple requests
        signInButton.setEnabled(false);
        signInButton.setText("Signing in...");

        Log.d(TAG, "Attempting login with email: " + email);

        // Call loginWithEmail method to send login request
        authenticationService.loginWithEmail(email, password, new AuthenticationService.AuthCallback() {
            @Override
            public void onAuthSuccess(User user) {
                Log.d(TAG, "Login successful for user: " + user.getEmail());
                runOnUiThread(() -> {
                    // Re-enable login button
                    signInButton.setEnabled(true);
                    signInButton.setText("Sign In");

                    Toast.makeText(LoginActivity.this, "Login successful! Welcome " + user.getName(), Toast.LENGTH_SHORT).show();

                    // Update UI with user info and redirect to MainActivity
                    updateUI(user);

                    // Clear input fields
                    emailInput.setText("");
                    passwordInput.setText("");

                    // Redirect to MainActivity
                    Intent mainIntent = new Intent(LoginActivity.this, MainActivity.class);
                    startActivity(mainIntent);
                    finish();  // Close LoginActivity
                });
            }

            @Override
            public void onAuthFailure(String error) {
                Log.e(TAG, "Login failed: " + error);
                runOnUiThread(() -> {
                    // Re-enable login button
                    signInButton.setEnabled(true);
                    signInButton.setText("Sign In");

                    Toast.makeText(LoginActivity.this, "Login failed: " + error, Toast.LENGTH_LONG).show();

                    // Clear password field for security
                    passwordInput.setText("");
                });
            }
        });
    }

    private boolean validateLoginInput(String email, String password) {
        // Check if email is empty
        if (TextUtils.isEmpty(email)) {
            emailInput.setError("Email is required");
            emailInput.requestFocus();
            return false;
        }

        // Check if email format is valid
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            emailInput.setError("Please enter a valid email address");
            emailInput.requestFocus();
            return false;
        }

        // Check if password is empty
        if (TextUtils.isEmpty(password)) {
            passwordInput.setError("Password is required");
            passwordInput.requestFocus();
            return false;
        }

        // Check minimum password length
        if (password.length() < 6) {
            passwordInput.setError("Password must be at least 6 characters");
            passwordInput.requestFocus();
            return false;
        }

        // Clear any previous errors
        emailInput.setError(null);
        passwordInput.setError(null);

        return true;
    }

    private void initializeAuthService() {
        // Initialize AuthenticationService
        authenticationService = new AuthenticationService(this, this);
    }

    private void checkLoginStatus() {
        // If the user is already logged in, update the UI with their info
        if (authenticationService.isLoggedIn()) {
            User currentUser = authenticationService.getCurrentUser();
            if (currentUser != null) {
                Log.d(TAG, "Found existing user session: " + currentUser.getEmail());
                updateUI(currentUser);
            } else {
                Log.d(TAG, "No existing user session found");
                updateUI(null);
            }
        } else {
            Log.d(TAG, "User not logged in");
            updateUI(null);
        }
    }

    private void handleSignInClick() {
        // Trigger Google Sign-In if you are using Google Authentication
        Intent signInIntent = authenticationService.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    private void handleSignOutClick() {
        // Handle Google Sign-Out
        authenticationService.signOut(() -> {
            Log.d(TAG, "User signed out successfully");
            updateUI(null);
            // Clear input fields
            emailInput.setText("");
            passwordInput.setText("");
            Toast.makeText(LoginActivity.this, "Signed out successfully", Toast.LENGTH_SHORT).show();
        });
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == RC_SIGN_IN && data != null) {
            Log.d(TAG, "Google Sign-In result received");
            authenticationService.handleSignInResult(data);
        }
    }

    @Override
    public void onAuthSuccess(User user) {
        // When Google authentication is successful, update the UI and show welcome message
        Log.d(TAG, "Google authentication successful for user: " + user.getEmail());
        runOnUiThread(() -> {
            updateUI(user);
            Toast.makeText(this, "Welcome, " + user.getName() + "!", Toast.LENGTH_SHORT).show();
            Intent mainIntent = new Intent(this, MainActivity.class);
            startActivity(mainIntent);
            finish();
        });
    }

    @Override
    public void onAuthFailure(String error) {
        // Show error message if Google authentication fails
        Log.e(TAG, "Google authentication failed: " + error);
        runOnUiThread(() -> {
            updateUI(null);
            Toast.makeText(this, "Authentication failed: " + error, Toast.LENGTH_LONG).show();
        });
    }

    private void updateUI(User user) {
        // Update the UI based on the user's login status
        if (user != null) {
            Log.d(TAG, "Updating UI for logged in user: " + user.getName());
            signInGoogleButton.setVisibility(View.GONE);
            signOutButton.setVisibility(View.VISIBLE);
            userInfoText.setText("Welcome, " + user.getName() + "\nEmail: " + user.getEmail());
            userInfoText.setVisibility(View.VISIBLE);
        } else {
            Log.d(TAG, "Updating UI for logged out state");
            signInGoogleButton.setVisibility(View.VISIBLE);
            signOutButton.setVisibility(View.GONE);
            userInfoText.setVisibility(View.GONE);
        }
    }
}