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

    // Services and utilities
    private AuthenticationService authenticationService;
    private TokenManager tokenManager;
    private LoadingDialog loadingDialog;

    // UI components
    private EditText emailInput, passwordInput;
    private Button signInButton;
    private MaterialCardView signInGoogleButton;
    private TextView registerButton, forgotPasswordText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        hideActionBar();
        setContentView(R.layout.activity_login);

        initializeComponents();
        checkExistingLogin();
    }

    private void hideActionBar() {
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
    }

    private void initializeComponents() {
        tokenManager = new TokenManager(this);
        loadingDialog = new LoadingDialog(this);
        authenticationService = new AuthenticationService(this, this);

        initializeViews();
        setupClickListeners();
        setupRegisterText();
        handlePrefilledCredentials();
    }

    private void checkExistingLogin() {
        if (tokenManager.isLoggedIn()) {
            navigateToMainActivity();
            return;
        }
        updateUI(null);
    }

    private void initializeViews() {
        // Input fields
        emailInput = findViewById(R.id.email_input_edit_text);
        passwordInput = findViewById(R.id.password_input_edit_text);

        // Buttons
        signInButton = findViewById(R.id.sign_in_button);
        signInGoogleButton = findViewById(R.id.google_login_card);
        registerButton = findViewById(R.id.register);
        forgotPasswordText = findViewById(R.id.forgot_password_text);
    }

    private void setupClickListeners() {
        signInButton.setOnClickListener(v -> handleEmailLogin());
        signInGoogleButton.setOnClickListener(v -> handleGoogleSignIn());
        registerButton.setOnClickListener(v -> navigateToRegister());
        forgotPasswordText.setOnClickListener(v -> navigateToForgotPassword());

        setupBackButton();
    }

    private void setupBackButton() {
        ImageButton backButton = findViewById(R.id.back_button);
        if (backButton != null) {
            backButton.setOnClickListener(v -> onBackPressed());
        }
    }

    private void setupRegisterText() {
        String registerText = getString(R.string.login_register_suggestion);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
            registerButton.setText(Html.fromHtml(registerText, Html.FROM_HTML_MODE_COMPACT));
        } else {
            registerButton.setText(Html.fromHtml(registerText));
        }
    }

    private void handleEmailLogin() {
        String email = getEmailInput();
        String password = getPasswordInput();

        if (!isValidLoginInput(email, password)) {
            return;
        }

        showLoading("Signing in...");
        authenticationService.loginWithEmail(email, password, new EmailLoginCallback());
    }

    private String getEmailInput() {
        return emailInput.getText().toString().trim();
    }

    private String getPasswordInput() {
        return passwordInput.getText().toString().trim();
    }

    private boolean isValidLoginInput(String email, String password) {
        clearErrors();

        if (!isValidEmail(email)) {
            return false;
        }

        if (!isValidPassword(password)) {
            return false;
        }

        return true;
    }

    private void clearErrors() {
        emailInput.setError(null);
        passwordInput.setError(null);
    }

    private boolean isValidEmail(String email) {
        if (TextUtils.isEmpty(email)) {
            showEmailError("Email is required");
            return false;
        }

        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            showEmailError("Please enter a valid email address");
            return false;
        }

        return true;
    }

    private boolean isValidPassword(String password) {
        if (TextUtils.isEmpty(password)) {
            showPasswordError("Password is required");
            return false;
        }

        if (password.length() < 6) {
            showPasswordError("Password must be at least 6 characters");
            return false;
        }

        return true;
    }

    private void showEmailError(String message) {
        emailInput.setError(message);
        emailInput.requestFocus();
    }

    private void showPasswordError(String message) {
        passwordInput.setError(message);
        passwordInput.requestFocus();
    }

    private void handleGoogleSignIn() {
        showLoading("Signing in with Google...");
        Intent signInIntent = authenticationService.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    private void showLoading(String message) {
        loadingDialog.show(message);
    }

    private void hideLoading() {
        loadingDialog.hide();
    }

    private void clearInputFields() {
        emailInput.setText("");
        passwordInput.setText("");
    }

    private void clearPasswordField() {
        passwordInput.setText("");
    }

    // Navigation methods
    private void navigateToMainActivity() {
        startActivity(new Intent(this, MainActivity.class));
        finish();
    }

    private void navigateToRegister() {
        startActivity(new Intent(this, RegisterActivity.class));
    }

    private void navigateToForgotPassword() {
        startActivity(new Intent(this, ForgotPasswordActivity.class));
    }

    // Activity result handling
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_SIGN_IN && data != null) {
            authenticationService.handleSignInResult(data);
        }
    }

    // AuthenticationService.AuthCallback implementation
    @Override
    public void onAuthSuccess(User user) {
        runOnUiThread(() -> {
            hideLoading();
            updateUI(user);
            showSuccessMessage(user);
            navigateToMainActivity();
        });
    }

    @Override
    public void onAuthFailure(String error) {
        runOnUiThread(() -> {
            hideLoading();
            updateUI(null);
            showErrorMessage("Authentication failed: " + error);
        });
    }

    private void updateUI(User user) {
        boolean isLoggedIn = user != null;
        signInGoogleButton.setVisibility(isLoggedIn ? View.GONE : View.VISIBLE);
    }

    private void showSuccessMessage(User user) {
        String message = "Welcome, " + user.getFullName() + "!";
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private void showErrorMessage(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }

    // Inner class for email login callback
    private class EmailLoginCallback implements AuthenticationService.AuthCallback {
        @Override
        public void onAuthSuccess(User user) {
            runOnUiThread(() -> {
                hideLoading();
                showSuccessMessage("Login successful! Welcome " + user.getFullName());
                updateUI(user);
                clearInputFields();
                navigateToMainActivity();
            });
        }

        @Override
        public void onAuthFailure(String error) {
            runOnUiThread(() -> {
                hideLoading();
                showErrorMessage("Login failed: " + error);
                clearPasswordField();
            });
        }
    }

    private void showSuccessMessage(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private void handlePrefilledCredentials() {
        Intent intent = getIntent();
        if (intent != null) {
            String prefilledEmail = intent.getStringExtra("prefilled_email");
            String prefilledPassword = intent.getStringExtra("prefilled_password");
            
            if (prefilledEmail != null && !prefilledEmail.isEmpty()) {
                emailInput.setText(prefilledEmail);
            }
            
            if (prefilledPassword != null && !prefilledPassword.isEmpty()) {
                passwordInput.setText(prefilledPassword);
            }
        }
    }
}