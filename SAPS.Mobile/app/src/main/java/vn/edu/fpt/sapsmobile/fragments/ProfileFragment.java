package vn.edu.fpt.sapsmobile.fragments;

import android.content.Intent;
import android.os.Bundle;
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
import vn.edu.fpt.sapsmobile.activities.auth.ChangePasswordActivity;
import vn.edu.fpt.sapsmobile.activities.auth.EditProfileActivity;
import vn.edu.fpt.sapsmobile.activities.auth.NotificationsListActivity;
import vn.edu.fpt.sapsmobile.activities.main.MainActivity;
import vn.edu.fpt.sapsmobile.models.User;

public class ProfileFragment extends Fragment {

    private MainActivity mainActivity;
    private User user;

    private ImageView profileImageView;
    private TextView profileName, profileEmail;
    private TextView idNumber, dateOfBirth, sex, nationality, placeOfOrigin, placeOfResidence, phone;
    private Button logoutButton;


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_profile, container, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        mainActivity = (MainActivity) requireActivity();
        user = mainActivity.getTokenManager().getUserData();

        // Header
        profileImageView = view.findViewById(R.id.profile_image);
        profileName = view.findViewById(R.id.profile_name);
        profileEmail = view.findViewById(R.id.profile_email);

        // Bind data
        profileName.setText(user.getName());
        profileEmail.setText(user.getEmail());
        loadImageProfile(user.getProfilePictureUrl());

        // Body fields
        idNumber = view.findViewById(R.id.id_number);
        dateOfBirth = view.findViewById(R.id.date_of_birth);
        sex = view.findViewById(R.id.sex);
        nationality = view.findViewById(R.id.nationality);
        placeOfOrigin = view.findViewById(R.id.place_of_origin);
        placeOfResidence = view.findViewById(R.id.place_of_residence);
        phone = view.findViewById(R.id.phone);
        TextView memberSince = view.findViewById(R.id.member_since);


        // Bind dữ liệu từ user model
        // Đúng (hiển thị đầy đủ)
        idNumber.setText(String.valueOf(user.getUserId()));

        dateOfBirth.setText(user.getDateOfBirth()); // cần thêm getter
        sex.setText(user.getSex());                 // cần thêm getter
        nationality.setText(user.getNationality()); // cần thêm getter
        placeOfOrigin.setText(user.getPlaceOfOrigin()); // cần thêm getter
        placeOfResidence.setText(user.getPlaceOfResidence()); // cần thêm getter
        phone.setText(user.getPhone());             // cần thêm getter

        // Format ngày từ createdAt (ví dụ: "2024-01-01T12:00:00Z") → "01/01/2024"
        String formattedDate = user.getCreatedAt() != null ? user.getCreatedAt().split("T")[0].replace("-", "/") : "N/A";
        memberSince.setText(formattedDate);


        // Logout
        logoutButton = view.findViewById(R.id.btn_logout);
        logoutButton.setOnClickListener(v -> {
            mainActivity.getAuthService().signOut(() -> mainActivity.logoutProgress());
        });

        // Nút Edit Personal Information
        Button editButton = view.findViewById(R.id.btn_edit_info);
        editButton.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), EditProfileActivity.class);
            startActivity(intent);
        });

        // Change Password Button
        Button btnChangePassword = view.findViewById(R.id.btn_change_password);
        btnChangePassword.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), ChangePasswordActivity.class);
            startActivity(intent);
        });

        // Notifications Button
        Button btnNotification = view.findViewById(R.id.btn_notification);
        btnNotification.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), NotificationsListActivity.class);
            startActivity(intent);
        });

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

}
