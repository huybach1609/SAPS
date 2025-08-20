package vn.edu.fpt.sapsmobile.utils;

import com.auth0.android.jwt.JWT;

public final class JwtUtils {

    private static final String CLAIM_NAME_IDENTIFIER =
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

    /**
     * Extracts the UserId (nameidentifier claim) from the JWT access token.
     * @param accessToken The raw JWT string (without "Bearer " prefix).
     * @return The UserId as String, or null if not present/invalid.
     */
    public static String getUserIdFromToken(String accessToken) {
        try {
            if (accessToken == null || accessToken.trim().isEmpty()) return null;

            // Remove "Bearer " if present
            String raw = accessToken.replaceFirst("(?i)^Bearer\\s+", "");

            JWT jwt = new JWT(raw);
            return jwt.getClaim(CLAIM_NAME_IDENTIFIER).asString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // keep your existing readClaims method if you want to debug/inspect all claims
    public static void readClaims(String token) {
        JWT jwt = new JWT(token);

        String jti = jwt.getId();
        String issuer = jwt.getIssuer();
        String audience = jwt.getAudience() != null && !jwt.getAudience().isEmpty()
                ? jwt.getAudience().get(0) : null;
        boolean expired = jwt.isExpired(10);

        String nameId = jwt.getClaim(CLAIM_NAME_IDENTIFIER).asString();
        String email  = jwt.getClaim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress").asString();
        String phone  = jwt.getClaim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone").asString();
        String name   = jwt.getClaim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name").asString();
        String role   = jwt.getClaim("http://schemas.microsoft.com/ws/2008/06/identity/claims/role").asString();

        // You can log/return them as needed
    }
    /** Returns true if token is expired, with optional leeway (seconds). */
    public static boolean isExpired(String token, int leewaySeconds) {
        if (token == null || token.trim().isEmpty()) return true;
        String raw = token.replaceFirst("(?i)^Bearer\\s+", "");
        try {
            JWT jwt = new JWT(raw);
            return jwt.isExpired(leewaySeconds);
        } catch (Exception e) {
            return true; // treat parse errors as expired
        }
    }

    /** Returns milliseconds until expiry (negative if already expired). */
    public static long millisUntilExpiry(String token) {
        if (token == null) return -1;
        String raw = token.replaceFirst("(?i)^Bearer\\s+", "");
        try {
            JWT jwt = new JWT(raw);
            if (jwt.getExpiresAt() == null) return -1;
            return jwt.getExpiresAt().getTime() - System.currentTimeMillis();
        } catch (Exception e) {
            return -1;
        }
    }
}
