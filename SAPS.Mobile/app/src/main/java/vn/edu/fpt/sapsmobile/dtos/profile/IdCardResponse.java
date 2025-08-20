package vn.edu.fpt.sapsmobile.dtos.profile;

import com.google.gson.annotations.SerializedName;

public class IdCardResponse {
    @SerializedName("name")
    private String name;

    @SerializedName("date_of_birth")
    private String dateOfBirth;

    @SerializedName("phone")
    private String phone;

    @SerializedName("place_of_origin")
    private String placeOfOrigin;

    @SerializedName("place_of_residence")
    private String placeOfResidence;

    @SerializedName("id_number")
    private String idNumber;

    @SerializedName("sex")
    private String sex;

    @SerializedName("nationality")
    private String nationality;

    @SerializedName("issue_date")
    private String issueDate;

    @SerializedName("issue_place")
    private String issuePlace;

    // Getters
    public String getName() { return name; }
    public String getDateOfBirth() { return dateOfBirth; }
    public String getPhone() { return phone; }
    public String getPlaceOfOrigin() { return placeOfOrigin; }
    public String getPlaceOfResidence() { return placeOfResidence; }
    public String getIdNumber() { return idNumber; }
    public String getSex() { return sex; }
    public String getNationality() { return nationality; }
    public String getIssueDate() { return issueDate; }
    public String getIssuePlace() { return issuePlace; }

    // Setters
    public void setName(String name) { this.name = name; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setPlaceOfOrigin(String placeOfOrigin) { this.placeOfOrigin = placeOfOrigin; }
    public void setPlaceOfResidence(String placeOfResidence) { this.placeOfResidence = placeOfResidence; }
    public void setIdNumber(String idNumber) { this.idNumber = idNumber; }
    public void setSex(String sex) { this.sex = sex; }
    public void setNationality(String nationality) { this.nationality = nationality; }
    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }
    public void setIssuePlace(String issuePlace) { this.issuePlace = issuePlace; }
}