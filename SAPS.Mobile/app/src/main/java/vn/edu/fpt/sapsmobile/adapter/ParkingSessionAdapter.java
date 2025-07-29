package vn.edu.fpt.sapsmobile.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.HistoryFragmentHandler;
import vn.edu.fpt.sapsmobile.models.ParkingSession;

public class ParkingSessionAdapter extends RecyclerView.Adapter<ParkingSessionAdapter.ViewHolder> {

    private final List<ParkingSession> sessions;
    private final HistoryFragmentHandler handler;
    public ParkingSessionAdapter(List<ParkingSession> sessions, HistoryFragmentHandler handler) {
        this.sessions = sessions;
        this.handler = handler;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_parking_history, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ParkingSession session = sessions.get(position);

        holder.tvParkingLotName.setText("SAPLS Parking System -");
        holder.tvLocation.setText(session.getParkingLotId());
        holder.tvVehicle.setText(session.getVehicleId());

        // Format duration
        String duration = calculateDuration(session.getEntryDateTime(), session.getExitDateTime());
        holder.tvDuration.setText(duration);

        // Format date
        String date = formatDate(session.getEntryDateTime());
        holder.tvDate.setText(date);

        holder.tvAmount.setText(String.format("$%.2f", session.getCost()));
        holder.tvStatus.setText(session.getTransactionId() == null ? "Pending" : "Paid");
    }

    @Override
    public int getItemCount() {
        return sessions.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvParkingLotName, tvLocation, tvVehicle, tvDuration, tvDate, tvAmount, tvStatus;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvParkingLotName = itemView.findViewById(R.id.tvParkingLotName);
            tvLocation = itemView.findViewById(R.id.tvLocation);
            tvVehicle = itemView.findViewById(R.id.tvVehicle);
            tvDuration = itemView.findViewById(R.id.tvDuration);
            tvDate = itemView.findViewById(R.id.tvDate);
            tvAmount = itemView.findViewById(R.id.tvAmount);
            tvStatus = itemView.findViewById(R.id.tvStatus);
        }
    }

    private String calculateDuration(String entry, String exit) {
        if (exit == null) exit = LocalDateTime.now().toString();
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        LocalDateTime entryTime = LocalDateTime.parse(entry, formatter);
        LocalDateTime exitTime = LocalDateTime.parse(exit, formatter);

        long minutes = java.time.Duration.between(entryTime, exitTime).toMinutes();
        long hours = minutes / 60;
        minutes = minutes % 60;

        return hours + "h " + minutes + "m";
    }

    private String formatDate(String dateTime) {
        DateTimeFormatter inputFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("MMM d, yyyy");
        LocalDateTime date = LocalDateTime.parse(dateTime, inputFormatter);
        return outputFormatter.format(date);
    }
}
