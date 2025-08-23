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
import vn.edu.fpt.sapsmobile.network.service.UserApiService;
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
                Snackbar.make(v, "Password confirmation does not match", Snackbar.LENGTH_LONG).show();
                Toast.makeText(this, "", Toast.LENGTH_SHORT).show();
                return;
            }
            if (newPass.length() < 8 || !newPass.matches(".*\\d.*") || !newPass.matches(".*[A-Z].*")) {
                Snackbar.make(v, "Password does not meet requirements", Snackbar.LENGTH_LONG).show();
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
            Snackbar.make(findViewById(android.R.id.content), "Not logged in", Snackbar.LENGTH_LONG).show();
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
                    Snackbar.make(findViewById(android.R.id.content), "Password changed successfully!", Snackbar.LENGTH_LONG).show();

                } else {
                    String errorMessage = getErrorMessage(response.code());
                    Snackbar.make(findViewById(android.R.id.content), errorMessage, Snackbar.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                loadingDialog.dismiss();
                String errorMessage = "Network error occurred";
                if (t instanceof java.net.SocketTimeoutException) {
                    errorMessage = "Request timed out. Please try again.";
                } else if (t instanceof java.net.ConnectException) {
                    errorMessage = "Cannot connect to server. Please check your connection.";
                } else if (t.getMessage() != null && t.getMessage().contains("Broken pipe")) {
                    errorMessage = "Connection lost. Please try again.";
                } else if (t.getMessage() != null) {
                    errorMessage = "Network error: " + t.getMessage();
                }
                Snackbar.make(findViewById(android.R.id.content), errorMessage, Snackbar.LENGTH_LONG).show();
            }
        });
    }

    private String getErrorMessage(int statusCode) {
        switch (statusCode) {
            case 400:
                return "Current password is incorrect or invalid request.";
            case 404:
                return "User not found. Please log in again.";
            case 500:
                return "Server error. Please try again later.";
            default:
                return "Failed to change password. Please try again.";
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

