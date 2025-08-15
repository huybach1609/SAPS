package vn.edu.fpt.sapsmobile.actionhandler;

import android.content.Context;
import android.content.Intent;

import vn.edu.fpt.sapsmobile.activities.sharevehicle.SharedInvitationDetailActivity;
import vn.edu.fpt.sapsmobile.listener.SharedInvitesListener;
import vn.edu.fpt.sapsmobile.models.SharedInvitation;

public class SharedInvitesHandler implements SharedInvitesListener {
    private Context context;

    public SharedInvitesHandler(Context context) {
        this.context = context;
    }
    @Override
    public void onItemClick(SharedInvitation invitation) {
        Intent intent = new Intent(context, SharedInvitationDetailActivity.class);
        intent.putExtra("invitation_data", invitation); // gửi cả object
        context.startActivity(intent);
    }
}
