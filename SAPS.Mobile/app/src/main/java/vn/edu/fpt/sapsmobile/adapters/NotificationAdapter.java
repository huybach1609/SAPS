
package vn.edu.fpt.sapsmobile.adapters;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.drawable.Drawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.card.MaterialCardView;

import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.enums.NotificationType;
import vn.edu.fpt.sapsmobile.models.Notification;

public class NotificationAdapter extends RecyclerView.Adapter<NotificationAdapter.NotificationViewHolder> {
    private List<Notification> notificationList;
    private SharedPreferences sharedPreferences;
    private OnNotificationClickListener listener;


    public NotificationAdapter(List<Notification> notificationList, Context context, OnNotificationClickListener listener) {
        this.notificationList = notificationList;
        this.sharedPreferences = context.getSharedPreferences("NotificationsPrefs", Context.MODE_PRIVATE);
        this.listener = listener;
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
            Notification notification = notificationList.get(position) ;

            holder.header.setText(notification.getHeader() != null ? notification.getHeader() : "No Header");
            holder.summary.setText(notification.getSummary() != null ? notification.getSummary() : "No Summary");
            holder.sendDate.setText(notification.getSendDate() != null ? notification.getSendDate() : "");

            holder.iconTextView.setImageResource(getIconForType(notification.getNotificationType()));

            if(notification.isRead()){
                holder.materialCardView.setCardBackgroundColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.md_theme_secondaryContainer)
                );
                holder.header.setTextColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.md_theme_onSecondaryContainer)
                );
                holder.summary.setTextColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.md_theme_onSecondaryContainer)
                );
                holder.sendDate.setTextColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.md_theme_onSecondaryContainer)
                );

            }else{
                holder.materialCardView.setCardBackgroundColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.md_theme_primaryContainer)
                );
                holder.header.setTextColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.md_theme_onPrimaryContainer)
                );
                holder.summary.setTextColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.md_theme_onPrimaryContainer)
                );
                holder.sendDate.setTextColor(
                        ContextCompat.getColor(holder.itemView.getContext(), R.color.md_theme_onPrimaryContainer)
                );
            }
            holder.materialCardView.setOnClickListener(v -> listener.onNotificationClick(notification, position));
        }
    }
    public interface OnNotificationClickListener {
        void onNotificationClick(Notification notification, int position);
    }



    @Override
    public int getItemCount() {
        return notificationList != null ? notificationList.size() : 0;
    }

    private int getIconForType(NotificationType type) {
        if (type == null) return R.drawable.notification_24dp;
        switch (type) {
            case VEHICLE:
                return R.drawable.ic_car;
            case PAYMENT:
                return R.drawable.credit_card_24dp;
            case INFO:
            default:
                return R.drawable.exclamation_24dp;
        }
    }

    public static class NotificationViewHolder extends RecyclerView.ViewHolder {
        TextView header, summary, sendDate;

        ImageView iconTextView;
        MaterialCardView materialCardView;
        CheckBox checkBox;

        public NotificationViewHolder(@NonNull View itemView) {
            super(itemView);
            header = itemView.findViewById(R.id.notification_title);
            summary = itemView.findViewById(R.id.notification_body);
            sendDate = itemView.findViewById(R.id.notification_timestamp);
//            checkBox = itemView.findViewById(R.id.check_box);
            iconTextView = itemView.findViewById(R.id.notification_icon);
            materialCardView= itemView.findViewById(R.id.material_card_notification_item);
        }
    }
}
