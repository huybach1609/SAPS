package vn.edu.fpt.sapsmobile.dtos.profile;

import com.google.gson.annotations.SerializedName;

public class UpdateClientProfileRequest {

    // For multipart file upload
    // In Retrofit, you’ll use MultipartBody.Part for these in the service interface
    private transient okhttp3.MultipartBody.Part frontIdCardImage;
    private transient okhttp3.MultipartBody.Part backIdCardImage;

    @SerializedName("CitizenId")
    private String citizenId;

    @SerializedName("DateOfBirth")
    private String dateOfBirth;

    @SerializedName("Sex")
    private boolean sex;

    @SerializedName("Nationality")
    private String nationality;

    @SerializedName("PlaceOfOrigin")
    private String placeOfOrigin;

    @SerializedName("PlaceOfResidence")
    private String placeOfResidence;

    @SerializedName("FullName")
    private String fullName;

    @SerializedName("Phone")
    private String phone;

    @SerializedName("Id")
    private String id;

    // --- Getters & Setters ---
    public okhttp3.MultipartBody.Part getFrontIdCardImage() {
        return frontIdCardImage;
    }

    public void setFrontIdCardImage(okhttp3.MultipartBody.Part frontIdCardImage) {
        this.frontIdCardImage = frontIdCardImage;
    }

    public okhttp3.MultipartBody.Part getBackIdCardImage() {
        return backIdCardImage;
    }

    public void setBackIdCardImage(okhttp3.MultipartBody.Part backIdCardImage) {
        this.backIdCardImage = backIdCardImage;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
