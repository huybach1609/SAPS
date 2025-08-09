package vn.edu.fpt.sapsmobile.activities.auth;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.services.AuthenticationService;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class WelcomeActivity extends AppCompatActivity {
    Button btnSignIn;
    Button btnRegister;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable edge-to-edge display
        EdgeToEdge.enable(this);

        setContentView(R.layout.activity_welcome);

        btnSignIn = findViewById(R.id.loginButton);
        btnRegister = findViewById(R.id.registerButton);

        btnSignIn.setOnClickListener(v -> handleSignInPageClick());
        btnRegister.setOnClickListener(v -> {
            startActivity(new Intent(this, RegisterActivity.class));
        });
    }

    private void handleSignInPageClick() {
        Intent login = new Intent(this, LoginActivity.class);
        startActivity(login);
    }


}
