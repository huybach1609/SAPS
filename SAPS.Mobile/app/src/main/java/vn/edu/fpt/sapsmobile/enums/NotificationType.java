package vn.edu.fpt.sapsmobile.enums;

public enum NotificationType {
    PAYMENT(0),     // thông báo payment
    INFO(1),        // thông báo về thay đổi, thêm information
    VEHICLE(2);     // thông báo về action liên quan đến vehicle

    private final int value;

    NotificationType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    public static NotificationType fromValue(int value) {
        for (NotificationType type : NotificationType.values()) {
            if (type.value == value) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown NotificationType value: " + value);
    }

    public static NotificationType fromString(String name) {
        try {
            return NotificationType.valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown NotificationType name: " + name);
        }
    }
}