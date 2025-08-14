package vn.edu.fpt.sapsmobile.fragments;

import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.RequestOptions;
import com.google.android.material.bottomsheet.BottomSheetBehavior;
import com.google.android.material.card.MaterialCardView;

import java.text.SimpleDateFormat;
import java.util.Locale;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.activities.profile.ChangePasswordActivity;
import vn.edu.fpt.sapsmobile.activities.profile.EditProfileActivity;
import vn.edu.fpt.sapsmobile.activities.NotificationsListActivity;
import vn.edu.fpt.sapsmobile.activities.main.MainActivity;
import vn.edu.fpt.sapsmobile.models.User;

public class ProfileFragment extends Fragment {

    private MainActivity mainActivity;
    private User user;

    // Header Views
    private ImageView profileImageView;
    private TextView profileName, profileEmail;
    private TextView verifyText;
    private ImageView verifyIcon;

    // Profile Information Views
    private TextView idNumber, dateOfBirth, sex, nationality, placeOfOrigin, placeOfResidence, phone;
    private TextView memberSince;

    // Bottom Sheet
    private BottomSheetBehavior<View> bottomSheetBehavior;
    private View bottomSheet;

    // Card Views
    private MaterialCardView notificationCardView, logoutCardView, changePasswordCardView,
            editProfileCardView, showProfileInfoCardView;

    // Constants
    private static final String DATE_FORMAT = "yyyy/MM/dd";
    private static final String NOT_AVAILABLE = "N/A";

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {

        // Set status bar color
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = requireActivity().getWindow();
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.TRANSPARENT);

        }

        return inflater.inflate(R.layout.fragment_profile, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        initializeActivity();
        initializeViews(view);
        setupUserData();
        setupBottomSheet(view);
        setupClickListeners();
        setupBackPressHandler();
    }

    private void initializeActivity() {
        mainActivity = (MainActivity) requireActivity();
        user = mainActivity.getTokenManager().getUserData();
    }

    private void initializeViews(View view) {
        // Header views
        profileImageView = view.findViewById(R.id.profile_image);
        profileName = view.findViewById(R.id.profile_name);
        profileEmail = view.findViewById(R.id.profile_email);
        verifyIcon = view.findViewById(R.id.verify_icon);
        verifyText = view.findViewById(R.id.verify_text);

        // Profile information views
        idNumber = view.findViewById(R.id.id_number);
        dateOfBirth = view.findViewById(R.id.date_of_birth);
        sex = view.findViewById(R.id.sex);
        nationality = view.findViewById(R.id.nationality);
        placeOfOrigin = view.findViewById(R.id.place_of_origin);
        placeOfResidence = view.findViewById(R.id.place_of_residence);
        phone = view.findViewById(R.id.phone);
        memberSince = view.findViewById(R.id.member_since);

        // Card views
        notificationCardView = view.findViewById(R.id.notification_cardview);
        logoutCardView = view.findViewById(R.id.logout_cardview);
        changePasswordCardView = view.findViewById(R.id.password_cardview);
        editProfileCardView = view.findViewById(R.id.edit_profile_cardview);
        showProfileInfoCardView = view.findViewById(R.id.show_info_cardview);
    }

    private void setupUserData() {
        if (user == null) {
            // Handle case where user data is not available
            setDefaultUserData();
            return;
        }

        // Set basic user info
        setTextSafely(profileName, user.getFullName());
        setTextSafely(profileEmail, user.getEmail());
        setTextSafely(phone, user.getPhone());

        loadProfileImage(user.getProfileImageUrl());
        setupVerificationStatus();
        setupProfileInformation();
        setupMemberSince();
    }

    private void setupVerificationStatus() {
        boolean isVerified = isUserVerified();
        verifyIcon.setVisibility(isVerified ? View.VISIBLE : View.GONE);
        verifyText.setVisibility(isVerified ? View.GONE : View.VISIBLE);
    }

    private boolean isUserVerified() {
        if (user.getClientProfile() == null) {
            return false;
        }

        String frontUrl = user.getClientProfile().getIdCardFrontUrl();
        String backUrl = user.getClientProfile().getIdCardBackUrl();

        return isValidUrl(frontUrl) && isValidUrl(backUrl);
    }

    private boolean isValidUrl(String url) {
        return url != null && !url.trim().isEmpty();
    }

    private void setupProfileInformation() {
        if (user.getClientProfile() == null) {
            setDefaultProfileInformation();
            return;
        }

        var profile = user.getClientProfile();
        setTextSafely(idNumber, String.valueOf(profile.getCitizenId()));
        setTextSafely(dateOfBirth, profile.getDateOfBirth());
        setTextSafely(sex, profile.getSexDisplay());
        setTextSafely(nationality, profile.getNationality());
        setTextSafely(placeOfOrigin, profile.getPlaceOfOrigin());
        setTextSafely(placeOfResidence, profile.getPlaceOfResidence());
    }

    private void setDefaultProfileInformation() {
        setTextSafely(idNumber, NOT_AVAILABLE);
        setTextSafely(dateOfBirth, NOT_AVAILABLE);
        setTextSafely(sex, NOT_AVAILABLE);
        setTextSafely(nationality, NOT_AVAILABLE);
        setTextSafely(placeOfOrigin, NOT_AVAILABLE);
        setTextSafely(placeOfResidence, NOT_AVAILABLE);
    }

    private void setDefaultUserData() {
        setTextSafely(profileName, NOT_AVAILABLE);
        setTextSafely(profileEmail, NOT_AVAILABLE);
        setTextSafely(phone, NOT_AVAILABLE);
        profileImageView.setImageResource(R.drawable.account_circle_24);
        verifyIcon.setVisibility(View.GONE);
        verifyText.setVisibility(View.VISIBLE);
        setDefaultProfileInformation();
        setTextSafely(memberSince, NOT_AVAILABLE);
    }

    private void setupMemberSince() {
        String formattedDate = NOT_AVAILABLE;
        if (user.getCreatedAt() != null) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(DATE_FORMAT, Locale.getDefault());
                formattedDate = sdf.format(user.getCreatedAt());
            } catch (Exception e) {
                // Handle date formatting error
                formattedDate = NOT_AVAILABLE;
            }
        }
        setTextSafely(memberSince, formattedDate);
    }

    private void setTextSafely(TextView textView, String text) {
        if (textView != null) {
            textView.setText(text != null ? text : NOT_AVAILABLE);
        }
    }

    private void loadProfileImage(String profileUrl) {
        if (profileImageView == null) return;

        if (isValidUrl(profileUrl)) {
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

    private void setupBottomSheet(View view) {
        bottomSheet = view.findViewById(R.id.standard_bottom_sheet);
        if (bottomSheet == null) return;

        bottomSheetBehavior = BottomSheetBehavior.from(bottomSheet);
        bottomSheetBehavior.setPeekHeight(200);
        bottomSheetBehavior.setHideable(true);
        bottomSheetBehavior.setState(BottomSheetBehavior.STATE_HIDDEN);

        bottomSheetBehavior.addBottomSheetCallback(new BottomSheetBehavior.BottomSheetCallback() {
            @Override
            public void onStateChanged(@NonNull View bottomSheet, int newState) {
                handleBottomSheetStateChange(newState);
            }

            @Override
            public void onSlide(@NonNull View bottomSheet, float slideOffset) {
                // Can add custom animations here if needed
            }
        });
    }

    private void handleBottomSheetStateChange(int newState) {
        switch (newState) {
            case BottomSheetBehavior.STATE_EXPANDED:
                // Bottom sheet fully expanded
                break;
            case BottomSheetBehavior.STATE_COLLAPSED:
                // Bottom sheet collapsed to peek height
                break;
            case BottomSheetBehavior.STATE_DRAGGING:
                // User is dragging
                break;
            case BottomSheetBehavior.STATE_SETTLING:
                // Bottom sheet is settling
                break;
            case BottomSheetBehavior.STATE_HIDDEN:
                // Bottom sheet is hidden
                break;
        }
    }

    private void setupClickListeners() {
        // Logout
        if (logoutCardView != null) {
            logoutCardView.setOnClickListener(v -> handleLogout());
        }

        // Edit Profile
        if (editProfileCardView != null) {
            editProfileCardView.setOnClickListener(v -> navigateToEditProfile());
        }

        // Change Password
        if (changePasswordCardView != null) {
            changePasswordCardView.setOnClickListener(v -> navigateToChangePassword());
        }

        // Notifications
        if (notificationCardView != null) {
            notificationCardView.setOnClickListener(v -> navigateToNotifications());
        }

        // Show Profile Information
        if (showProfileInfoCardView != null) {
            showProfileInfoCardView.setOnClickListener(v -> showBottomSheet());
        }
    }

    private void handleLogout() {
        if (mainActivity != null && mainActivity.getAuthService() != null) {
            mainActivity.getAuthService().signOut(() -> mainActivity.logoutProgress());
        }
    }

    private void navigateToEditProfile() {
        Intent intent = new Intent(getActivity(), EditProfileActivity.class);
        startActivity(intent);
    }

    private void navigateToChangePassword() {
        Intent intent = new Intent(getActivity(), ChangePasswordActivity.class);
        startActivity(intent);
    }

    private void navigateToNotifications() {
        Intent intent = new Intent(getActivity(), NotificationsListActivity.class);
        startActivity(intent);
    }

    private void showBottomSheet() {
        if (bottomSheetBehavior != null &&
                bottomSheetBehavior.getState() != BottomSheetBehavior.STATE_EXPANDED) {
            bottomSheetBehavior.setState(BottomSheetBehavior.STATE_EXPANDED);
        }
    }

    private void setupBackPressHandler() {
        requireActivity().getOnBackPressedDispatcher().addCallback(
                getViewLifecycleOwner(),
                new androidx.activity.OnBackPressedCallback(true) {
                    @Override
                    public void handleOnBackPressed() {
                        if (bottomSheetBehavior != null &&
                                bottomSheetBehavior.getState() == BottomSheetBehavior.STATE_EXPANDED) {
                            bottomSheetBehavior.setState(BottomSheetBehavior.STATE_HIDDEN);
                        } else {
                            setEnabled(false);
                            requireActivity().onBackPressed();
                        }
                    }
                }
        );
    }
}