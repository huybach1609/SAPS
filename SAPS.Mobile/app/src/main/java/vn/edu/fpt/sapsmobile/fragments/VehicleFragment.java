package vn.edu.fpt.sapsmobile.fragments;

import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;


import java.util.ArrayList;
import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.VehicleActionHandler;
import vn.edu.fpt.sapsmobile.adapter.VehicleAdapter;
import vn.edu.fpt.sapsmobile.models.Vehicle;


public class VehicleFragment extends Fragment {
    private RecyclerView rvVehicles;
    private VehicleAdapter vehicleAdapter;
    private List<Vehicle> vehicleList;
    private TextView tv_share_code;

    public VehicleFragment() {
        // Required empty public constructor
    }

    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_vehicle, container, false);
        rvVehicles = view.findViewById(R.id.rvVehicles);
        rvVehicles.setLayoutManager(new LinearLayoutManager(getContext()));
        tv_share_code = view.findViewById(R.id.tv_share_code);
        return view;
    }
    private List<Vehicle> getFakeVehicles() {
        List<Vehicle> list = new ArrayList<>();
        Vehicle v = new Vehicle();
        v.setLicensePlate("30A-12345");
        v.setBrand("Toyota");
        v.setModel("Vios");
        Vehicle y = new Vehicle();
        y.setLicensePlate("36A-4953");
        y.setBrand("Mer");
        y.setModel("GLC200");
        list.add(v);
        list.add(y);
        return list;
    }



    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // Initialize vehicle-related views and functionality
        tv_share_code.setText("code_share_get_by_api"); // Có thể thay bằng gọi API
        vehicleList = getFakeVehicles(); // Có thể thay bằng gọi API
        vehicleAdapter = new VehicleAdapter(vehicleList, new VehicleActionHandler(requireContext()));
        rvVehicles.setAdapter(vehicleAdapter);
    }
}
