package vn.edu.fpt.sapsmobile.dtos.profile;

import com.google.gson.annotations.SerializedName;

public class IdCardResponse {
    @SerializedName("citizenId")
    private String citizenId;

    @SerializedName("fullName")
    private String fullName;

    @SerializedName("dateOfBirth")
    private String dateOfBirth;

    @SerializedName("sex")
    private String sex;

    @SerializedName("nationality")
    private String nationality;

    @SerializedName("placeOfOrigin")
    private String placeOfOrigin;

    @SerializedName("placeOfResidence")
    private String placeOfResidence;

    @SerializedName("expiryDate")
    private String expiryDate;

    // Getters
    public String getCitizenId() { return citizenId; }
    public String getFullName() { return fullName; }
    public String getDateOfBirth() { return dateOfBirth; }
    public String getSex() { return sex; }
    public String getNationality() { return nationality; }
    public String getPlaceOfOrigin() { return placeOfOrigin; }
    public String getPlaceOfResidence() { return placeOfResidence; }
    public String getExpiryDate() { return expiryDate; }

    // Setters
    public void setCitizenId(String citizenId) { this.citizenId = citizenId; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public void setSex(String sex) { this.sex = sex; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public void setPlaceOfOrigin(String placeOfOrigin) { this.placeOfOrigin = placeOfOrigin; }
    public void setPlaceOfResidence(String placeOfResidence) { this.placeOfResidence = placeOfResidence; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }
}