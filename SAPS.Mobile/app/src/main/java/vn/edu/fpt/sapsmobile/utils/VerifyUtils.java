package vn.edu.fpt.sapsmobile.utils;

import android.text.TextUtils;

import vn.edu.fpt.sapsmobile.models.User;

public final class VerifyUtils {
    private VerifyUtils() {}

    public static boolean isUserVerified(User user) {
        if (user == null || user.getClientProfile() == null) return false;
        String front = user.getClientProfile().getIdCardFrontUrl();
        String back  = user.getClientProfile().getIdCardBackUrl();
        return !TextUtils.isEmpty(front) && !TextUtils.isEmpty(back);
//        return true; // tạm thời luôn coi là verified
    }
}
