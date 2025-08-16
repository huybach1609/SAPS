package vn.edu.fpt.sapsmobile.adapter;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.listener.SharedInvitesListener;
import vn.edu.fpt.sapsmobile.models.SharedInvitation;

public class SharedInvitationAdapter extends RecyclerView.Adapter<SharedInvitationAdapter.ViewHolder> {

    private List<SharedInvitation> invitationList;
    // Interface cho sự kiện click
    private SharedInvitesListener listener;

    public SharedInvitationAdapter(List<SharedInvitation> invitationList, SharedInvitesListener listener) {
        this.invitationList = invitationList;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_shared_invite, parent, false); // file xml bạn gửi
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        SharedInvitation invitation = invitationList.get(position);
        holder.tvInviterName.setText(invitation.getOwnerName());
        holder.tvInvitationDate.setText("Invitation Date: " + invitation.getInvitationDate());
        holder.tvMemberSince.setText("Member since: " + invitation.getMemberSince());
        // Gán sự kiện click
        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onItemClick(invitation);
            }
        });
    }

    @Override
    public int getItemCount() {
        return invitationList != null ? invitationList.size() : 0;
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvInviterName, tvInvitationDate, tvMemberSince;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvInviterName = itemView.findViewById(R.id.tvInviterName);
            tvInvitationDate = itemView.findViewById(R.id.tvInvitationDate);
            tvMemberSince = itemView.findViewById(R.id.tvMemberSince);
        }
    }

    // Optional: cập nhật lại danh sách
    public void updateData(List<SharedInvitation> newList) {
        this.invitationList = newList;
        notifyDataSetChanged();
    }
}