package vn.edu.fpt.sapsmobile.dtos.profile;

import com.google.gson.annotations.SerializedName;

public class ClientProfileRequest {
    @SerializedName("Header")
    private String header;
    
    @SerializedName("Description")
    private String description;
    
    @SerializedName("DataType")
    private String dataType;
    
    @SerializedName("Data")
    private String data;
    
    @SerializedName("Attachments")
    private String[] attachments;

    public ClientProfileRequest(String header, String description, String dataType, String data, String[] attachments) {
        this.header = header;
        this.description = description;
        this.dataType = dataType;
        this.data = data;
        this.attachments = attachments;
    }

    // Getters and setters
    public String getHeader() {
        return header;
    }

    public void setHeader(String header) {
        this.header = header;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String[] getAttachments() {
        return attachments;
    }

    public void setAttachments(String[] attachments) {
        this.attachments = attachments;
    }
}
