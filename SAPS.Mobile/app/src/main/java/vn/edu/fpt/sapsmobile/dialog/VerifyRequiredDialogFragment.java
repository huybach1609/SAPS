package vn.edu.fpt.sapsmobile.dialog;

import android.app.Dialog;
import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.profile.EditProfileActivity;

public class VerifyRequiredDialogFragment extends DialogFragment {
    public static final String TAG = "VerifyRequiredDialog";
    public static VerifyRequiredDialogFragment newInstance() { return new VerifyRequiredDialogFragment(); }

    @NonNull @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        return new MaterialAlertDialogBuilder(requireContext())
                .setTitle(R.string.verify_required_title)
                .setMessage(R.string.verify_required_message)
                .setCancelable(false)
                .setPositiveButton(R.string.go_verify_now, (d, w) -> {
                    startActivity(new Intent(requireContext(), EditProfileActivity.class));
                    d.dismiss();
                })
                .setNegativeButton(android.R.string.cancel, (d, w) -> d.dismiss())
                .create();
    }
}
