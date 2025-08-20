package vn.edu.fpt.sapsmobile.enums;

public enum PaymentStatus {
    PENDING,
    CANCELLED,
    UNDERPAID,
    PAID,
    EXPIRED,
    PROCESSING,
    FAILED,
    UNKNOWN; // fallback for unexpected values

    public static PaymentStatus fromString(String value) {
        if (value == null) return UNKNOWN;
        try {
            return PaymentStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return UNKNOWN;
        }
    }
}
