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
import vn.edu.fpt.sapsmobile.listener.VehicleFragmentListener;
import vn.edu.fpt.sapsmobile.utils.RecyclerUtils;

public class VehicleAdapter extends RecyclerView.Adapter<VehicleAdapter.VehicleViewHolder>
        implements RecyclerUtils.UpdatableAdapter<Vehicle> {

    private List<Vehicle> vehicles;
    private VehicleFragmentListener actionListener;

    public VehicleAdapter(List<Vehicle> vehicles, VehicleFragmentListener listener) {
        this.vehicles = vehicles;
        this.actionListener = listener;
    }
    public VehicleAdapter() {

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
        holder.bind(vehicle, actionListener);
    }

    @Override
    public int getItemCount() {
        return vehicles.size();
    }

    @Override
    public void updateData(List<Vehicle> newData) {
        this.vehicles = newData;
        notifyDataSetChanged();
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

        void bind(Vehicle vehicle, VehicleFragmentListener actionListener) {
            tvLicensePlate.setText(vehicle.getLicensePlate());
            tvMakeModelYear.setText(vehicle.getBrand() + " " + vehicle.getModel());
            tvColor.setText("Color: " + vehicle.getColor());
            tvSharingStatus.setText(vehicle.getSharingStatus());

            btnEdit.setOnClickListener(v -> actionListener.onEditClicked(vehicle));
            btnShare.setOnClickListener(v -> actionListener.onShareClicked(vehicle));
            itemView.setOnClickListener(v -> actionListener.onVehicleClicked(vehicle));
        }
    }
}
