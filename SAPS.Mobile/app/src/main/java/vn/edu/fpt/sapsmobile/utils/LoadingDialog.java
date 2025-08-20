package vn.edu.fpt.sapsmobile.utils;

import android.app.Activity;
import android.app.Dialog;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.google.android.material.button.MaterialButton;

import vn.edu.fpt.sapsmobile.R;

public class LoadingDialog {
    private final Activity activity;
    private Dialog dialog;
    private Runnable cancelCallback;

    public LoadingDialog(Activity activity) {
        this.activity = activity;
    }

    public void show(String message) {
        show(message, false, null);
    }

    public void show(String message, boolean showCancel, Runnable onCancel) {
        // activity might already be finishing or destroyed
        if (activity == null || activity.isFinishing() || activity.isDestroyed()) return;
        if (dialog != null && dialog.isShowing()) return;

        dialog = new Dialog(activity);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        View view = LayoutInflater.from(activity).inflate(R.layout.dialog_loading, null);
        dialog.setContentView(view);
        dialog.setCancelable(showCancel);

        this.cancelCallback = onCancel;

        TextView messageText = view.findViewById(R.id.loading_message);
        messageText.setText(message != null ? message : "Loading...");

        MaterialButton btnCancel = view.findViewById(R.id.btn_cancel);
        if (showCancel && onCancel != null) {
            btnCancel.setVisibility(View.VISIBLE);
            btnCancel.setOnClickListener(v -> {
                hide();
                onCancel.run();
            });
        } else {
            btnCancel.setVisibility(View.GONE);
        }

        // transparent window to avoid white corners when Fragment changes
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }
        dialog.show();
    }

    public void hide() {
        if (dialog != null) {
            if (dialog.isShowing()) dialog.dismiss();
            dialog = null;
            cancelCallback = null;
        }
    }
}

