package vn.edu.fpt.sapsmobile.utils;

import android.content.Context;

import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.Locale;

public class StringUtils {
    public static String getErrorMessage(Context context, String errorCode) {
        int resId = context.getResources().getIdentifier(errorCode, "string", context.getPackageName());
        if (resId != 0) {
            return context.getString(resId);
        } else {
            return errorCode; // fallback nếu chưa khai báo
        }
    }


    // Method 1: Simple VND formatting with thousand separators
    public static String formatVND(double cost) {
        DecimalFormat formatter = new DecimalFormat("#,###");
        return formatter.format(cost) + " VND";
    }
    
    // Method 2: VND formatting with currency symbol
    public static String formatVNDWithSymbol(double cost) {
        DecimalFormat formatter = new DecimalFormat("#,###");
        return formatter.format(cost) + " ₫";
    }
    
    // Method 3: VND formatting using Locale (recommended)
    public static String formatVNDLocale(double cost) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return formatter.format(cost);
    }
    

    
    // Method 5: Format with conditional decimal places
    public static String formatVNDSmart(double cost) {
        // Only show decimals if they're not zero
        if (cost == Math.floor(cost)) {
            return formatVND(cost);
        } else {
            DecimalFormat formatter = new DecimalFormat("#,##0.00");
            return formatter.format(cost) + " VND";
        }
    }
    

    
    // Method 7: Safe formatting with null/error handling
    public static String formatVNDSafe(Double cost) {
        if (cost == null || Double.isNaN(cost) || Double.isInfinite(cost)) {
            return "0 VND";
        }
        return formatVND(cost);
    }
    
    // Method 8: Format without decimals (integer VND)
    public static String formatVNDInteger(double cost) {
        DecimalFormat formatter = new DecimalFormat("#,###");
        return formatter.format(Math.round(cost)) + " VND";
    }
    

}