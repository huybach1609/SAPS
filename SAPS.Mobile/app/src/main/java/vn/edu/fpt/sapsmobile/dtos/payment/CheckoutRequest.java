package vn.edu.fpt.sapsmobile.dtos.payment;

public class CheckoutRequest {
    private String sessionId;
    private String paymentMethod;

    public CheckoutRequest(String sessionId, String paymentMethod) {
        this.sessionId = sessionId;
        this.paymentMethod = paymentMethod;
    }

    public CheckoutRequest() {}

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}


