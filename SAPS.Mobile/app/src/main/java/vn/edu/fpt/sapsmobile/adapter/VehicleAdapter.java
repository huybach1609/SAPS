package vn.edu.fpt.sapsmobile.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class VehicleAdapter extends RecyclerView.Adapter<VehicleAdapter.VehicleViewHolder> {

    private List<Vehicle> vehicles;
    private OnVehicleActionListener actionListener;

    public interface OnVehicleActionListener {
        void onEditClicked(Vehicle vehicle);
        void onShareClicked(Vehicle vehicle);
    }

    public VehicleAdapter(List<Vehicle> vehicles, OnVehicleActionListener listener) {
        this.vehicles = vehicles;
        this.actionListener = listener;
    }

    @NonNull
    @Override
    public VehicleViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_vehicle, parent, false);
        return new VehicleViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VehicleViewHolder holder, int position) {
        Vehicle vehicle = vehicles.get(position);

        holder.tvLicensePlate.setText(vehicle.getLicensePlate());
        holder.tvMakeModelYear.setText(vehicle.getBrand() + " " + vehicle.getModel());
        holder.tvColor.setText("Color: " + vehicle.getColor());
        holder.tvSharingStatus.setText(vehicle.getSharingStatus());

        holder.btnEdit.setOnClickListener(v -> actionListener.onEditClicked(vehicle));
        holder.btnShare.setOnClickListener(v -> actionListener.onShareClicked(vehicle));
    }

    @Override
    public int getItemCount() {
        return vehicles.size();
    }

    static class VehicleViewHolder extends RecyclerView.ViewHolder {

        TextView tvLicensePlate, tvMakeModelYear, tvColor, tvSharingStatus;
        Button btnEdit, btnShare;

        public VehicleViewHolder(@NonNull View itemView) {
            super(itemView);
            tvLicensePlate = itemView.findViewById(R.id.tvLicensePlate);
            tvMakeModelYear = itemView.findViewById(R.id.tvMakeModelYear);
            tvColor = itemView.findViewById(R.id.tvColor);
            tvSharingStatus = itemView.findViewById(R.id.tvSharingStatus);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            btnShare = itemView.findViewById(R.id.btnShare);
        }
    }
}
