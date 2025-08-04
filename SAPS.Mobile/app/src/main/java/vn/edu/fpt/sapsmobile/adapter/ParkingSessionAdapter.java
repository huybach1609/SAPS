package vn.edu.fpt.sapsmobile.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.sapsmobile.API.ApiTest;
import vn.edu.fpt.sapsmobile.API.apiinterface.ParkingLotApiService;
import vn.edu.fpt.sapsmobile.API.apiinterface.VehicleApiService;
import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.listener.HistoryFragmentListener;
import vn.edu.fpt.sapsmobile.models.ParkingLot;
import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class ParkingSessionAdapter extends RecyclerView.Adapter<ParkingSessionAdapter.ParkingSessionViewHolder> {

    private final List<ParkingSession> sessions;
    private final HistoryFragmentListener listener;
    private final Context context;
    private final String fragment;

    public ParkingSessionAdapter(List<ParkingSession> sessions, HistoryFragmentListener listener, Context context,String fragment) {
        this.sessions = sessions;
        this.listener = listener;
        this.context = context;
        this.fragment = fragment;

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
        ParkingLot parkingLot;

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

        void bind(ParkingSession session, HistoryFragmentListener listener, Context context) {
            this.session = session;

            // Set thời lượng
            if (session.getExitDateTime() == null) {
                tvDuration.setText("Unknown");
            } else {
                tvDuration.setText(calculateDuration(session.getEntryDateTime(), session.getExitDateTime()));
            }

            // Set ngày
            tvDate.setText(formatDate(session.getEntryDateTime()));

            // Set amount + status
            tvAmount.setText(String.format("$%.2f", session.getCost()));
            tvStatus.setText(session.getTransactionId() == null ? "Pending" : "Paid");

            // Call API lấy Vehicle
            VehicleApiService vehicleApiService = ApiTest.getService(context).create(VehicleApiService.class);
            vehicleApiService.getVehiclebyID(session.getVehicleId()).enqueue(new Callback<Vehicle>() {
                @Override
                public void onResponse(Call<Vehicle> call, Response<Vehicle> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        vehicle = response.body();
                        tvVehicle.setText(vehicle.getBrand() + " " + vehicle.getModel() + " " + vehicle.getLicensePlate());
                    }
                }

                @Override
                public void onFailure(Call<Vehicle> call, Throwable t) { }
            });

            // Call API lấy ParkingLot
            ParkingLotApiService parkingLotApiService = ApiTest.getService(context).create(ParkingLotApiService.class);
            parkingLotApiService.getParkingLotById(session.getParkingLotId()).enqueue(new Callback<ParkingLot>() {
                @Override
                public void onResponse(Call<ParkingLot> call, Response<ParkingLot> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        parkingLot = response.body();
                        tvParkingLotName.setText(parkingLot.getName() + " - ");
                        tvLocation.setText(parkingLot.getAddress());
                    }
                }

                @Override
                public void onFailure(Call<ParkingLot> call, Throwable t) { }
            });

            itemView.setOnClickListener(v -> {
                if (listener != null && session != null && vehicle != null && parkingLot != null) {
                    if(fragment=="historyFragment"){
                        listener.onParkingSessionSeeDetailClick(session, vehicle, parkingLot);
                    }else if (fragment=="homeFragment") {
                        listener.onParkingSessionClickToCheckOut(session, vehicle, parkingLot);
                    }
                }
            });
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
}
