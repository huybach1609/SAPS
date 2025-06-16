package vn.edu.fpt.sapsmobile.utils;

import android.content.Context;
import android.content.SharedPreferences;

import com.google.gson.Gson;

import vn.edu.fpt.sapsmobile.models.User;


public class TokenManager {
    private static final String PREFS_NAME = "auth_prefs";
    private static final String ACCESS_TOKEN_KEY = "access_token";
    private static final String REFRESH_TOKEN_KEY = "refresh_token";
    private static final String USER_DATA_KEY = "user_data";
    
    private SharedPreferences prefs;
    private SharedPreferences.Editor editor;

    public TokenManager(Context context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
    }

    public void saveTokens(String accessToken, String refreshToken) {
        editor.putString(ACCESS_TOKEN_KEY, accessToken);
        editor.putString(REFRESH_TOKEN_KEY, refreshToken);
        editor.apply();
    }

    public String getAccessToken() {
        return prefs.getString(ACCESS_TOKEN_KEY, null);
    }

    public String getRefreshToken() {
        return prefs.getString(REFRESH_TOKEN_KEY, null);
    }

    public void saveUserData(User user) {
        Gson gson = new Gson();
        String userJson = gson.toJson(user);
        editor.putString(USER_DATA_KEY, userJson);
        editor.apply();
    }

    public User getUserData() {
        String userJson = prefs.getString(USER_DATA_KEY, null);
        if (userJson != null) {
            Gson gson = new Gson();
            return gson.fromJson(userJson, User.class);
        }
        return null;
    }

    public void clearTokens() {
        editor.clear();
        editor.apply();
    }

    public boolean isLoggedIn() {
        return getAccessToken() != null;
    }
}