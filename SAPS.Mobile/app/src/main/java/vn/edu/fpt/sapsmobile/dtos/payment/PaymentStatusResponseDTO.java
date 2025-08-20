package vn.edu.fpt.sapsmobile.dtos.payment;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class PaymentStatusResponseDTO {
    @SerializedName("code")
    private String code;

    @SerializedName("desc")
    private String desc;

    @SerializedName("data")
    private PaymentStatusDataDTO data;

    @SerializedName("signature")
    private String signature;


    // Constructors
    public PaymentStatusResponseDTO() {
    }

    public PaymentStatusResponseDTO(String code, String desc, PaymentStatusDataDTO data, String signature) {
        this.code = code;
        this.desc = desc;
        this.data = data;
        this.signature = signature;
    }

    // Getters and Setters
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public PaymentStatusDataDTO getData() {
        return data;
    }

    public void setData(PaymentStatusDataDTO data) {
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
        return "PaymentStatusResponseDTO{" +
                "code='" + code + '\'' +
                ", desc='" + desc + '\'' +
                ", data=" + data +
                ", signature='" + signature + '\'' +
                '}';
    }
}