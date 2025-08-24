package vn.edu.fpt.sapsmobile.dtos.profile;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;
import java.util.Date;

public class ClientProfileSummaryDto implements Serializable {
    
    @SerializedName("id")
    private String id;
    
    @SerializedName("email")
    private String email;
    
    @SerializedName("fullName")
    private String fullName;
    
    @SerializedName("phoneNumber")
    private String phoneNumber;
    
    @SerializedName("createdAt")
    private Date createdAt;
    
    @SerializedName("status")
    private String status;
    
    @SerializedName("citizenId")
    private String citizenId;
    
    @SerializedName("dateOfBirth")
    private String dateOfBirth;
    
    @SerializedName("sex")
    private Boolean sex;
    
    @SerializedName("nationality")
    private String nationality;
    
    @SerializedName("placeOfOrigin")
    private String placeOfOrigin;
    
    @SerializedName("placeOfResidence")
    private String placeOfResidence;

    // Default constructor
    public ClientProfileSummaryDto() {}

    // Constructor with all fields
    public ClientProfileSummaryDto(String id, String email, String fullName, String phoneNumber,
                                 Date createdAt, String status, String citizenId, String dateOfBirth,
                                 Boolean sex, String nationality, String placeOfOrigin, String placeOfResidence) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.createdAt = createdAt;
        this.status = status;
        this.citizenId = citizenId;
        this.dateOfBirth = dateOfBirth;
        this.sex = sex;
        this.nationality = nationality;
        this.placeOfOrigin = placeOfOrigin;
        this.placeOfResidence = placeOfResidence;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCitizenId() { return citizenId; }
    public void setCitizenId(String citizenId) { this.citizenId = citizenId; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public Boolean getSex() { return sex; }
    public void setSex(Boolean sex) { this.sex = sex; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getPlaceOfOrigin() { return placeOfOrigin; }
    public void setPlaceOfOrigin(String placeOfOrigin) { this.placeOfOrigin = placeOfOrigin; }

    public String getPlaceOfResidence() { return placeOfResidence; }
    public void setPlaceOfResidence(String placeOfResidence) { this.placeOfResidence = placeOfResidence; }

    @Override
    public String toString() {
        return "ClientProfileSummaryDto{" +
                "id='" + id + '\'' +
                ", email='" + email + '\'' +
                ", fullName='" + fullName + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", createdAt=" + createdAt +
                ", status='" + status + '\'' +
                ", citizenId='" + citizenId + '\'' +
                ", dateOfBirth='" + dateOfBirth + '\'' +
                ", sex=" + sex +
                ", nationality='" + nationality + '\'' +
                ", placeOfOrigin='" + placeOfOrigin + '\'' +
                ", placeOfResidence='" + placeOfResidence + '\'' +
                '}';
    }
}
