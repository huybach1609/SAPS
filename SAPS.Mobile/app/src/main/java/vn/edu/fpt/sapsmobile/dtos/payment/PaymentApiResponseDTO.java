package vn.edu.fpt.sapsmobile.dtos.payment;

import com.google.gson.annotations.SerializedName;

// This matches the actual API response structure
public class PaymentApiResponseDTO {
    @SerializedName("data")
    private PaymentResponseDTO data;

    public PaymentResponseDTO getData() {
        return data;
    }

    public void setData(PaymentResponseDTO data) {
        this.data = data;
    }

    @Override
    public String toString() {
        return "PaymentApiResponseDTO{" +
                "data=" + data +
                '}';
    }
}