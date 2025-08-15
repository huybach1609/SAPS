package vn.edu.fpt.sapsmobile.models;

import java.io.Serializable;

public class SharedInvitation implements Serializable {

    // Vehicle Information
    private String licensePlate;
    private String model;
    private String color;
    private String status;

    // Vehicle Owner
    private String ownerName;
    private String ownerUserId;
    private String memberSince;

    // Access Details
    private String accessDuration;
    private String invitationDate;
    private String expires;

    // Note from Owner
    private String noteFromOwner;

    // Important Notes (as single String)
    private String importantNotes;

    public SharedInvitation(String licensePlate,
                            String model,
                            String color,
                            String status,
                            String ownerName,
                            String ownerUserId,
                            String memberSince,
                            String accessDuration,
                            String invitationDate,
                            String expires,
                            String noteFromOwner,
                            String importantNotes) {
        this.licensePlate = licensePlate;
        this.model = model;
        this.color = color;
        this.status = status;
        this.ownerName = ownerName;
        this.ownerUserId = ownerUserId;
        this.memberSince = memberSince;
        this.accessDuration = accessDuration;
        this.invitationDate = invitationDate;
        this.expires = expires;
        this.noteFromOwner = noteFromOwner;
        this.importantNotes = importantNotes;
    }
    public SharedInvitation(
                            String ownerName,

                            String memberSince,

                            String invitationDate
                            ) {

        this.ownerName = ownerName;
        this.memberSince = memberSince;

        this.invitationDate = invitationDate;

    }

    // Getters
    public String getLicensePlate() {
        return licensePlate;
    }

    public String getModel() {
        return model;
    }

    public String getColor() {
        return color;
    }

    public String getStatus() {
        return status;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getOwnerUserId() {
        return ownerUserId;
    }

    public String getMemberSince() {
        return memberSince;
    }

    public String getAccessDuration() {
        return accessDuration;
    }

    public String getInvitationDate() {
        return invitationDate;
    }

    public String getExpires() {
        return expires;
    }

    public String getNoteFromOwner() {
        return noteFromOwner;
    }

    public String getImportantNotes() {
        return importantNotes;
    }
}
