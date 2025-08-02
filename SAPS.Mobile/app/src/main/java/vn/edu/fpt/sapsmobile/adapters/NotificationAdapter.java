
package vn.edu.fpt.sapsmobile.adapters;

import android.content.Context;
import android.content.SharedPreferences;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.enums.NotificationType;
import vn.edu.fpt.sapsmobile.models.Notification;

public class NotificationAdapter extends RecyclerView.Adapter<NotificationAdapter.NotificationViewHolder> {
    private List<Notification> notificationList;
    private SharedPreferences sharedPreferences;

    public NotificationAdapter(List<Notification> notificationList, Context context) {
        this.notificationList = notificationList;
        this.sharedPreferences = context.getSharedPreferences("NotificationsPrefs", Context.MODE_PRIVATE);
    }

    @NonNull
    @Override
    public NotificationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.notification_item, parent, false);
        return new NotificationViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull NotificationViewHolder holder, int position) {
        if (notificationList != null && position < notificationList.size()) {
            Notification notification = notificationList.get(position);

            holder.header.setText(notification.getHeader() != null ? notification.getHeader() : "No Header");
            holder.summary.setText(notification.getSummary() != null ? notification.getSummary() : "No Summary");
            holder.sendDate.setText(notification.getSendDate() != null ? notification.getSendDate() : "Unknown Date");

            holder.iconTextView.setText(getIconForType(notification.getNotificationType()));

            boolean isRead = sharedPreferences.getBoolean("isRead_" + notification.getId(), false);
            holder.checkBox.setChecked(isRead);

            holder.checkBox.setOnCheckedChangeListener((buttonView, isChecked) -> {
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.putBoolean("isRead_" + notification.getId(), isChecked);
                editor.apply();
                notification.setRead(isChecked);
            });
        }
    }

    @Override
    public int getItemCount() {
        return notificationList != null ? notificationList.size() : 0;
    }

    private String getIconForType(NotificationType type) {
        if (type == null) return "🔔";
        switch (type) {
            case VEHICLE:
                return "🚗";
            case PAYMENT:
                return "💵";
            case INFO:
            default:
                return "ℹ️";
        }
    }

    public static class NotificationViewHolder extends RecyclerView.ViewHolder {
        TextView header, summary, sendDate, iconTextView;
        CheckBox checkBox;

        public NotificationViewHolder(@NonNull View itemView) {
            super(itemView);
            header = itemView.findViewById(R.id.notification_header);
            summary = itemView.findViewById(R.id.notification_summary);
            sendDate = itemView.findViewById(R.id.notification_send_date);
            checkBox = itemView.findViewById(R.id.check_box);
            iconTextView = itemView.findViewById(R.id.icon);
        }
    }
}
