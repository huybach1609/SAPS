package vn.edu.fpt.sapsmobile.utils;
import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.ContextWrapper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.widget.TextView;
import com.google.android.material.button.MaterialButton;
import vn.edu.fpt.sapsmobile.R;

public class LoadingDialog {
    private final Activity activity;
    private Dialog dialog;
    private Runnable cancelCallback;

    public LoadingDialog(Context context) {
        this.activity = getActivityFromContext(context);
    }

    // Keep the original constructor for backward compatibility
    public LoadingDialog(Activity activity) {
        this.activity = activity;
    }

    private Activity getActivityFromContext(Context context) {
        if (context instanceof Activity) {
            return (Activity) context;
        }
        if (context instanceof ContextWrapper) {
            return getActivityFromContext(((ContextWrapper) context).getBaseContext());
        }
        throw new IllegalArgumentException("Context must be an Activity or contain an Activity");
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
                dismiss();
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

    public void dismiss() {
        if (dialog != null) {
            if (dialog.isShowing()) dialog.dismiss();
            dialog = null;
            cancelCallback = null;
        }
    }
}