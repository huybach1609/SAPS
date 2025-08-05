package vn.edu.fpt.sapsmobile.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class DateTimeHelper {

    // Kết quả: 14h30 ngày 03/07/2025
    private static final DateTimeFormatter OUTPUT_FORMAT =
            DateTimeFormatter.ofPattern("HH'h'mm 'ngày' dd/MM/yyyy", new Locale("vi"));

    // Một số pattern input hay gặp (ISO chính, hoặc không có giây)
    private static final List<DateTimeFormatter> INPUT_FORMATTERS = new ArrayList<>();
    static {
        INPUT_FORMATTERS.add(DateTimeFormatter.ISO_LOCAL_DATE_TIME);            // 2025-07-03T14:30:00
        INPUT_FORMATTERS.add(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm")); // 2025-07-03T14:30
        INPUT_FORMATTERS.add(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")); // 2025-07-03 14:30:00
        INPUT_FORMATTERS.add(DateTimeFormatter.ofPattern("yyyy-MM-dd"));         // 2025-07-03 (-> 00:00)
    }

    /**
     * Format ISO (hoặc các pattern khác trong list) thành "14h30 ngày 03/07/2025".
     * Nếu parse fail trả về input gốc (hoặc "" nếu input null/empty).
     */
    public static String formatDateTime(String input) {
        if (input == null || input.trim().isEmpty()) return "";

        LocalDateTime dt = tryParseToLocalDateTime(input);
        if (dt == null) return input; // hoặc return "" / "—" tùy ý

        return dt.format(OUTPUT_FORMAT);
    }

    /**
     * Trả về duration giữa entry và exit theo format "Xh Ym".
     * Nếu exit = null => dùng thời điểm hiện tại.
     * Nếu parse fail => trả về "".
     */
    public static String calculateDuration(String entry, String exit) {
        if (entry == null || entry.trim().isEmpty()) return "";

        LocalDateTime entryTime = tryParseToLocalDateTime(entry);
        LocalDateTime exitTime;
        if (exit == null || exit.trim().isEmpty()) {
            exitTime = LocalDateTime.now();
        } else {
            exitTime = tryParseToLocalDateTime(exit);
        }

        if (entryTime == null || exitTime == null) return "";

        Duration d = Duration.between(entryTime, exitTime).abs(); // đảm bảo không âm
        long hours = d.toHours();
        long minutes = d.toMinutes() % 60;
        return hours + "h " + minutes + "m";
    }

    /**
     * Chỉ format phần ngày: "Jul 3, 2025" (hoặc bạn đổi pattern)
     */
    public static String formatDate(String dateTime) {
        if (dateTime == null || dateTime.trim().isEmpty()) return "";
        LocalDateTime dt = tryParseToLocalDateTime(dateTime);
        if (dt == null) return dateTime;
        DateTimeFormatter out = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);
        return dt.format(out);
    }

    // --- Helper private ---
    private static LocalDateTime tryParseToLocalDateTime(String input) {
        String trimmed = input.trim();
        // nếu input có timezone (z hay offset) — LocalDateTime.parse sẽ fail, có thể strip offset/globally handle
        // hiện tại giả định input là local datetime (no offset). Nếu cần xử lý offset -> dùng OffsetDateTime.
        for (DateTimeFormatter f : INPUT_FORMATTERS) {
            try {
                // Nếu pattern là "yyyy-MM-dd" -> parse to LocalDateTime by adding 00:00
                if (f == DateTimeFormatter.ofPattern("yyyy-MM-dd")) {
                    java.time.LocalDate date = java.time.LocalDate.parse(trimmed, f);
                    return date.atStartOfDay();
                }
                return LocalDateTime.parse(trimmed, f);
            } catch (DateTimeParseException ignored) { }
        }

        // Thử fallback: nếu chuỗi chứa 'T' và có offset (example: 2025-07-03T14:30:00+07:00)
        try {
            java.time.OffsetDateTime odt = java.time.OffsetDateTime.parse(trimmed);
            return odt.toLocalDateTime();
        } catch (DateTimeParseException ignored) { }

        // Không parse được
        return null;
    }
}
