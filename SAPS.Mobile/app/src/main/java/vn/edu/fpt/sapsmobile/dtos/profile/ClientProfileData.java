package vn.edu.fpt.sapsmobile.dtos.profile;

import com.google.gson.annotations.SerializedName;

public class ClientProfileData {
    @SerializedName("frontPart")
    private String frontPart;
    
    @SerializedName("backPart")
    private String backPart;
    
    @SerializedName("citizenId")
    private String citizenId;
    
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
    
    @SerializedName("id")
    private String id;

    public ClientProfileData(String frontPart, String backPart, String citizenId, String dateOfBirth, 
                           String sex, String nationality, String placeOfOrigin, String placeOfResidence, String id) {
        this.frontPart = frontPart;
        this.backPart = backPart;
        this.citizenId = citizenId;
        this.dateOfBirth = dateOfBirth;
        this.sex = sex;
        this.nationality = nationality;
        this.placeOfOrigin = placeOfOrigin;
        this.placeOfResidence = placeOfResidence;
        this.id = id;
    }

    // Getters and setters
    public String getFrontPart() {
        return frontPart;
    }

    public void setFrontPart(String frontPart) {
        this.frontPart = frontPart;
    }

    public String getBackPart() {
        return backPart;
    }

    public void setBackPart(String backPart) {
        this.backPart = backPart;
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

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
