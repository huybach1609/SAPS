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

    public LoadingDialog(Activity activity) {
        this.activity = activity;
    }

    public void show(String message) {
        if (dialog != null && dialog.isShowing()) return;

        dialog = new Dialog(activity);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        View view = LayoutInflater.from(activity).inflate(R.layout.dialog_loading, null);
        dialog.setContentView(view);
        dialog.setCancelable(false);

        TextView messageText = view.findViewById(R.id.loading_message);
        messageText.setText(message);

        dialog.show();
    }

    public void hide() {
        if (dialog != null && dialog.isShowing()) {
            dialog.dismiss();
        }
    }
}
