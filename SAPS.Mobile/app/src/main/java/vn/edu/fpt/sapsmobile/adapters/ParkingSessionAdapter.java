package vn.edu.fpt.sapsmobile.adapters;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.listener.HistoryFragmentVehicleDetailListener;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.utils.DateTimeHelper;

public class ParkingSessionAdapter extends RecyclerView.Adapter<ParkingSessionAdapter.ParkingSessionViewHolder> {

    private final List<ParkingSession> sessions;
    private final HistoryFragmentVehicleDetailListener listener;
    private final Context context;
    private final String fragment;

    public ParkingSessionAdapter(List<ParkingSession> sessions, HistoryFragmentVehicleDetailListener listener, Context context, String fragment) {
        this.sessions = sessions;
        this.listener = listener;
        this.context = context;
        this.fragment = fragment;

    }
    public void updateItems(List<ParkingSession> newList) {
        this.sessions.clear();
        this.sessions.addAll(newList);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ParkingSessionViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_parking_history, parent, false);
        return new ParkingSessionViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ParkingSessionViewHolder holder, int position) {
        ParkingSession session = sessions.get(position);
        holder.bind(session, listener, context);
    }

    @Override
    public int getItemCount() {
        return sessions.size();
    }

    class ParkingSessionViewHolder extends RecyclerView.ViewHolder {

        TextView tvParkingLotName, tvLocation, tvVehicle, tvDuration, tvDate, tvAmount, tvStatus;

        ParkingSession session;
        Vehicle vehicle;
        // No parking lot fetch; we rely on pre-fetched data

        public ParkingSessionViewHolder(@NonNull View itemView) {
            super(itemView);
            tvParkingLotName = itemView.findViewById(R.id.tvParkingLotName);
            tvLocation = itemView.findViewById(R.id.tvLocation);
            tvVehicle = itemView.findViewById(R.id.tvVehicle);
            tvDuration = itemView.findViewById(R.id.tvDuration);
            tvDate = itemView.findViewById(R.id.tvDate);
            tvAmount = itemView.findViewById(R.id.tvAmount);
            tvStatus = itemView.findViewById(R.id.tvStatus);
        }

        void bind(ParkingSession session, HistoryFragmentVehicleDetailListener listener, Context context) {
            this.session = session;

            // Set thời lượng
            if (session.getExitDateTime() == null) {
                LocalDateTime now = LocalDateTime.now();
                tvDuration.setText(DateTimeHelper.calculateDuration(session.getEntryDateTime(),now.toString()));
            } else {
                tvDuration.setText(DateTimeHelper.calculateDuration(session.getEntryDateTime(), session.getExitDateTime()));
            }

            // Set ngày
            tvDate.setText(DateTimeHelper.formatDate(session.getEntryDateTime()));

            // Set amount + status
            NumberFormat vndFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
            tvAmount.setText(vndFormat.format(session.getCost()));

            // Set status

            String statusCheck = session.getTransactionId() == null ? "Pending" : "Paid";
            tvStatus.setTextColor(
                    ContextCompat.getColor(itemView.getContext(), R.color.md_theme_onTertiaryFixedVariant)
            );
            if (session.getExitDateTime() == null) {
                statusCheck = "On Going";
                tvStatus.setTextColor(
                        ContextCompat.getColor(itemView.getContext(), R.color.md_theme_tertiaryFixedDim_mediumContrast)
                );
            }
            tvStatus.setText(statusCheck);

            // Use pre-fetched vehicle and parking lot name
            vehicle = session.getVehicle();
            if (vehicle != null) {
                tvVehicle.setText(vehicle.getBrand() + " " + vehicle.getModel() + " " + vehicle.getLicensePlate());
            } else {
                tvVehicle.setText("");
            }
            tvParkingLotName.setText(session.getParkingLotName() != null ? session.getParkingLotName() : "");
            tvLocation.setText("");

            itemView.setOnClickListener(v -> {
                if (listener != null && vehicle != null) {
                    if(fragment.equals("historyFragment")){
                        Log.i("ParkingSessionAdapter", session.toString());
                        listener.onParkingSessionSeeDetailClick(session, vehicle, null);
                    } else if (fragment.equals("homeFragment")) {
                        listener.onParkingSessionClickToCheckOut(session, vehicle, null);
                    }
                }
            });
        }



    }
}
