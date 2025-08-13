package vn.edu.fpt.sapsmobile.utils;

import android.app.Activity;
import android.app.Dialog;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.widget.ProgressBar;
import android.widget.TextView;

import vn.edu.fpt.sapsmobile.R;

public class LoadingDialog {
    private final Activity activity;
    private Dialog dialog;

    public LoadingDialog(Activity activity) { this.activity = activity; }

    public void show(String message) {
        // activity might already be finishing or destroyed
        if (activity == null || activity.isFinishing() || activity.isDestroyed()) return;
        if (dialog != null && dialog.isShowing()) return;

        dialog = new Dialog(activity);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        View view = LayoutInflater.from(activity).inflate(R.layout.dialog_loading, null);
        dialog.setContentView(view);
        dialog.setCancelable(false);

        TextView messageText = view.findViewById(R.id.loading_message);
        messageText.setText(message != null ? message : "");

        // transparent window to avoid white corners when Fragment changes
        if (dialog.getWindow() != null) {
            dialog.getWindow().setBackgroundDrawableResource(android.R.color.transparent);
        }

        dialog.show();
    }

    public void hide() {
        if (dialog != null) {
            if (dialog.isShowing()) dialog.dismiss();
            dialog = null; // prevent window leak
        }
    }
}

