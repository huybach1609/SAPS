package vn.edu.fpt.sapsmobile.activities.profile;

import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.snackbar.Snackbar;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import vn.edu.fpt.sapsmobile.network.client.ApiTest;
import vn.edu.fpt.sapsmobile.network.api.UserApiService;
import vn.edu.fpt.sapsmobile.dtos.auth.ChangePasswordRequest;
import vn.edu.fpt.sapsmobile.utils.LoadingDialog;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

import vn.edu.fpt.sapsmobile.R;

public class ChangePasswordActivity extends AppCompatActivity {
    EditText edtCurrent, edtNew, edtConfirm;
    Button btnChange, btnBack;
    private LoadingDialog loadingDialog;
    private TokenManager tokenManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_change_password);

        // action bar
        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.setTitle("Change Password");
            actionBar.setDisplayHomeAsUpEnabled(true);
        }

        
        edtCurrent = findViewById(R.id.edt_current);
        edtNew = findViewById(R.id.edt_new);
        edtConfirm = findViewById(R.id.edt_confirm);
        loadingDialog = new LoadingDialog(this);
        tokenManager = new TokenManager(this);

        btnChange = findViewById(R.id.btn_change);
        btnChange.setOnClickListener(v -> {

            String current = edtCurrent.getText().toString();
            String newPass = edtNew.getText().toString();
            String confirm = edtConfirm.getText().toString();


            if (!newPass.equals(confirm)) {
                Snackbar.make(v, getString(R.string.toast_password_confirmation_mismatch), Snackbar.LENGTH_LONG).show();
                Toast.makeText(this, "", Toast.LENGTH_SHORT).show();
                return;
            }
            if (newPass.length() < 8 || !newPass.matches(".*\\d.*") || !newPass.matches(".*[A-Z].*")) {
                Snackbar.make(v, getString(R.string.toast_password_requirements_not_met), Snackbar.LENGTH_LONG).show();
            }
            else {
                fetchChangePassword(current, newPass);
            }
        });
    }

    private void fetchChangePassword(String current, String newPass) {
        // input : current, newPass, userId
        // url : /api/user/change-password
        String userId = tokenManager.getUserData() != null ? tokenManager.getUserData().getId() : null;
        if (userId == null) {
            Snackbar.make(findViewById(android.R.id.content), getString(R.string.toast_not_logged_in), Snackbar.LENGTH_LONG).show();
            return;
        }

        Log.i("check", "userId: " + userId);
        Log.i("check", "oldPass: " + current);
        Log.i("check", "newPass: " + newPass);

        loadingDialog.show("Changing password...");

        // NOTE: change them to ApiClient
        Retrofit retrofit = ApiTest.getServiceLast(this);
        UserApiService usersApiService = retrofit.create(UserApiService.class);

        ChangePasswordRequest body = new ChangePasswordRequest(userId, current, newPass);
        Call<Void> call = usersApiService.changePassword(body);

        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                loadingDialog.dismiss();
                if (response.isSuccessful()) {
                    // clear input
                    edtCurrent.setText("");
                    edtNew.setText("");
                    edtConfirm.setText("");

                    // show snack bar
                    Snackbar.make(findViewById(android.R.id.content), getString(R.string.toast_password_changed_success), Snackbar.LENGTH_LONG).show();

                } else {
                    String errorMessage = getErrorMessage(response.code());
                    Snackbar.make(findViewById(android.R.id.content), errorMessage, Snackbar.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                loadingDialog.dismiss();
                String errorMessage = getString(R.string.toast_network_error_occurred);
                if (t instanceof java.net.SocketTimeoutException) {
                    errorMessage = getString(R.string.toast_request_timeout);
                } else if (t instanceof java.net.ConnectException) {
                    errorMessage = getString(R.string.toast_cannot_connect_server);
                } else if (t.getMessage() != null && t.getMessage().contains("Broken pipe")) {
                    errorMessage = getString(R.string.toast_connection_lost);
                } else if (t.getMessage() != null) {
                    errorMessage = getString(R.string.toast_network_error_with_message, t.getMessage());
                }
                Snackbar.make(findViewById(android.R.id.content), errorMessage, Snackbar.LENGTH_LONG).show();
            }
        });
    }

    private String getErrorMessage(int statusCode) {
        switch (statusCode) {
            case 400:
                return getString(R.string.toast_current_password_incorrect);
            case 404:
                return getString(R.string.toast_user_not_found);
            case 500:
                return getString(R.string.toast_server_error);
            default:
                return getString(R.string.toast_failed_change_password);
        }
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            finish();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

}

