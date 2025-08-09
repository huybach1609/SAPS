package vn.edu.fpt.sapsmobile.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.models.Vehicle;
import vn.edu.fpt.sapsmobile.listener.VehicleFragmentListener;
import vn.edu.fpt.sapsmobile.utils.RecyclerUtils;

public class VehicleAdapter extends RecyclerView.Adapter<VehicleAdapter.VehicleViewHolder>
        implements RecyclerUtils.UpdatableAdapter<Vehicle> {

    private List<Vehicle> vehicles = new ArrayList<>(); // luôn khởi tạo
    @Nullable
    private VehicleFragmentListener actionListener;

    // Constructor có dữ liệu và listener
    public VehicleAdapter(@Nullable List<Vehicle> vehicles, @Nullable VehicleFragmentListener listener) {
        if (vehicles != null) {
            this.vehicles = new ArrayList<>(vehicles);
        } else {
            this.vehicles = new ArrayList<>();
        }
        this.actionListener = listener;
    }

    // Constructor mặc định (list rỗng)
    public VehicleAdapter() {
        this.vehicles = new ArrayList<>();
        this.actionListener = null;
    }

    public void setListener(@Nullable VehicleFragmentListener listener) {
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
        // phòng trường hợp index out of bounds (an toàn hơn)
        if (position < 0 || position >= vehicles.size()) return;
        Vehicle vehicle = vehicles.get(position);
        holder.bind(vehicle, actionListener);
    }

    @Override
    public int getItemCount() {
        return vehicles == null ? 0 : vehicles.size();
    }

    @Override
    public void updateData(@NonNull List<Vehicle> newData) {
        // đảm bảo không gán null trực tiếp
        this.vehicles = new ArrayList<>(newData == null ? new ArrayList<>() : newData);
        notifyDataSetChanged();
    }

    // Tùy chọn: cập nhật 1 phần dữ liệu (không bắt buộc)
    public void setVehicles(@NonNull List<Vehicle> newVehicles) {
        this.vehicles = new ArrayList<>(newVehicles);
        notifyDataSetChanged();
    }

    static class VehicleViewHolder extends RecyclerView.ViewHolder {

        TextView tvLicensePlate, tvMakeModelYear, tvColor, tvSharingStatus;

        public VehicleViewHolder(@NonNull View itemView) {
            super(itemView);
            tvLicensePlate = itemView.findViewById(R.id.tvLicensePlate);
            tvMakeModelYear = itemView.findViewById(R.id.tvMakeModelYear);
            tvColor = itemView.findViewById(R.id.tvColor);
            tvSharingStatus = itemView.findViewById(R.id.tvSharingStatus);

        }

        void bind(@NonNull Vehicle vehicle, @Nullable VehicleFragmentListener actionListener) {
            tvLicensePlate.setText(vehicle.getLicensePlate() != null ? vehicle.getLicensePlate() : "");
            String makeModel = ((vehicle.getBrand() != null ? vehicle.getBrand() : "") +
                    (vehicle.getModel() != null && !vehicle.getModel().isEmpty() ? " " + vehicle.getModel() : ""));
            tvMakeModelYear.setText(makeModel.trim());
            tvColor.setText(itemView.getContext().getString(R.string.label_color_prefix, vehicle.getColor() != null ? vehicle.getColor() : ""));
            tvSharingStatus.setText(vehicle.getSharingStatus() != null ? vehicle.getSharingStatus() : "");

            // Bảo vệ null listener trước khi gọi
            itemView.setOnClickListener(v -> {
                if (actionListener != null) actionListener.onVehicleClicked(vehicle);
            });
        }
    }
}
