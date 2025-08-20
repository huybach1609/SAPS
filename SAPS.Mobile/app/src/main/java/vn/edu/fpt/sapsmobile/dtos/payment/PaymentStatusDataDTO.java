package vn.edu.fpt.sapsmobile.dtos.payment;

import com.google.gson.annotations.SerializedName;

public class PaymentStatusDataDTO {
    @SerializedName("id")
    private String id;
    
    @SerializedName("orderCode")
    private Integer orderCode;
    
    @SerializedName("amount")
    private Long amount;
    
    @SerializedName("amountPaid")
    private Long amountPaid;
    
    @SerializedName("amountRemaining")
    private Long amountRemaining;
    
    @SerializedName("status")
    private String status;
    
    @SerializedName("createdAt")
    private String createdAt;
    

    
    @SerializedName("cancellationReason")
    private String cancellationReason;
    
    @SerializedName("canceledAt")
    private String canceledAt;

    // Constructors
    public PaymentStatusDataDTO() {}

    public PaymentStatusDataDTO(String id, Integer orderCode, Long amount, Long amountPaid,
                                Long amountRemaining, String status, String createdAt,
                                String cancellationReason, String canceledAt) {
        this.id = id;
        this.orderCode = orderCode;
        this.amount = amount;
        this.amountPaid = amountPaid;
        this.amountRemaining = amountRemaining;
        this.status = status;
        this.createdAt = createdAt;
        this.cancellationReason = cancellationReason;
        this.canceledAt = canceledAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(Integer orderCode) {
        this.orderCode = orderCode;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public Long getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(Long amountPaid) {
        this.amountPaid = amountPaid;
    }

    public Long getAmountRemaining() {
        return amountRemaining;
    }

    public void setAmountRemaining(Long amountRemaining) {
        this.amountRemaining = amountRemaining;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }



    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public String getCanceledAt() {
        return canceledAt;
    }

    public void setCanceledAt(String canceledAt) {
        this.canceledAt = canceledAt;
    }

    // Utility methods
    public boolean isPaid() {
        return status != null && (status.equalsIgnoreCase("PAID") || status.equalsIgnoreCase("SUCCESS"));
    }

    public boolean isExpired() {
        return status != null && status.equalsIgnoreCase("EXPIRED");
    }

    public boolean isCanceled() {
        return status != null && status.equalsIgnoreCase("CANCELED");
    }

    @Override
    public String toString() {
        return "PaymentStatusDataDTO{" +
                "id='" + id + '\'' +
                ", orderCode=" + orderCode +
                ", amount=" + amount +
                ", amountPaid=" + amountPaid +
                ", amountRemaining=" + amountRemaining +
                ", status='" + status + '\'' +
                ", createdAt='" + createdAt + '\'' +
                ", cancellationReason='" + cancellationReason + '\'' +
                ", canceledAt='" + canceledAt + '\'' +
                '}';
    }
}