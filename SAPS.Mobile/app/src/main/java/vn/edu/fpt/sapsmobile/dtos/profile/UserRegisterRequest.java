package vn.edu.fpt.sapsmobile.dtos.profile;

import com.google.gson.annotations.SerializedName;

public class UserRegisterRequest {
    @SerializedName("Email")
    private String email;
    
    @SerializedName("Password")
    private String password;
    
    @SerializedName("FullName")
    private String fullName;
    
    @SerializedName("Phone")
    private String phone;
    
    @SerializedName("ProfileImage")
    private String profileImage;

    // Default constructor required by Gson
    public UserRegisterRequest() {
    }

    public UserRegisterRequest(String email, String password, String fullName, String phone) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phone = phone;
    }

    public UserRegisterRequest(String email, String password, String fullName, String phone, String profileImage) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phone = phone;
        this.profileImage = profileImage;
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

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    @Override
    public String toString() {
        return "UserRegisterRequest{" +
                "email='" + email + '\'' +
                ", password='" + (password != null ? "***" : "null") + '\'' +
                ", fullName='" + fullName + '\'' +
                ", phone='" + phone + '\'' +
                ", profileImage='" + profileImage + '\'' +
                '}';
    }
}
