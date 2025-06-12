package vn.edu.fpt.sapsmobile.activities.auth;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.main.MainActivity;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.services.AuthenticationService;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class LoginActivity  extends AppCompatActivity implements AuthenticationService.AuthCallback {
    private static final int RC_SIGN_IN = 9001;

    private AuthenticationService authenticationService;
    private Button signInGoogleButton, signOutButton;
    private TextView userInfoText;
   private TokenManager tokenManager ;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
        setContentView(R.layout.activity_login);

        if(tokenManager.isLoggedIn()){
            Intent mainIntent= new Intent(this, MainActivity.class) ;
            startActivity(mainIntent);
        }
        initializeViews();
        initializeAuthService();
        checkLoginStatus();
    }

    private void initializeViews() {
        signInGoogleButton = findViewById(R.id.sign_in_google_button);
        signOutButton = findViewById(R.id.sign_out_button);
        userInfoText = findViewById(R.id.user_info_text);

        signInGoogleButton.setOnClickListener(v -> handleSignInClick());
        signOutButton.setOnClickListener(v -> handleSignOutClick());
    }

    private void initializeAuthService() {
        authenticationService = new AuthenticationService(this, this);
    }

    private void checkLoginStatus() {
        // move to main activity
        if (authenticationService.isLoggedIn()) {
            updateUI(authenticationService.getCurrentUser());
        } else {
            updateUI(null);
        }
    }

    private void handleSignInClick() {
        Intent signInIntent = authenticationService.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    private void handleSignOutClick() {
        authenticationService.signOut(() -> updateUI(null));
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == RC_SIGN_IN && data != null) {
            authenticationService.handleSignInResult(data);
        }
    }

    // AuthCallback implementations
    @Override
    public void onAuthSuccess(User user) {
        runOnUiThread(() -> {
            updateUI(user);
            Toast.makeText(this, "Welcome, " + user.getName() + "!", Toast.LENGTH_SHORT).show();
        });
    }

    @Override
    public void onAuthFailure(String error) {
        runOnUiThread(() -> {
            updateUI(null);
            Toast.makeText(this, "Authentication failed: " + error, Toast.LENGTH_LONG).show();
        });
    }

    private void updateUI(User user) {
        if (user != null) {
            signInGoogleButton.setVisibility(View.GONE);
            signOutButton.setVisibility(View.VISIBLE);
            userInfoText.setText("Welcome, " + user.getName() + "\nEmail: " + user.getEmail());
            userInfoText.setVisibility(View.VISIBLE);
        } else {
            signInGoogleButton.setVisibility(View.VISIBLE);
            signOutButton.setVisibility(View.GONE);
            userInfoText.setVisibility(View.GONE);
        }
    }

}
