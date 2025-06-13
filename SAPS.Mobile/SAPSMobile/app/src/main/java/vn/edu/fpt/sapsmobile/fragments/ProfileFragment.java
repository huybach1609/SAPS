package vn.edu.fpt.sapsmobile.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.fragment.app.Fragment;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.RequestOptions;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.auth.LoginActivity;
import vn.edu.fpt.sapsmobile.activities.main.MainActivity;
import vn.edu.fpt.sapsmobile.models.User;


public class ProfileFragment extends Fragment {


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_profile, container, false);
    }

    MainActivity mainActivity;
    ImageView profileImageView;
    TextView profileName;
    TextView profileEmail;
    User user;

    private String TAG = "ProfileFragment";

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // Initialize profile views and user data
        mainActivity = (MainActivity) requireActivity();
        user = mainActivity.getTokenManager().getUserData();
        Log.i(TAG, "onViewCreated: " + user.toString());

        // name
        profileName = view.findViewById(R.id.profile_name);
        profileName.setText(user.getName());
        // email
        profileEmail = view.findViewById(R.id.profile_email);
        profileEmail.setText(user.getEmail());

        // logoutBtn
        logoutButton = view.findViewById(R.id.btn_logout);
        logoutButton.setOnClickListener(v -> {
            mainActivity.getAuthService().signOut(() -> {
                mainActivity.logoutProgress();
            });
        });

        // load image profile
        String profileUrl = user.getProfilePictureUrl();
        profileImageView = view.findViewById(R.id.profile_image);
        loadImageProfile(profileUrl);
    }

    private void loadImageProfile(String profileUrl) {
        if (profileUrl != null && !profileUrl.isEmpty()) {
            Glide.with(this)
                    .load(profileUrl)
                    .apply(new RequestOptions()
                            .placeholder(R.drawable.account_circle_24)
                            .error(R.drawable.account_circle_24))
                    .into(profileImageView);
        } else {
            profileImageView.setImageResource(R.drawable.account_circle_24);
        }
    }


    private Button logoutButton;

}
