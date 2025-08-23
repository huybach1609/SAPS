package vn.edu.fpt.sapsmobile.enums;

// ShareVehicleStatus enum
public enum ShareVehicleStatus {
    PENDING("Pending"),
    SHARED("Shared"), 
    UNAVAILABLE("Unavailable"),
    AVAILABLE("Available");

    private final String value;
    
    ShareVehicleStatus(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    // Helper method to get enum from string value
    public static ShareVehicleStatus fromString(String value) {
        for (ShareVehicleStatus status : ShareVehicleStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        return null;
    }
}