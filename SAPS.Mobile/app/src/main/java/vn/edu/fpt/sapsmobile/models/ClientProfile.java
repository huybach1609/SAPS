package vn.edu.fpt.sapsmobile.models;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

// ClientProfileDto class
public class ClientProfile implements Serializable {

    @SerializedName("userId")
    private String userId;

    @SerializedName("citizenId")
    private String citizenId;

    @SerializedName("dateOfBirth")
    private String dateOfBirth; // Using String to handle DateOnly from C#

    @SerializedName("sex")
    private boolean sex = true; // true for male, false for female (matching C# default)

    @SerializedName("nationality")
    private String nationality;

    @SerializedName("placeOfOrigin")
    private String placeOfOrigin;

    @SerializedName("placeOfResidence")
    private String placeOfResidence;

    @SerializedName("shareCode")
    private String shareCode;

    @SerializedName("user")
    private User user;

    @SerializedName("googleId")
    private String googleId;

    @SerializedName("idCardFrontUrl")
    private String idCardFrontUrl;
    @SerializedName("idCardBackUrl")
    private String idCardBackUrl;

    // Constructors
    public ClientProfile() {}

    public ClientProfile(String userId, String citizenId) {
        this.userId = userId;
        this.citizenId = citizenId;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public boolean isSex() {
        return sex;
    }

    public void setSex(boolean sex) {
        this.sex = sex;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getPlaceOfOrigin() {
        return placeOfOrigin;
    }

    public void setPlaceOfOrigin(String placeOfOrigin) {
        this.placeOfOrigin = placeOfOrigin;
    }

    public String getPlaceOfResidence() {
        return placeOfResidence;
    }

    public void setPlaceOfResidence(String placeOfResidence) {
        this.placeOfResidence = placeOfResidence;
    }

    public String getShareCode() {
        return shareCode;
    }

    public void setShareCode(String shareCode) {
        this.shareCode = shareCode;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    // Helper methods
    public boolean hasGoogleId() {
        return googleId != null && !googleId.trim().isEmpty();
    }

    public String getIdCardFrontUrl() {
        return idCardFrontUrl;
    }

    public void setIdCardFrontUrl(String idCardFrontUrl) {
        this.idCardFrontUrl = idCardFrontUrl;
    }

    public String getIdCardBackUrl() {
        return idCardBackUrl;
    }

    public void setIdCardBackUrl(String idCardBackUrl) {
        this.idCardBackUrl = idCardBackUrl;
    }

    public String getSexDisplay() {
        return sex ? "Male" : "Female";
    }

    @Override
    public String toString() {
        return "ClientProfileDto{" +
                "userId='" + userId + '\'' +
                ", citizenId='" + citizenId + '\'' +
                ", dateOfBirth='" + dateOfBirth + '\'' +
                ", sex=" + sex +
                ", nationality='" + nationality + '\'' +
                ", placeOfOrigin='" + placeOfOrigin + '\'' +
                ", placeOfResidence='" + placeOfResidence + '\'' +
                ", shareCode='" + shareCode + '\'' +
                ", googleId='" + googleId + '\'' +
                ", hasUser=" + (user != null) +
                '}';
    }
}