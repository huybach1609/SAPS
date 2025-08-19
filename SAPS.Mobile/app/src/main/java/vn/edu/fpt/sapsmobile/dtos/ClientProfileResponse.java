package vn.edu.fpt.sapsmobile.dtos;

import com.google.gson.annotations.SerializedName;

public class ClientProfileResponse {

    @SerializedName("id")
    private String id;

    @SerializedName("citizenId")
    private String citizenId;

    @SerializedName("dateOfBirth")
    private String dateOfBirth;

    @SerializedName("sex")
    private boolean sex;

    @SerializedName("nationality")
    private String nationality;

    @SerializedName("placeOfOrigin")
    private String placeOfOrigin;

    @SerializedName("placeOfResidence")
    private String placeOfResidence;

    @SerializedName("googleId")
    private String googleId;

    // --- Getters & Setters ---
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }
}
