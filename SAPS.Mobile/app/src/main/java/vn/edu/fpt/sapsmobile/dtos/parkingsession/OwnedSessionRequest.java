package vn.edu.fpt.sapsmobile.dtos.parkingsession;

public class OwnedSessionRequest {
    private String order;
    private String sortBy;
    private String status;

    public OwnedSessionRequest(String order, String sortBy, String status) {
        this.order = order;
        this.sortBy = sortBy;
        this.status = status;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}


