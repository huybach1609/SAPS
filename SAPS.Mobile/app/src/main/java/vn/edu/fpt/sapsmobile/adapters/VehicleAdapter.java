package vn.edu.fpt.sapsmobile.adapters;

import android.content.res.ColorStateList;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import vn.edu.fpt.sapsmobile.utils.ColorUtil;

import java.util.ArrayList;
import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.listener.VehicleFragmentVehicleDetailListener;
import vn.edu.fpt.sapsmobile.utils.RecyclerUtils;

public class VehicleAdapter extends RecyclerView.Adapter<VehicleAdapter.VehicleViewHolder>
        implements RecyclerUtils.UpdatableAdapter<Vehicle> {

    private List<Vehicle> vehicles = new ArrayList<>(); // luôn khởi tạo
    private  int TabCurrent = 0;
    @Nullable
    private VehicleFragmentVehicleDetailListener actionListener;

    public VehicleAdapter(@Nullable List<Vehicle> vehicles, @Nullable VehicleFragmentVehicleDetailListener listener) {
        if (vehicles != null) {
            this.vehicles = new ArrayList<>(vehicles);
        } else {
            this.vehicles = new ArrayList<>();
        }
        this.actionListener = listener;
    }

    public VehicleAdapter() {
        this.vehicles = new ArrayList<>();
        this.actionListener = null;
    }

    public void setListener(@Nullable VehicleFragmentVehicleDetailListener listener) {
        this.actionListener = listener;
    }

    public void setCurrentTab(int currentTab) {
        this.TabCurrent = currentTab;
        notifyDataSetChanged(); // Refresh the adapter to apply tab-specific changes
    }

    public int getCurrentTab() {
        return TabCurrent;
    }

    public VehicleFragmentVehicleDetailListener getActionListener() {
        return actionListener;
    }

    @NonNull
    @Override
    public VehicleViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_vehicle, parent, false);
        return new VehicleViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull VehicleViewHolder holder, int position) {
        if (position < 0 || position >= vehicles.size()) return;
        Vehicle vehicle = vehicles.get(position);
        holder.bind(vehicle, actionListener, TabCurrent);
    }

    @Override
    public int getItemCount() {
        return vehicles == null ? 0 : vehicles.size();
    }

    @Override
    public void updateData(@NonNull List<Vehicle> newData) {
        this.vehicles = new ArrayList<>(newData == null ? new ArrayList<>() : newData);
        notifyDataSetChanged();
    }


    static class VehicleViewHolder extends RecyclerView.ViewHolder {

        TextView tvLicensePlate, tvMakeModelYear, tvColor, tvSharingStatus;
        ImageView imgDot;

        public VehicleViewHolder(@NonNull View itemView) {
            super(itemView);
            tvLicensePlate = itemView.findViewById(R.id.tvLicensePlate);
            tvMakeModelYear = itemView.findViewById(R.id.tvMakeModelYear);
            tvColor = itemView.findViewById(R.id.tvColor);
            tvSharingStatus = itemView.findViewById(R.id.tvSharingStatus);
            imgDot = itemView.findViewById(R.id.img_dot);

        }

        void bind(@NonNull Vehicle vehicle, @Nullable VehicleFragmentVehicleDetailListener actionListener, int currentTab) {
            
            tvLicensePlate.setText(vehicle.getLicensePlate() != null ? vehicle.getLicensePlate() : "");
            String makeModel = ((vehicle.getBrand() != null ? vehicle.getBrand() : "") +
                    (vehicle.getModel() != null && !vehicle.getModel().isEmpty() ? " " + vehicle.getModel() : ""));
            tvMakeModelYear.setText(makeModel.trim());
            tvColor.setText(itemView.getContext().getString(R.string.label_color_prefix, vehicle.getColor() != null ? vehicle.getColor() : ""));
            
            // Customize display based on current tab
            if (currentTab == 0) { // My Vehicles tab
                tvSharingStatus.setText(vehicle.getSharingStatus() != null ? vehicle.getSharingStatus() : "");
                tvSharingStatus.setTextColor(ColorUtil.getShareVehicleStatusColor(itemView.getContext(), vehicle.getSharingStatus()));
                
                imgDot.setVisibility(View.VISIBLE);
                int backgroundColor = ColorUtil.getShareVehicleStatusBackgroundColor(itemView.getContext(), vehicle.getSharingStatus());
                imgDot.setImageTintList(ColorStateList.valueOf(backgroundColor));
            } else { // Shared Vehicles tab

                tvSharingStatus.setText(vehicle.getSharingStatus() != null ? vehicle.getSharingStatus() : "");
                tvSharingStatus.setTextColor(ColorUtil.getShareVehicleStatusColor(itemView.getContext(), vehicle.getSharingStatus()));
                
                // Hide dot indicator for shared vehicles or show different indicator
                imgDot.setVisibility(View.GONE);
            }

            itemView.setOnClickListener(v -> {
                if (actionListener != null) actionListener.onVehicleClicked(vehicle);
            });
        }
    }
}
