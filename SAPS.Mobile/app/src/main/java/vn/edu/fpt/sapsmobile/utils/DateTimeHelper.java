package vn.edu.fpt.sapsmobile.utils;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class DateTimeHelper {

    // Output format for Vietnamese locale
    private static final DateTimeFormatter OUTPUT_FORMAT =
            DateTimeFormatter.ofPattern("HH'h'mm dd/MM/yyyy", new Locale("vi"));
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private static final DateTimeFormatter FORMATTER_WITH_SPACE = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // Input formatters for various datetime patterns
    private static final List<DateTimeFormatter> INPUT_FORMATTERS = new ArrayList<>();

    static {
        INPUT_FORMATTERS.add(DateTimeFormatter.ISO_LOCAL_DATE_TIME);            // 2025-07-03T14:30:00
        INPUT_FORMATTERS.add(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")); // 2025-07-03T14:30
        INPUT_FORMATTERS.add(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")); // 2025-07-03 14:30:00
        INPUT_FORMATTERS.add(DateTimeFormatter.ofPattern("yyyy-MM-dd"));         // 2025-07-03 (-> 00:00)
        // Add UTC formats
        INPUT_FORMATTERS.add(DateTimeFormatter.ISO_OFFSET_DATE_TIME);            // 2025-07-03T14:30:00Z or +00:00
        INPUT_FORMATTERS.add(DateTimeFormatter.ISO_INSTANT);                     // 2025-07-03T14:30:00Z
    }

    /**
     * Format datetime string (supports UTC input) to local device timezone.
     * Input can be UTC (with Z suffix or +00:00) or local datetime.
     * Output: "14h30 ngày 03/07/2025" or localized format.
     */
//    public static String formatDateTime(String input) {
//        if (input == null || input.trim().isEmpty()) return "";
//
//        ZonedDateTime zonedDateTime = tryParseToZonedDateTime(input);
//        if (zonedDateTime == null) return input;
//
//        // Convert to device timezone
//        ZonedDateTime localZonedDateTime = zonedDateTime.withZoneSameInstant(ZoneId.systemDefault());
//
//        // Format using default locale
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, dd MMMM yyyy", Locale.getDefault());
//        return localZonedDateTime.format(formatter);
//    }

    /**
     * Format datetime string (supports UTC input) to Vietnam timezone (UTC+7).
     * Input can be UTC (with Z suffix or +00:00) or local datetime.
     * Output: "14h30 ngày 03/07/2025" in Vietnam timezone.
     */

    /**
     * Format datetime string (supports UTC input) to Vietnam timezone (UTC+7).
     * Input can be UTC (with Z suffix or +00:00) or local datetime.
     * Output: "14h30 ngày 03/07/2025" in Vietnam timezone.
     */
    public static ZonedDateTime changeToUCT7(String input) {

        LocalDateTime localDateTime = LocalDateTime.parse(input);

        // Treat the input as UTC (map to UTC 0)
        ZonedDateTime entry = localDateTime.atZone(ZoneOffset.UTC);
        if (entry == null) return null;
        ZonedDateTime vietnamDateTime = entry.withZoneSameInstant(VIETNAM_ZONE);

        return vietnamDateTime;
    }

    // Alternative method - more flexible with automatic format detection
    public static ZonedDateTime changeToUCT7Flexible(String input) {
        if (input == null || input.trim().isEmpty()) {
            return null;
        }

        try {
            String cleanInput = input.trim();
            LocalDateTime localDateTime;

            // Replace space with 'T' if needed to make it ISO compliant
            if (cleanInput.contains(" ") && !cleanInput.contains("T")) {
                cleanInput = cleanInput.replace(" ", "T");
            }

            // Try parsing with different approaches
            try {
                localDateTime = LocalDateTime.parse(cleanInput);
            } catch (DateTimeParseException e) {
                // Try with the space format
                localDateTime = LocalDateTime.parse(input.trim(), FORMATTER_WITH_SPACE);
            }

            // Convert UTC to Vietnam timezone
            ZonedDateTime utcDateTime = localDateTime.atZone(ZoneOffset.UTC);
            return utcDateTime.withZoneSameInstant(VIETNAM_ZONE);

        } catch (Exception e) {
            System.err.println("Failed to parse datetime: " + input + " - " + e.getMessage());
            return null;
        }
    }

    public static String formatDateTime(String input) {
        if (input == null || input.trim().isEmpty()) return "";

        try {
            // Convert to Vietnam timezone (UTC+7)
            ZonedDateTime vietnamDateTime = changeToUCT7(input).withZoneSameInstant(VIETNAM_ZONE);

            // Format output
            return vietnamDateTime.format(OUTPUT_FORMAT);
        } catch (DateTimeParseException e) {
            e.printStackTrace();
            return input; // fallback
        }
    }


    /**
     * Format datetime string specifically for Vietnamese locale.
     * Handles UTC to local timezone conversion.
     */
    public static String formatDateTimeVietnamese(String input) {
        if (input == null || input.trim().isEmpty()) return "";

        ZonedDateTime zonedDateTime = tryParseToZonedDateTime(input);
        if (zonedDateTime == null) return input;

        // Convert to device timezone
        ZonedDateTime localZonedDateTime = zonedDateTime.withZoneSameInstant(ZoneId.systemDefault());

        return localZonedDateTime.format(OUTPUT_FORMAT);
    }

    /**
     * Convert UTC datetime string to device local timezone.
     * Returns LocalDateTime in device timezone.
     */
    public static LocalDateTime utcToLocal(String utcDateTimeStr) {
        if (utcDateTimeStr == null || utcDateTimeStr.trim().isEmpty()) return null;

        ZonedDateTime utcDateTime = tryParseAsUtc(utcDateTimeStr);
        if (utcDateTime == null) return null;

        return utcDateTime.withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
    }

    /**
     * Convert local datetime to UTC string.
     */
    public static String localToUtc(LocalDateTime localDateTime) {
        if (localDateTime == null) return "";

        ZonedDateTime zonedLocal = localDateTime.atZone(ZoneId.systemDefault());
        ZonedDateTime utcDateTime = zonedLocal.withZoneSameInstant(ZoneOffset.UTC);

        return utcDateTime.format(DateTimeFormatter.ISO_INSTANT);
    }

    /**
     * Calculate duration between entry and exit times.
     * Both inputs can be UTC or local time - they will be properly converted.
     */
    public static String calculateDuration(String entryDateTimeStr, String exitDateTimeStr) {
        if (entryDateTimeStr == null || entryDateTimeStr.trim().isEmpty()) return "";


        ZonedDateTime vietnamDateTime = changeToUCT7(entryDateTimeStr).withZoneSameInstant(VIETNAM_ZONE);

        ZonedDateTime exit;
        if (exitDateTimeStr == null || exitDateTimeStr.trim().isEmpty()) {
            // Use current time in device timezone
            exit = ZonedDateTime.now(ZoneId.systemDefault());
        } else {
            exit = tryParseToZonedDateTime(exitDateTimeStr);
            if (exit == null) return "";
        }

        // Convert both to same timezone for accurate calculation
        ZonedDateTime entryLocal = vietnamDateTime.withZoneSameInstant(ZoneId.systemDefault());
        ZonedDateTime exitLocal = exit.withZoneSameInstant(ZoneId.systemDefault());

        Duration duration = Duration.between(entryLocal, exitLocal);

        long totalMinutes = duration.toMinutes();
        if (totalMinutes < 0) return ""; // Invalid duration

        long days = totalMinutes / (24 * 60);
        long hours = (totalMinutes % (24 * 60)) / 60;
        long minutes = totalMinutes % 60;

        StringBuilder result = new StringBuilder();
        if (days > 0) result.append(days).append("d ");
        if (hours > 0) result.append(hours).append("h ");
        if (minutes > 0) result.append(minutes).append("m");

        return result.toString().trim();
    }

    /**
     * Format only the date part in local timezone.
     */
    public static String formatDate(String dateTime) {
        if (dateTime == null || dateTime.trim().isEmpty()) return "";

        ZonedDateTime zonedDateTime = tryParseToZonedDateTime(dateTime);
        if (zonedDateTime == null) return dateTime;

        ZonedDateTime localZonedDateTime = zonedDateTime.withZoneSameInstant(ZoneId.systemDefault());
        DateTimeFormatter out = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.getDefault());
        return localZonedDateTime.format(out);
    }

    /**
     * Get current UTC time as string.
     */
    public static String getCurrentUtcString() {
        return ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_INSTANT);
    }

    /**
     * Get current local time as string.
     */
    public static String getCurrentLocalString() {
        return LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
    }

    /**
     * Check if a datetime string represents UTC time.
     */
    public static boolean isUtcFormat(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty()) return false;
        String trimmed = dateTimeStr.trim();
        return trimmed.endsWith("Z") || trimmed.contains("+00:00") || trimmed.contains("-00:00");
    }

    // --- Helper methods ---

    private static ZonedDateTime tryParseToZonedDateTime(String input) {
        String trimmed = input.trim();

        // Try parsing with timezone info first
        try {
            return ZonedDateTime.parse(trimmed, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        } catch (DateTimeParseException ignored) {
        }

        try {
            return ZonedDateTime.parse(trimmed, DateTimeFormatter.ISO_ZONED_DATE_TIME);
        } catch (DateTimeParseException ignored) {
        }

        // Try as instant (UTC)
        try {
            return ZonedDateTime.parse(trimmed, DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC));
        } catch (DateTimeParseException ignored) {
        }

        // If no timezone info, try parsing as local datetime and assume device timezone
        LocalDateTime localDateTime = tryParseToLocalDateTime(trimmed);
        if (localDateTime != null) {
            return localDateTime.atZone(ZoneId.systemDefault());
        }

        return null;
    }

    private static ZonedDateTime tryParseAsUtc(String input) {
        String trimmed = input.trim();

        // Add Z suffix if not present to indicate UTC
        if (!isUtcFormat(trimmed) && !trimmed.contains("+") && !trimmed.contains("Z")) {
            trimmed = trimmed + "Z";
        }

        try {
            return ZonedDateTime.parse(trimmed, DateTimeFormatter.ISO_OFFSET_DATE_TIME.withZone(ZoneOffset.UTC));
        } catch (DateTimeParseException ignored) {
        }

        try {
            return ZonedDateTime.parse(trimmed, DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC));
        } catch (DateTimeParseException ignored) {
        }

        return null;
    }

    private static LocalDateTime tryParseToLocalDateTime(String input) {
        String trimmed = input.trim();

        for (DateTimeFormatter f : INPUT_FORMATTERS) {
            try {
                if (f == DateTimeFormatter.ofPattern("yyyy-MM-dd")) {
                    java.time.LocalDate date = java.time.LocalDate.parse(trimmed, f);
                    return date.atStartOfDay();
                }
                return LocalDateTime.parse(trimmed, f);
            } catch (DateTimeParseException ignored) {
            }
        }

        return null;
    }
}