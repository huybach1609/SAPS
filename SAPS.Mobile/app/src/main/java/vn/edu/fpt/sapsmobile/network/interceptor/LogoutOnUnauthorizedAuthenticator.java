package vn.edu.fpt.sapsmobile.network.interceptor;

import android.util.Log;

import okhttp3.*;
import vn.edu.fpt.sapsmobile.utils.SessionActions;

import org.jetbrains.annotations.Nullable;
import java.io.IOException;

public class LogoutOnUnauthorizedAuthenticator implements Authenticator {
    private  String TAG = "LogoutOnUnauthorizedAuthenticator";

    public LogoutOnUnauthorizedAuthenticator() {
    }

    @Nullable
    @Override
    public Request authenticate(Route route, Response response) throws IOException {
        // Avoid retry loops
        if (responseCount(response) >= 1) return null;

        Log.i(TAG, "authenticate: return 401"  );
        // Server says unauthorized -> logout and do NOT retry
        return null; // null = give up; caller gets 401
    }

    private static int responseCount(Response response) {
        int result = 1;
        while ((response = response.priorResponse()) != null) result++;
        return result;
    }
}
