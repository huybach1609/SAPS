package vn.edu.fpt.sapsmobile.activities.auth;

import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.elevation.SurfaceColors;

import retrofit2.Call;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.network.api.AuthApi;
import vn.edu.fpt.sapsmobile.network.client.ApiClient;
import vn.edu.fpt.sapsmobile.services.AuthenticationService;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;

public class ForgotPasswordActivity extends AppCompatActivity {

    private EditText emailInput;
    private Button resetButton;
    private LoadingDialog loadingDialog;
    private AuthenticationService authenticationService;
    private MaterialToolbar toolbar;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);
        initViews();
        setupToolbar();
        setupListener();

    }

    private void setupListener() {

        resetButton.setOnClickListener(v -> {
            String email = emailInput.getText().toString().trim();

            if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                emailInput.setError("Enter a valid email");
                emailInput.requestFocus();
                return;
            }

            loadingDialog.show("Sending reset instructions...");
            AuthApi api = ApiClient.getServiceLast(this).create(AuthApi.class);

            api.resetPassword(email.trim()).enqueue(new retrofit2.Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    runOnUiThread(() -> {
                        loadingDialog.dismiss();
                        if (response.isSuccessful()) {
                            Toast.makeText(ForgotPasswordActivity.this, getString(R.string.toast_reset_link_sent), Toast.LENGTH_LONG).show();
                            finish();
                        } else {
                            Toast.makeText(ForgotPasswordActivity.this, getString(R.string.toast_reset_failed, "Server error: " + response.code()), Toast.LENGTH_LONG).show();
                        }
                    });
                }

                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    runOnUiThread(() -> {
                        loadingDialog.dismiss();
                        Toast.makeText(ForgotPasswordActivity.this, getString(R.string.toast_reset_failed, t.getMessage()), Toast.LENGTH_LONG).show();
                    });
                }

            });

        });

    }

    private void initViews() {
        toolbar = findViewById(R.id.topAppBar);
        emailInput = findViewById(R.id.edit_text_forgot_email);
        resetButton = findViewById(R.id.button_reset_password);

        //service
        loadingDialog = new LoadingDialog(this);
        authenticationService = new AuthenticationService(this);
    }

    private void setupToolbar() {


        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle(R.string.forgot_password_title);
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);

            int surface = SurfaceColors.SURFACE_0.getColor(this);
            getWindow().setStatusBarColor(surface);
            getWindow().setNavigationBarColor(surface);


            toolbar.setNavigationOnClickListener(v -> onBackPressed());
        }
    }
//    @Override
//    public boolean onOptionsItemSelected(MenuItem item) {
//        if (item.getItemId() == android.R.id.home) {
//            finish();
//            return true;
//        }
//        return super.onOptionsItemSelected(item);
//    }

}
