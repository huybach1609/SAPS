package vn.edu.fpt.sapsmobile.activities.auth;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.services.AuthenticationService;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;

public class ForgotPasswordActivity extends AppCompatActivity {

    private EditText emailInput;
    private Button resetButton;
    private LoadingDialog loadingDialog;
    private AuthenticationService authenticationService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        emailInput = findViewById(R.id.edit_text_forgot_email);
        resetButton = findViewById(R.id.button_reset_password);
        loadingDialog = new LoadingDialog(this);
        authenticationService = new AuthenticationService(this);

        resetButton.setOnClickListener(v -> {
            String email = emailInput.getText().toString().trim();

            if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                emailInput.setError("Enter a valid email");
                emailInput.requestFocus();
                return;
            }

            loadingDialog.show("Sending reset instructions...");
            authenticationService.resetPassword(email, new AuthenticationService.AuthCallback() {
                @Override
                public void onAuthSuccess(vn.edu.fpt.sapsmobile.models.User user) {
                    runOnUiThread(() -> {
                        loadingDialog.dismiss();
                        Toast.makeText(ForgotPasswordActivity.this, getString(R.string.toast_reset_link_sent), Toast.LENGTH_LONG).show();
                        finish();
                    });
                }

                @Override
                public void onAuthFailure(String error) {
                    runOnUiThread(() -> {
                        loadingDialog.dismiss();
                        Toast.makeText(ForgotPasswordActivity.this, getString(R.string.toast_reset_failed, error), Toast.LENGTH_LONG).show();
                    });
                }
            });
        });
    }
}
