package vn.edu.fpt.sapsmobile.models;

public class Notification {
    private int id;
    private String header;
    private String summary;
    private String content;
    private String sendDate;
    private int senderId;
    private boolean isRead;  // Thêm trường này để theo dõi trạng thái đã đọc

    // Constructor, getters and setters

    public Notification(int id, String header, String summary, String content, String sendDate, int senderId) {
        this.id = id;
        this.header = header;
        this.summary = summary;
        this.content = content;
        this.sendDate = sendDate;
        this.senderId = senderId;
        this.isRead = false; // Mặc định là chưa đọc
    }

    // Getter và Setter cho isRead
    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;  // Cập nhật trạng thái đã đọc
    }

    // Các getter và setter còn lại cho các trường khác
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getHeader() {
        return header;
    }

    public void setHeader(String header) {
        this.header = header;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSendDate() {
        return sendDate;
    }

    public void setSendDate(String sendDate) {
        this.sendDate = sendDate;
    }

    public int getSenderId() {
        return senderId;
    }

    public void setSenderId(int senderId) {
        this.senderId = senderId;
    }
}
