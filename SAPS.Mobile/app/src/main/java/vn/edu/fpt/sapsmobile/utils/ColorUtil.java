package vn.edu.fpt.sapsmobile.utils;

import android.content.Context;
import android.graphics.Color;
import androidx.core.content.ContextCompat;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.enums.ShareVehicleStatus;

/**
 * Utility class for managing colors based on ShareVehicleStatus
 */
public class ColorUtil {

    /**
     * Get text color for ShareVehicleStatus
     * @param context Android context
     * @param status ShareVehicleStatus string value
     * @return Color integer for text
     */
    public static int getShareVehicleStatusColor(Context context, String status) {
        if (status == null) {
            return ContextCompat.getColor(context, R.color.md_theme_onSurface);
        }

        ShareVehicleStatus shareVehicleStatus = ShareVehicleStatus.fromString(status);
        if (shareVehicleStatus == null) {
            return ContextCompat.getColor(context, R.color.md_theme_onSurface);
        }

        switch (shareVehicleStatus) {
            case PENDING:
                return ContextCompat.getColor(context, R.color.md_theme_tertiary);
            case SHARED:
                return ContextCompat.getColor(context, R.color.md_theme_primary);
            case UNAVAILABLE:
                return ContextCompat.getColor(context, R.color.md_theme_error);
            case AVAILABLE:
                return ContextCompat.getColor(context, R.color.md_theme_secondary);
            default:
                return ContextCompat.getColor(context, R.color.md_theme_onSurface);
        }
    }

    /**
     * Get background color for ShareVehicleStatus
     * @param context Android context
     * @param status ShareVehicleStatus string value
     * @return Color integer for background
     */
    public static int getShareVehicleStatusBackgroundColor(Context context, String status) {
        if (status == null) {
            return ContextCompat.getColor(context, R.color.md_theme_surfaceVariant);
        }

        ShareVehicleStatus shareVehicleStatus = ShareVehicleStatus.fromString(status);
        if (shareVehicleStatus == null) {
            return ContextCompat.getColor(context, R.color.md_theme_surfaceVariant);
        }

        switch (shareVehicleStatus) {
            case PENDING:
                return ContextCompat.getColor(context, R.color.md_theme_tertiaryContainer);
            case SHARED:
                return ContextCompat.getColor(context, R.color.md_theme_primaryContainer);
            case UNAVAILABLE:
                return ContextCompat.getColor(context, R.color.md_theme_errorContainer);
            case AVAILABLE:
                return ContextCompat.getColor(context, R.color.md_theme_secondaryContainer);
            default:
                return ContextCompat.getColor(context, R.color.md_theme_surfaceVariant);
        }
    }

    /**
     * Get text color for ShareVehicleStatus using enum directly
     * @param context Android context
     * @param status ShareVehicleStatus enum
     * @return Color integer for text
     */
    public static int getShareVehicleStatusColor(Context context, ShareVehicleStatus status) {
        if (status == null) {
            return ContextCompat.getColor(context, R.color.md_theme_onSurface);
        }

        switch (status) {
            case PENDING:
                return ContextCompat.getColor(context, R.color.md_theme_tertiary);
            case SHARED:
                return ContextCompat.getColor(context, R.color.md_theme_primary);
            case UNAVAILABLE:
                return ContextCompat.getColor(context, R.color.md_theme_error);
            case AVAILABLE:
                return ContextCompat.getColor(context, R.color.md_theme_secondary);
            default:
                return ContextCompat.getColor(context, R.color.md_theme_onSurface);
        }
    }

    /**
     * Get background color for ShareVehicleStatus using enum directly
     * @param context Android context
     * @param status ShareVehicleStatus enum
     * @return Color integer for background
     */
    public static int getShareVehicleStatusBackgroundColor(Context context, ShareVehicleStatus status) {
        if (status == null) {
            return ContextCompat.getColor(context, R.color.md_theme_surfaceVariant);
        }

        switch (status) {
            case PENDING:
                return ContextCompat.getColor(context, R.color.md_theme_tertiaryContainer);
            case SHARED:
                return ContextCompat.getColor(context, R.color.md_theme_primaryContainer);
            case UNAVAILABLE:
                return ContextCompat.getColor(context, R.color.md_theme_errorContainer);
            case AVAILABLE:
                return ContextCompat.getColor(context, R.color.md_theme_secondaryContainer);
            default:
                return ContextCompat.getColor(context, R.color.md_theme_surfaceVariant);
        }
    }

    /**
     * Get a lighter version of the status color for subtle backgrounds
     * @param context Android context
     * @param status ShareVehicleStatus string value
     * @return Lighter color integer
     */
    public static int getShareVehicleStatusLightColor(Context context, String status) {
        int baseColor = getShareVehicleStatusBackgroundColor(context, status);
        return adjustColorAlpha(baseColor, 0.3f); // 30% opacity
    }

    /**
     * Get a darker version of the status color for emphasis
     * @param context Android context
     * @param status ShareVehicleStatus string value
     * @return Darker color integer
     */
    public static int getShareVehicleStatusDarkColor(Context context, String status) {
        int baseColor = getShareVehicleStatusColor(context, status);
        return adjustColorBrightness(baseColor, 0.8f); // 80% brightness
    }

    /**
     * Adjust color alpha (transparency)
     * @param color Original color
     * @param alpha Alpha value (0.0f to 1.0f)
     * @return Color with adjusted alpha
     */
    private static int adjustColorAlpha(int color, float alpha) {
        int red = Color.red(color);
        int green = Color.green(color);
        int blue = Color.blue(color);
        int alphaValue = (int) (255 * alpha);
        return Color.argb(alphaValue, red, green, blue);
    }

    /**
     * Adjust color brightness
     * @param color Original color
     * @param factor Brightness factor (0.0f to 1.0f)
     * @return Color with adjusted brightness
     */
    private static int adjustColorBrightness(int color, float factor) {
        int red = (int) (Color.red(color) * factor);
        int green = (int) (Color.green(color) * factor);
        int blue = (int) (Color.blue(color) * factor);
        int alpha = Color.alpha(color);
        return Color.argb(alpha, red, green, blue);
    }
}
