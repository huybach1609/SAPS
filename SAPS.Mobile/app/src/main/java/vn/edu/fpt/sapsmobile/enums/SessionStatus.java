package vn.edu.fpt.sapsmobile.enums;

public enum SessionStatus {
    // Server values: ("Parking" OR "CheckedOut" OR "Finished")
    PARKING("Parking", "On Going"),
    CHECKED_OUT("CheckedOut", "Checked Out"),
    FINISHED("Finished", "Finished");

    private final String apiValue;
    private final String displayText;

    SessionStatus(String apiValue, String displayText) {
        this.apiValue = apiValue;
        this.displayText = displayText;
    }

    public String getApiValue() {
        return apiValue;
    }

    public String getDisplayText() {
        return displayText;
    }

    public static SessionStatus fromApiValue(String value) {
        if (value == null) {
            throw new IllegalArgumentException("SessionStatus value cannot be null");
        }
        for (SessionStatus status : values()) {
            if (status.apiValue.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown SessionStatus value: " + value);
    }

    public static String toDisplayText(String apiValue) {
        return fromApiValue(apiValue).getDisplayText();
    }
}
