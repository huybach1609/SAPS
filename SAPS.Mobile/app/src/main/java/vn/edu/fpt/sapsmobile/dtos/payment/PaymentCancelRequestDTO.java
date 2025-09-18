package vn.edu.fpt.sapsmobile.dtos.payment;

import com.google.gson.annotations.SerializedName;

public class PaymentCancelRequestDTO {
	@SerializedName("cancellationReason")
	private String cancellationReason;

	public PaymentCancelRequestDTO() {
	}

	public PaymentCancelRequestDTO(String cancellationReason) {
		this.cancellationReason = cancellationReason;
	}

	public String getCancellationReason() {
		return cancellationReason;
	}

	public void setCancellationReason(String cancellationReason) {
		this.cancellationReason = cancellationReason;
	}
}


