package vn.edu.fpt.sapsmobile.models;

public class RegisterData {
    private String idCardImagePath;
    private String fullName;
    private String phone;
    private String idNumber;
    private String dateOfBirth;
    private String email;
    private String password;
    private String vehicleRegistrationImagePath;
    private String sex;
    private String nationality;
    private String placeOfOrigin;
    private String placeOfResidence;
    private String issueDate;
    private String issuePlace;

    public void setIssueDate(String issueDate) { this.issueDate = issueDate; }
    public void setIssuePlace(String issuePlace) { this.issuePlace = issuePlace; }
    public String getIssueDate() { return issueDate; }
    public String getIssuePlace() { return issuePlace; }


    // Getter & Setter
    public String getIdCardImagePath() {
        return idCardImagePath;
    }

    public void setIdCardImagePath(String idCardImagePath) {
        this.idCardImagePath = idCardImagePath;
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

    public String getIdNumber() {
        return idNumber;
    }

    public void setIdNumber(String idNumber) {
        this.idNumber = idNumber;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getVehicleRegistrationImagePath() {
        return vehicleRegistrationImagePath;
    }

    public void setVehicleRegistrationImagePath(String vehicleRegistrationImagePath) {
        this.vehicleRegistrationImagePath = vehicleRegistrationImagePath;
    }
    // Getter & Setter cho sex
    public String getSex() {
        return sex;
    }
    public void setSex(String sex) {
        this.sex = sex;
    }

    // Getter & Setter cho nationality
    public String getNationality() {
        return nationality;
    }
    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    // Getter & Setter cho placeOfOrigin
    public String getPlaceOfOrigin() {
        return placeOfOrigin;
    }
    public void setPlaceOfOrigin(String placeOfOrigin) {
        this.placeOfOrigin = placeOfOrigin;
    }

    // Getter & Setter cho placeOfResidence
    public String getPlaceOfResidence() {
        return placeOfResidence;
    }
    public void setPlaceOfResidence(String placeOfResidence) {
        this.placeOfResidence = placeOfResidence;
    }
}
