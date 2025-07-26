package vn.edu.fpt.sapsmobile.models;

import java.util.List;

public class NotificationsResponse {

    private List<Notification> notifications;

    public NotificationsResponse(List<Notification> notifications) {
        this.notifications = notifications;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }

    // Tạo constructor mặc định nếu cần thiết cho Retrofit
    public NotificationsResponse() {
    }
}
