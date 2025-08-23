package vn.edu.fpt.sapsmobile.dtos.payment;

import com.google.gson.annotations.SerializedName;

public class PaymentResponseDTO {
    @SerializedName("code")
    private String code;

    @SerializedName("desc")
    private String description;

    @SerializedName("data")
    private PaymentDataDTO data;

    @SerializedName("signature")
    private String signature;

    // Getters and Setters
    public String getCode() {
        return code;
    }
    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public PaymentDataDTO getData() {
        return data;
    }
    public void setData(PaymentDataDTO data) {
        this.data = data;
    }

    public String getSignature() {
        return signature;
    }
    public void setSignature(String signature) {
        this.signature = signature;
    }

    @Override
    public String toString() {
        return "PaymentResponseDTO{" +
                "code='" + code + '\'' +
                ", description='" + description + '\'' +
                ", data=" + data +
                ", signature='" + signature + '\'' +
                '}';
    }
}
