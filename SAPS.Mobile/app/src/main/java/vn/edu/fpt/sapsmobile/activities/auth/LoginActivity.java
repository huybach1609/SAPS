package vn.edu.fpt.sapsmobile.activities.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.Html;
import android.text.TextUtils;
import android.util.Log;
import android.util.Patterns;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.card.MaterialCardView;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.main.MainActivity;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.services.AuthenticationService;
import vn.edu.fpt.sapsmobile.utils.TokenManager;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;

public class LoginActivity extends AppCompatActivity implements AuthenticationService.AuthCallback {
    private static final String TAG = "LoginActivity";
    private static final int RC_SIGN_IN = 9001;
    private AuthenticationService authenticationService;
    private Button signInButton;
    private MaterialCardView signInGoogleButton;
    private TextView registerButton, forgotPasswordText;
    private TokenManager tokenManager;
    private EditText emailInput, passwordInput;
    private LoadingDialog loadingDialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getSupportActionBar() != null) getSupportActionBar().hide();
        setContentView(R.layout.activity_login);

        tokenManager = new TokenManager(this);
        if (tokenManager.isLoggedIn()) {
            startActivity(new Intent(this, MainActivity.class));
            finish();
            return;
        }

        initializeViews();
        initializeAuthService();
        loadingDialog = new LoadingDialog(this);
        checkLoginStatus();

        // Set up the HTML formatting for register text
        setupRegisterText();
    }

    private void initializeViews() {
        // Find views
        signInGoogleButton = findViewById(R.id.google_login_card);
        registerButton = findViewById(R.id.register);
        signInButton = findViewById(R.id.sign_in_button);
        emailInput = findViewById(R.id.email_input_edit_text);
        passwordInput = findViewById(R.id.password_input_edit_text);
        forgotPasswordText = findViewById(R.id.forgot_password_text);

        // Set click listeners
        signInGoogleButton.setOnClickListener(v -> handleSignInClick());
        registerButton.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });
        signInButton.setOnClickListener(v -> handleEmailLogin());
        forgotPasswordText.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, ForgotPasswordActivity.class));
        });

        // Set up back button if it exists
        ImageButton backButton = findViewById(R.id.back_button);
        if (backButton != null) {
            backButton.setOnClickListener(v -> onBackPressed());
        }
    }

    private void setupRegisterText() {
        // Process HTML formatting in the register text
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            registerButton.setText(Html.fromHtml(getString(R.string.login_register_suggestion), Html.FROM_HTML_MODE_COMPACT));
        } else {
            registerButton.setText(Html.fromHtml(getString(R.string.login_register_suggestion)));
        }
    }

    private void handleEmailLogin() {
        String email = emailInput.getText().toString().trim();
        String password = passwordInput.getText().toString().trim();

        if (!validateLoginInput(email, password)) return;

        loadingDialog.show("Signing in...");

        authenticationService.loginWithEmail(email, password, new AuthenticationService.AuthCallback() {
            @Override
            public void onAuthSuccess(User user) {
                runOnUiThread(() -> {
                    loadingDialog.hide();
                    Toast.makeText(LoginActivity.this, "Login successful! Welcome " + user.getName(), Toast.LENGTH_SHORT).show();
                    updateUI(user);
                    emailInput.setText("");
                    passwordInput.setText("");
                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
                    finish();
                });
            }

            @Override
            public void onAuthFailure(String error) {
                runOnUiThread(() -> {
                    loadingDialog.hide();
                    Toast.makeText(LoginActivity.this, "Login failed: " + error, Toast.LENGTH_LONG).show();
                    passwordInput.setText("");
                });
            }
        });
    }

    private boolean validateLoginInput(String email, String password) {
        if (TextUtils.isEmpty(email)) {
            emailInput.setError("Email is required");
            emailInput.requestFocus();
            return false;
        }
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            emailInput.setError("Please enter a valid email address");
            emailInput.requestFocus();
            return false;
        }
        if (TextUtils.isEmpty(password)) {
            passwordInput.setError("Password is required");
            passwordInput.requestFocus();
            return false;
        }
        if (password.length() < 6) {
            passwordInput.setError("Password must be at least 6 characters");
            passwordInput.requestFocus();
            return false;
        }

        emailInput.setError(null);
        passwordInput.setError(null);
        return true;
    }

    private void initializeAuthService() {
        authenticationService = new AuthenticationService(this, this);
    }

    private void checkLoginStatus() {
        if (authenticationService.isLoggedIn()) {
            User currentUser = authenticationService.getCurrentUser();
            updateUI(currentUser);
        } else {
            updateUI(null);
        }
    }

    private void handleSignInClick() {
        loadingDialog.show("Signing in with Google...");
        Intent signInIntent = authenticationService.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    private void handleSignOutClick() {
        authenticationService.signOut(() -> {
            updateUI(null);
            emailInput.setText("");
            passwordInput.setText("");
            Toast.makeText(LoginActivity.this, "Signed out successfully", Toast.LENGTH_SHORT).show();
        });
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_SIGN_IN && data != null) {
            authenticationService.handleSignInResult(data);
        }
    }

    @Override
    public void onAuthSuccess(User user) {
        runOnUiThread(() -> {
            loadingDialog.hide();
            updateUI(user);
            Toast.makeText(this, "Welcome, " + user.getName() + "!", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, MainActivity.class));
            finish();
        });
    }

    @Override
    public void onAuthFailure(String error) {
        runOnUiThread(() -> {
            loadingDialog.hide();
            updateUI(null);
            Toast.makeText(this, "Authentication failed: " + error, Toast.LENGTH_LONG).show();
        });
    }

    private void updateUI(User user) {
        if (user != null) {
            signInGoogleButton.setVisibility(View.GONE);
//            signOutButton.setVisibility(View.VISIBLE);
//            userInfoText.setText("Welcome, " + user.getName() + "\nEmail: " + user.getEmail());
//            userInfoText.setVisibility(View.VISIBLE);
        } else {
            signInGoogleButton.setVisibility(View.VISIBLE);
//            signOutButton.setVisibility(View.GONE);
//            userInfoText.setVisibility(View.GONE);
        }
    }
}
