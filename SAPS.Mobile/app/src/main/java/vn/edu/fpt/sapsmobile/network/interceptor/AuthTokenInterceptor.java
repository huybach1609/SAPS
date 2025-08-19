package vn.edu.fpt.sapsmobile.network.interceptor;

import java.io.IOException;
import okhttp3.*;
import vn.edu.fpt.sapsmobile.utils.JwtUtils;
import vn.edu.fpt.sapsmobile.utils.SessionActions;
import vn.edu.fpt.sapsmobile.utils.TokenManager;

public class AuthTokenInterceptor implements Interceptor {
    private final TokenManager tokenManager;
    private final SessionActions sessionActions;

    /** Expire early to avoid race (e.g., 30s before real expiry). */
    private static final int LEEWAY_SECONDS = 30;

    public AuthTokenInterceptor(TokenManager tokenManager, SessionActions sessionActions) {
        this.tokenManager = tokenManager;
        this.sessionActions = sessionActions;
    }

    @Override
    public Response intercept(Chain chain) throws IOException {
        String access = tokenManager.getAccessToken();

        if (access == null) {
            // No token, proceed without auth header
            return chain.proceed(chain.request());
        }

        // If expired (or nearly), force logout and cancel call.
        if (JwtUtils.isExpired(access, LEEWAY_SECONDS)) {
            sessionActions.logoutNow("Access token expired");
            throw new IOException("Access token expired"); // stop this request
        }

        // Attach Authorization header if missing
        Request req = chain.request();
        if (req.header("Authorization") == null) {
            req = req.newBuilder()
                    .addHeader("Authorization", "Bearer " + access.replaceFirst("(?i)^Bearer\\s+", ""))
                    .build();
        }

        return chain.proceed(req);
    }
}
