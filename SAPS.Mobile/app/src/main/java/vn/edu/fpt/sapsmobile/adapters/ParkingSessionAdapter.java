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
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.listener.HistoryFragmentVehicleDetailListener;
import vn.edu.fpt.sapsmobile.dtos.parkingsession.OwnedSessionResponse;
import vn.edu.fpt.sapsmobile.dtos.vehicle.VehicleSummaryDto;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.utils.DateTimeHelper;
import vn.edu.fpt.sapsmobile.enums.SessionStatus;

public class ParkingSessionAdapter extends RecyclerView.Adapter<ParkingSessionAdapter.ParkingSessionViewHolder> {

    private final List<OwnedSessionResponse.OwnedParkingSessionDto> sessions;
    private final HistoryFragmentVehicleDetailListener listener;
    private final Context context;
    private final String fragment;
    private Map<String, Vehicle> vehicleMap = new HashMap<>();

    public ParkingSessionAdapter(List<OwnedSessionResponse.OwnedParkingSessionDto> sessions, HistoryFragmentVehicleDetailListener listener, Context context, String fragment) {
        this.sessions = sessions;
        this.listener = listener;
        this.context = context;
        this.fragment = fragment;
    }
    
    public void updateItems(List<OwnedSessionResponse.OwnedParkingSessionDto> newList) {
        this.sessions.clear();
        this.sessions.addAll(newList);
        notifyDataSetChanged();
    }
    
    public void setVehicles(List<VehicleSummaryDto> vehicles) {
        vehicleMap.clear();
        for (VehicleSummaryDto vehicleDto : vehicles) {
            Vehicle vehicle = new Vehicle();
            vehicle.setId(vehicleDto.getId());
            vehicle.setLicensePlate(vehicleDto.getLicensePlate());
            vehicle.setBrand(vehicleDto.getBrand());
            vehicle.setModel(vehicleDto.getModel());
            vehicleMap.put(vehicleDto.getLicensePlate(), vehicle);
        }
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
        OwnedSessionResponse.OwnedParkingSessionDto session = sessions.get(position);
        holder.bind(session, listener, context);
    }

    @Override
    public int getItemCount() {
        return sessions.size();
    }

    class ParkingSessionViewHolder extends RecyclerView.ViewHolder {

        TextView tvParkingLotName, tvLocation, tvVehicle, tvDuration, tvDate, tvAmount, tvStatus;

        OwnedSessionResponse.OwnedParkingSessionDto session;
        Vehicle vehicle;

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

        void bind(OwnedSessionResponse.OwnedParkingSessionDto session, HistoryFragmentVehicleDetailListener listener, Context context) {
            this.session = session;

            // Set thời lượng
            if (session.getExitDateTime() == null) {
                LocalDateTime now = LocalDateTime.now();
                tvDuration.setText(DateTimeHelper.calculateDuration(session.getEntryDateTime(), now.toString()));
            } else {
                tvDuration.setText(DateTimeHelper.calculateDuration(session.getEntryDateTime(), session.getExitDateTime()));
            }

            // Set ngày
            tvDate.setText(DateTimeHelper.formatDate(session.getEntryDateTime()));

            // Set amount + status
            NumberFormat vndFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
            tvAmount.setText(vndFormat.format(session.getCost()));

            // Set status based on SessionStatus from DTO
            SessionStatus sessionStatus = SessionStatus.fromApiValue(session.getStatus());
            tvStatus.setText(sessionStatus.getDisplayText());

            // Get vehicle from map or create a basic one
            vehicle = vehicleMap.get(session.getLicensePlate());
            if (vehicle != null) {
                tvVehicle.setText(vehicle.getBrand() + " " + vehicle.getModel() + " " + vehicle.getLicensePlate());
            } else {
                tvVehicle.setText(session.getLicensePlate() != null ? session.getLicensePlate() : "");
                // Create a basic vehicle object for the listener
                vehicle = new Vehicle();
                vehicle.setLicensePlate(session.getLicensePlate());
            }
            
            tvParkingLotName.setText(session.getParkingLotName() != null ? session.getParkingLotName() : "");
            tvLocation.setText("");

            itemView.setOnClickListener(v -> {
                if (listener != null && vehicle != null) {
                    if(fragment.equals("historyFragment")){
                        Log.i("ParkingSessionAdapter", "Session ID: " + session.getId());


//
                        listener.onParkingSessionSeeDetailClick(session.getId(), vehicle, null);
                    } else if (fragment.equals("homeFragment")) {
                        // Create a temporary ParkingSession object for the listener
                        vn.edu.fpt.sapsmobile.models.ParkingSession tempSession = new vn.edu.fpt.sapsmobile.models.ParkingSession();
                        tempSession.setId(session.getId());
                        tempSession.setEntryDateTime(session.getEntryDateTime());
                        tempSession.setExitDateTime(session.getExitDateTime());
                        tempSession.setCost(session.getCost());
                        tempSession.setParkingLotName(session.getParkingLotName());
                        tempSession.setVehicle(vehicle);
                        tempSession.setVehicleId(vehicle.getId());
                        tempSession.setTransactionId(session.getPaymentStatus() != null && session.getPaymentStatus().equalsIgnoreCase("PAID") ? "PAID" : null);
                        
                        listener.onParkingSessionClickToCheckOut(tempSession, vehicle, null);
                    }
                }
            });
        }
    }
}
