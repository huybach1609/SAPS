package vn.edu.fpt.sapsmobile.dtos.parkingsession;

import java.time.LocalDate;

public class OwnedSessionRequest {
    private String order;
    private String sortBy;
    private String searchCriteria;
    private String status;
    private LocalDate startEntryDate;
    private LocalDate endEntryDate;
    private LocalDate startExitDate;
    private LocalDate endExitDate;
    public OwnedSessionRequest(String order, String sortBy, String status) {
        this.order = order;
        this.sortBy = sortBy;
        this.status = status;
    }

    public String getSearchCriteria() {
        return searchCriteria;
    }

    public void setSearchCriteria(String searchCriteria) {
        this.searchCriteria = searchCriteria;
    }

    public LocalDate getStartEntryDate() {
        return startEntryDate;
    }

    public void setStartEntryDate(LocalDate startEntryDate) {
        this.startEntryDate = startEntryDate;
    }

    public LocalDate getEndEntryDate() {
        return endEntryDate;
    }

    public void setEndEntryDate(LocalDate endEntryDate) {
        this.endEntryDate = endEntryDate;
    }

    public LocalDate getStartExitDate() {
        return startExitDate;
    }

    public void setStartExitDate(LocalDate startExitDate) {
        this.startExitDate = startExitDate;
    }

    public LocalDate getEndExitDate() {
        return endExitDate;
    }

    public void setEndExitDate(LocalDate endExitDate) {
        this.endExitDate = endExitDate;
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


