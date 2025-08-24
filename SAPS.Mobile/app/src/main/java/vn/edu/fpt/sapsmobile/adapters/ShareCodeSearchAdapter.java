package vn.edu.fpt.sapsmobile.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.card.MaterialCardView;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.dtos.profile.ClientProfileSummaryDto;
import vn.edu.fpt.sapsmobile.utils.DateTimeHelper;

import java.util.ArrayList;
import java.util.List;

public class ShareCodeSearchAdapter extends RecyclerView.Adapter<ShareCodeSearchAdapter.ViewHolder> {

    private List<ClientProfileSummaryDto> searchResults = new ArrayList<>();
    private OnUserSelectedListener listener;

    public interface OnUserSelectedListener {
        void onUserSelected(ClientProfileSummaryDto user);
    }

    public void setOnUserSelectedListener(OnUserSelectedListener listener) {
        this.listener = listener;
    }

    public void setSearchResults(List<ClientProfileSummaryDto> results) {
        this.searchResults.clear();
        if (results != null) {
            this.searchResults.addAll(results);
        }
        notifyDataSetChanged();
    }

    public void clearResults() {
        this.searchResults.clear();
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_share_code_search_result, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ClientProfileSummaryDto user = searchResults.get(position);
        holder.bind(user);
    }

    @Override
    public int getItemCount() {
        return searchResults.size();
    }

    class ViewHolder extends RecyclerView.ViewHolder {
        private MaterialCardView cardView;
        private TextView tvUserName;
        private TextView tvUserEmail;
        private TextView tvUserPhone;
        private TextView tvUserStatus;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            cardView = itemView.findViewById(R.id.cardView);
            tvUserName = itemView.findViewById(R.id.tvUserName);
            tvUserEmail = itemView.findViewById(R.id.tvUserEmail);
            tvUserPhone = itemView.findViewById(R.id.tvUserPhone);
            tvUserStatus = itemView.findViewById(R.id.tvUserStatus);

            cardView.setOnClickListener(v -> {
                int position = getAdapterPosition();
                if (position != RecyclerView.NO_POSITION && listener != null) {
                    listener.onUserSelected(searchResults.get(position));
                }
            });
        }

        public void bind(ClientProfileSummaryDto user) {
            tvUserName.setText(user.getFullName() != null ? user.getFullName() : "Unknown");
            tvUserEmail.setText(user.getEmail() != null ? user.getEmail() : "No email");
            tvUserPhone.setText(user.getPhoneNumber() != null ? user.getPhoneNumber() : "No phone");
            
            // Set status with color
            if (user.getStatus() != null) {
                tvUserStatus.setText(user.getStatus());
                // You can add status-based color logic here
                tvUserStatus.setTextColor(itemView.getContext().getColor(R.color.md_theme_primary));
            } else {
                tvUserStatus.setText("Unknown");
                tvUserStatus.setTextColor(itemView.getContext().getColor(R.color.md_theme_secondary));
            }
        }
    }
}
