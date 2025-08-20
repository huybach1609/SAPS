package vn.edu.fpt.sapsmobile.dtos.payment;

import com.google.gson.annotations.SerializedName;

public class PaymentDataDTO {
    @SerializedName("bin")
    private String bin;

    @SerializedName("accountNumber")
    private String accountNumber;

    @SerializedName("accountName")
    private String accountName;

    @SerializedName("amount")
    private int amount;

    @SerializedName("description")
    private String description;

    @SerializedName("orderCode")
    private int orderCode;

    @SerializedName("currency")
    private String currency;

    @SerializedName("paymentLinkId")
    private String paymentLinkId;

    @SerializedName("status")
    private String status;

    @SerializedName("checkoutUrl")
    private String checkoutUrl;

    @SerializedName("expiredAt")
    private long expiredAt;

    @SerializedName("qrCode")
    private String qrCode;

    // Getters and Setters
    public String getBin() {
        return bin;
    }
    public void setBin(String bin) {
        this.bin = bin;
    }

    public String getAccountNumber() {
        return accountNumber;
    }
    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }
    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public int getAmount() {
        return amount;
    }
    public void setAmount(int amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public int getOrderCode() {
        return orderCode;
    }
    public void setOrderCode(int orderCode) {
        this.orderCode = orderCode;
    }

    public String getCurrency() {
        return currency;
    }
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getPaymentLinkId() {
        return paymentLinkId;
    }
    public void setPaymentLinkId(String paymentLinkId) {
        this.paymentLinkId = paymentLinkId;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }
    public void setCheckoutUrl(String checkoutUrl) {
        this.checkoutUrl = checkoutUrl;
    }

    public long getExpiredAt() {
        return expiredAt;
    }
    public void setExpiredAt(long expiredAt) {
        this.expiredAt = expiredAt;
    }

    public String getQrCode() {
        return qrCode;
    }
    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    @Override
    public String toString() {
        return "PaymentDataDTO{" +
                "bin='" + bin + '\'' +
                ", accountNumber='" + accountNumber + '\'' +
                ", accountName='" + accountName + '\'' +
                ", amount=" + amount +
                ", description='" + description + '\'' +
                ", orderCode=" + orderCode +
                ", currency='" + currency + '\'' +
                ", paymentLinkId='" + paymentLinkId + '\'' +
                ", status='" + status + '\'' +
                ", checkoutUrl='" + checkoutUrl + '\'' +
                ", expiredAt=" + expiredAt +
                ", qrCode='" + qrCode + '\'' +
                '}';
    }
}
