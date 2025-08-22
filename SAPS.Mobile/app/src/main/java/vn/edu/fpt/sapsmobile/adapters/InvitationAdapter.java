package vn.edu.fpt.sapsmobile.adapters;


import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Button;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.card.MaterialCardView;
import com.google.android.material.chip.Chip;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.dtos.sharevehicle.ShareVehicleResponse;

public class InvitationAdapter extends RecyclerView.Adapter<InvitationAdapter.InvitationViewHolder> {

    private List<ShareVehicleResponse> vehicles;
    private OnVehicleClickListener listener;

    public interface OnVehicleClickListener {
        void onVehicleClick(ShareVehicleResponse vehicle, int position);

        void onVehicleShareClick(ShareVehicleResponse vehicle, int position);
        
        void onAcceptShareVehicle(ShareVehicleResponse vehicle, int position);
    }

    public InvitationAdapter(List<ShareVehicleResponse> vehicles) {
        this.vehicles = vehicles;
    }

    public void setOnVehicleClickListener(OnVehicleClickListener listener) {
        this.listener = listener;
    }

    @NonNull
    @Override
    public InvitationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_vehicle_invitation, parent, false);
        return new InvitationViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull InvitationViewHolder holder, int position) {
        ShareVehicleResponse vehicle = vehicles.get(position);
        holder.bind(vehicle, position, holder);
    }

    @Override
    public int getItemCount() {
        return vehicles != null ? vehicles.size() : 0;
    }

    public void updateVehicles(List<ShareVehicleResponse> newVehicles) {
        this.vehicles = newVehicles;
        notifyDataSetChanged();
    }

    public void addVehicle(ShareVehicleResponse vehicle) {
        if (vehicles != null) {
            vehicles.add(vehicle);
            notifyItemInserted(vehicles.size() - 1);
        }
    }

    public void removeVehicle(int position) {
        if (vehicles != null && position >= 0 && position < vehicles.size()) {
            vehicles.remove(position);
            notifyItemRemoved(position);
        }
    }

    class InvitationViewHolder extends RecyclerView.ViewHolder {

        private MaterialCardView cardView;
        private TextView tvLicensePlate;
        private TextView tvVehicleName;
        private TextView tvOwnerName;
        private TextView tvColor;
        private Chip chipSharingStatus;

        private TextView tvNofication;
        private Button btnAccept;
        public InvitationViewHolder(@NonNull View itemView) {
            super(itemView);
            initViews();
            setupClickListeners();
        }

        private void initViews() {
            cardView = itemView.findViewById(R.id.cardVehicle);
            tvLicensePlate = itemView.findViewById(R.id.tvLicensePlate);
            tvVehicleName = itemView.findViewById(R.id.tvVehicleName);
            tvOwnerName = itemView.findViewById(R.id.tvOwnerName);
            tvColor = itemView.findViewById(R.id.tvColor);
            chipSharingStatus = itemView.findViewById(R.id.chipSharingStatus);
            tvNofication = itemView.findViewById(R.id.tv_invitation_notification);
            btnAccept = itemView.findViewById(R.id.btnAccept);
        }

        private void setupClickListeners() {
            cardView.setOnClickListener(v -> {
                if (listener != null) {
                    int position = getAdapterPosition();
                    if (position != RecyclerView.NO_POSITION) {
                        listener.onVehicleClick(vehicles.get(position), position);
                    }
                }
            });

        }

        public void bind(ShareVehicleResponse vehicle, int position, InvitationViewHolder holder) {
            // License plate (main identifier)
            tvLicensePlate.setText(vehicle.getLicensePlate());

            // Vehicle name (brand + model)
            String vehicleName = vehicle.getBrand() + " " + vehicle.getModel();
            tvVehicleName.setText(vehicleName);
            // Owner name
            tvOwnerName.setText(vehicle.getOwnerVehicleFullName());
            // Color
            tvColor.setText(vehicle.getColor());

            tvNofication.setText(holder.itemView.getContext().getString(R.string.item_vehicle_invitation_notification, vehicle.getOwnerVehicleFullName()));

            // Sharing status chip - you might need to map from your JSON sharingStatus field
            // Since VehicleResponse doesn't have sharingStatus field, using a default
            chipSharingStatus.setText("Available");
            chipSharingStatus.setChipBackgroundColorResource(R.color.md_theme_secondaryContainer);

            // Set card elevation and styling
            cardView.setCardElevation(2f);
            cardView.setStrokeWidth(0);

            if (btnAccept != null) {
                btnAccept.setOnClickListener(v -> {
                    String title = "Confirm";
                    String message = holder.itemView.getContext().getString(
                            R.string.item_vehicle_invitation_notification,
                            vehicle.getOwnerVehicleFullName()
                    );

                    new MaterialAlertDialogBuilder(holder.itemView.getContext())
                            .setTitle(title)
                            .setMessage(message)
                            .setNegativeButton(android.R.string.cancel, (dialog, which) -> dialog.dismiss())
                            .setPositiveButton(R.string.item_vehicle_invitation_btn_details, (dialog, which) -> {
                                if (listener != null) {
//                                    int position = getAdapterPosition();
                                    if (position != RecyclerView.NO_POSITION) {
                                        listener.onAcceptShareVehicle(vehicles.get(position), position);
                                    }
                                }
                                dialog.dismiss();
                            })
                            .show();
                });
            }
        }
    }
}
