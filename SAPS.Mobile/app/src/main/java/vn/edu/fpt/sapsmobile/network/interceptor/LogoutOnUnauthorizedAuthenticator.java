package vn.edu.fpt.sapsmobile.network.interceptor;

import okhttp3.*;
import vn.edu.fpt.sapsmobile.utils.SessionActions;

import org.jetbrains.annotations.Nullable;
import java.io.IOException;

public class LogoutOnUnauthorizedAuthenticator implements Authenticator {
    private final SessionActions sessionActions;

    public LogoutOnUnauthorizedAuthenticator(SessionActions actions) {
        this.sessionActions = actions;
    }

    @Nullable
    @Override
    public Request authenticate(Route route, Response response) throws IOException {
        // Avoid retry loops
        if (responseCount(response) >= 1) return null;

        // Server says unauthorized -> logout and do NOT retry
        sessionActions.logoutNow("Unauthorized (401) from server");
        return null; // null = give up; caller gets 401
    }

    private static int responseCount(Response response) {
        int result = 1;
        while ((response = response.priorResponse()) != null) result++;
        return result;
    }
}
