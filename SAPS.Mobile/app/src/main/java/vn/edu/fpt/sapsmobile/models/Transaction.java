package vn.edu.fpt.sapsmobile.models;

import java.io.Serializable;

public class Transaction implements Serializable {
    private String transactionId;
    private double amountPaid;
    private String paymentMethod;
    private String dateTime;
    private String vehicle;

    public Transaction() {
    }

    public Transaction(String transactionId, double amountPaid, String paymentMethod, String dateTime, String vehicle) {
        this.transactionId = transactionId;
        this.amountPaid = amountPaid;
        this.paymentMethod = paymentMethod;
        this.dateTime = dateTime;
        this.vehicle = vehicle;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public double getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(double amountPaid) {
        this.amountPaid = amountPaid;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getDateTime() {
        return dateTime;
    }

    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
    }

    public String getVehicle() {
        return vehicle;
    }

    public void setVehicle(String vehicle) {
        this.vehicle = vehicle;
    }

    @Override
    public String toString() {
        return "Transaction{" +
                "transactionId='" + transactionId + '\'' +
                ", amountPaid=" + amountPaid +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", dateTime='" + dateTime + '\'' +
                ", vehicle='" + vehicle + '\'' +
                '}';
    }
}
