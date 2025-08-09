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
import com.google.android.material.bottomsheet.BottomSheetBehavior;
import com.google.android.material.card.MaterialCardView;

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
    private TextView verifyText;
    private ImageView verifyIcon;
    private Button logoutButton;

    private BottomSheetBehavior<View> bottomSheetBehavior;
    private View bottomSheet;

    private MaterialCardView notificationCardView, logoutCardView, changePasswordCardView, editProfileCardView, showProfileInfomationCardView;

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
        verifyIcon = view.findViewById(R.id.verify_icon);
        verifyText = view.findViewById(R.id.verify_text);

        profileName.setText(user.getName());
        profileEmail.setText(user.getEmail());
        loadImageProfile(user.getProfilePictureUrl());


        initBottomSheet(view);

        //  Handle Back Press to close bottom sheet instead of leaving
        requireActivity().getOnBackPressedDispatcher().addCallback(getViewLifecycleOwner(),
                new androidx.activity.OnBackPressedCallback(true) {
                    @Override
                    public void handleOnBackPressed() {
                        if (bottomSheetBehavior.getState() == BottomSheetBehavior.STATE_EXPANDED) {
                            bottomSheetBehavior.setState(BottomSheetBehavior.STATE_HIDDEN);
                        } else {
                            // Allow normal back navigation
                            setEnabled(false);
                            requireActivity().onBackPressed();
                        }
                    }
                });




        // ✅ Kiểm tra xác minh CCCD cả 2 mặt
        if (
                user.getIdCardFrontUrl() != null && !user.getIdCardFrontUrl().isEmpty() &&
                        user.getIdCardBackUrl() != null && !user.getIdCardBackUrl().isEmpty()
        ) {
            verifyIcon.setVisibility(View.VISIBLE);
            verifyText.setVisibility(View.GONE);
        } else {
            verifyIcon.setVisibility(View.GONE);
            verifyText.setVisibility(View.VISIBLE);
        }

        // Thông tin cá nhân
        idNumber = view.findViewById(R.id.id_number);
        dateOfBirth = view.findViewById(R.id.date_of_birth);
        sex = view.findViewById(R.id.sex);
        nationality = view.findViewById(R.id.nationality);
        placeOfOrigin = view.findViewById(R.id.place_of_origin);
        placeOfResidence = view.findViewById(R.id.place_of_residence);
        phone = view.findViewById(R.id.phone);
        TextView memberSince = view.findViewById(R.id.member_since);

        // Gán dữ liệu
        idNumber.setText(String.valueOf(user.getUserId()));
        dateOfBirth.setText(user.getDateOfBirth());
        sex.setText(user.getSex());
        nationality.setText(user.getNationality());
        placeOfOrigin.setText(user.getPlaceOfOrigin());
        placeOfResidence.setText(user.getPlaceOfResidence());
        phone.setText(user.getPhone());

        // Format ngày
        String formattedDate = user.getCreatedAt() != null
                ? user.getCreatedAt().split("T")[0].replace("-", "/")
                : "N/A";
        memberSince.setText(formattedDate);

        // Logout
//        logoutButtoneron = view.findViewById(R.id.btn_logout);
        logoutCardView = view.findViewById(R.id.logout_cardview);
        logoutCardView.setOnClickListener(v -> {
            mainActivity.getAuthService().signOut(() -> mainActivity.logoutProgress());
        });

        // Edit Info
//        Button editButton = view.findViewById(R.id.btn_edit_info);
        editProfileCardView = view.findViewById(R.id.edit_profile_cardview);
        editProfileCardView.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), EditProfileActivity.class);
            startActivity(intent);
        });

        // Change Password
//        Button btnChangePassword = view.findViewById(R.id.btn_change_password);
        changePasswordCardView = view.findViewById(R.id.password_cardview);
        changePasswordCardView.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), ChangePasswordActivity.class);
            startActivity(intent);
        });

        // Notifications
        notificationCardView = view.findViewById(R.id.notification_cardview);
        notificationCardView.setOnClickListener(v -> {
            Intent intent = new Intent(getActivity(), NotificationsListActivity.class);
            startActivity(intent);
        });

        // Button to open bottom sheet
        showProfileInfomationCardView = view.findViewById(R.id.show_info_cardview);
        showProfileInfomationCardView.setOnClickListener(v -> {
            if (bottomSheetBehavior.getState() != BottomSheetBehavior.STATE_EXPANDED) {
                bottomSheetBehavior.setState(BottomSheetBehavior.STATE_EXPANDED);
            }
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
    // Optional: Handle back press to collapse bottom sheet instead of closing activity

    private void initBottomSheet(View view) {
        // Find bottom sheet view
        bottomSheet = view.findViewById(R.id.standard_bottom_sheet);

        // Get bottom sheet behavior
        bottomSheetBehavior = BottomSheetBehavior.from(bottomSheet);

        // Configure bottom sheet
        bottomSheetBehavior.setPeekHeight(200); // Height when collapsed
        bottomSheetBehavior.setHideable(true);
        bottomSheetBehavior.setState(BottomSheetBehavior.STATE_HIDDEN); // Start collapsed

        // Add callback to listen for state changes
        bottomSheetBehavior.addBottomSheetCallback(new BottomSheetBehavior.BottomSheetCallback() {
            @Override
            public void onStateChanged(View bottomSheet, int newState) {
                switch (newState) {
                    case BottomSheetBehavior.STATE_EXPANDED:
                        // Bottom sheet is fully expanded
                        // You can add animations or UI changes here
                        break;
                    case BottomSheetBehavior.STATE_COLLAPSED:
                        // Bottom sheet is collapsed to peek height
                        break;
                    case BottomSheetBehavior.STATE_DRAGGING:
                        // User is dragging the bottom sheet
                        break;
                    case BottomSheetBehavior.STATE_SETTLING:
                        // Bottom sheet is settling
                        break;
                }
            }

            @Override
            public void onSlide(View bottomSheet, float slideOffset) {
                // Called when bottom sheet is being dragged
                // slideOffset: 0.0 (collapsed) to 1.0 (expanded)
                // You can use this for custom animations
            }
        });




    }

}
