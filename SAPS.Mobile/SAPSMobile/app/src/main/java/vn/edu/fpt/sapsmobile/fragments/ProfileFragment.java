package vn.edu.fpt.sapsmobile.fragments;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;

import androidx.fragment.app.Fragment;

import com.bumptech.glide.Glide;
import com.bumptech.glide.RequestBuilder;
import com.bumptech.glide.request.RequestOptions;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.main.MainActivity;
import vn.edu.fpt.sapsmobile.models.User;
import vn.edu.fpt.sapsmobile.services.AuthenticationService;


public class ProfileFragment extends Fragment {
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_profile, container, false);
    }

    MainActivity mainActivity;
    User user;

    private String TAG = "ProfileFragment";

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // Initialize profile views and user data
        mainActivity = (MainActivity) requireActivity();
        user = mainActivity.getTokenManager().getUserData();
        Log.i(TAG, "onViewCreated: " + user.toString());

        String profileUrl = user.getProfilePictureUrl();

        ImageView profileImageView = view.findViewById(R.id.profile_imgview);

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


       logoutButton = view.findViewById(R.id.btn_logout) ;

        logoutButton.setOnClickListener(v -> {
            mainActivity.getAuthService().signOut(()->{

            });
        });
    }
    private Button logoutButton;

}
