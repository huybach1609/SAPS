    package vn.edu.fpt.sapsmobile.fragments;

    import androidx.fragment.app.Fragment;
    import androidx.recyclerview.widget.LinearLayoutManager;
    import androidx.recyclerview.widget.RecyclerView;

    import android.content.ClipData;
    import android.content.ClipboardManager;
    import android.content.Context;
    import android.content.Intent;
    import android.graphics.Color;
    import android.os.Bundle;
    import android.view.LayoutInflater;
    import android.view.View;
    import android.view.ViewGroup;
    import android.widget.Button;
    import android.widget.TextView;
    import android.widget.Toast;


    import java.util.ArrayList;
    import java.util.List;

    import retrofit2.Call;
    import retrofit2.Callback;
    import retrofit2.Response;
    import vn.edu.fpt.sapsmobile.API.ApiTest;
    import vn.edu.fpt.sapsmobile.API.apiinterface.VehicleApiService;
    import vn.edu.fpt.sapsmobile.R;
    import vn.edu.fpt.sapsmobile.actionhandler.VehicleFragmentHandler;
    import vn.edu.fpt.sapsmobile.activities.sharevehicle.ShareVehicleAccessActivity;
    import vn.edu.fpt.sapsmobile.adapter.VehicleAdapter;
    import vn.edu.fpt.sapsmobile.dialog.AddVehicleDialog;
    import vn.edu.fpt.sapsmobile.models.Vehicle;
    import vn.edu.fpt.sapsmobile.utils.RecyclerUtils;


    public class VehicleFragment extends Fragment {
        private RecyclerView rvVehicles;
        private VehicleAdapter vehicleAdapter;
        private List<Vehicle> vehicleList;
        private TextView tv_share_code;
        private Button btn_copy_code;
        private Button btnSharedVehicles,btn_add_vehicle;
        private Button btnMyVehicles;

        public VehicleFragment() {
            // Required empty public constructor
        }

        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                                 Bundle savedInstanceState) {
            View view = inflater.inflate(R.layout.fragment_vehicle, container, false);
            rvVehicles = view.findViewById(R.id.rvVehicles);
            rvVehicles.setLayoutManager(new LinearLayoutManager(getContext()));
            tv_share_code = view.findViewById(R.id.tv_share_code);
            btn_copy_code = view.findViewById(R.id.btn_copy_code);
            btnSharedVehicles = view.findViewById(R.id.btnSharedVehicles);
            btnMyVehicles = view.findViewById(R.id.btnMyVehicles);
            btn_add_vehicle = view.findViewById(R.id.btn_add_vehicle);
            btn_add_vehicle.setOnClickListener(v -> {
                AddVehicleDialog.show(getContext(), new AddVehicleDialog.AddVehicleListener() {
                    @Override
                    public void onRegisterMyVehicle() {
                        Intent intent = new Intent(requireContext(), RegisterPhase3Fragment.class);
                        startActivity(intent);
                    }

                    @Override
                    public void onReceiveFromShareCode() {
                        Intent intent = new Intent(requireContext(), ShareVehicleAccessActivity.class);
                        startActivity(intent);
                    }
                });
            });
            VehicleFragmentHandler handler = new VehicleFragmentHandler(requireContext());
            vehicleAdapter = new VehicleAdapter(new ArrayList<>(), handler);
            rvVehicles.setAdapter(vehicleAdapter);


            btn_copy_code.setOnClickListener(v -> {
                String code = tv_share_code.getText().toString();

                ClipboardManager clipboard = (ClipboardManager) requireContext()
                        .getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData clip = ClipData.newPlainText(
                        getString(R.string.copied_code_label),
                        code
                );
                clipboard.setPrimaryClip(clip);

                Toast.makeText(
                        requireContext(),
                        getString(R.string.copied_to_clipboard),
                        Toast.LENGTH_SHORT
                ).show();

            });

            return view;
        }

        @Override
        public void onViewCreated(View view, Bundle savedInstanceState) {
            super.onViewCreated(view, savedInstanceState);
            tv_share_code.setText(getString(R.string.loading_data));
            VehicleApiService vehicleApi = ApiTest.getService(requireContext()).create(VehicleApiService.class);
            // Default: show my vehicles
            vehicleApi.getListVehicles().enqueue(new Callback<List<Vehicle>>() {
                @Override
                public void onResponse(Call<List<Vehicle>> call, Response<List<Vehicle>> response) {
                    if (!isAdded() || getContext() == null) return;
                    if (response.isSuccessful() && response.body() != null) {
                        vehicleList = response.body();
                        RecyclerUtils.updateRecyclerView(rvVehicles, vehicleList);
                    } else {
                        tv_share_code.setText(getString(R.string.error_code, response.code()));
                    }
                }

                @Override
                public void onFailure(Call<List<Vehicle>> call, Throwable t) {
                    if (!isAdded() || getContext() == null) return;
                    tv_share_code.setText(getString(R.string.connection_error, t.getMessage()));
                }
            });
//            DummyData dataSample = new DummyData();
//            RecyclerUtils.updateRecyclerView(rvVehicles, dataSample.getSampleVehicles());

            //btn Myvehicle
            btnMyVehicles.setOnClickListener(v -> {
                updateToggle(true);
                vehicleApi.getListVehicles().enqueue(new Callback<List<Vehicle>>() {
                    @Override
                    public void onResponse(Call<List<Vehicle>> call, Response<List<Vehicle>> response) {
                        if (!isAdded() || getContext() == null) return;
                        if (response.isSuccessful() && response.body() != null) {
                            vehicleList = response.body();
                            RecyclerUtils.updateRecyclerView(rvVehicles, vehicleList);
                        } else {
                            tv_share_code.setText(getString(R.string.error_code, response.code()));
                        }
                    }

                    @Override
                    public void onFailure(Call<List<Vehicle>> call, Throwable t) {
                        if (!isAdded() || getContext() == null) return;
                        tv_share_code.setText(getString(R.string.connection_error, t.getMessage()));
                    }
                });
//                RecyclerUtils.updateRecyclerView(rvVehicles, dataSample.getSampleVehicles());

            });

            //btn shared vehicle
            btnSharedVehicles.setOnClickListener(v -> {
                updateToggle(false);
                vehicleApi.getMySharedVehicles().enqueue(new Callback<List<Vehicle>>() {
                    @Override
                    public void onResponse(Call<List<Vehicle>> call, Response<List<Vehicle>> response) {
                        if (!isAdded() || getContext() == null) return;
                        if (response.isSuccessful() && response.body() != null) {
                            vehicleList = response.body();
                            RecyclerUtils.updateRecyclerView(rvVehicles, vehicleList);
                        } else {
                            tv_share_code.setText(getString(R.string.error_code, response.code()));
                        }
                    }

                    @Override
                    public void onFailure(Call<List<Vehicle>> call, Throwable t) {
                        if (!isAdded() || getContext() == null) return;
                        tv_share_code.setText(getString(R.string.connection_error, t.getMessage()));
                    }
                });
//                RecyclerUtils.updateRecyclerView(rvVehicles, dataSample.getSampleVehicles2());


            });
        }

        private void updateToggle(boolean isMyVehicleSelected) {
            if (isMyVehicleSelected) {
                btnMyVehicles.setBackgroundResource(R.drawable.bg_tab_selected);
                btnMyVehicles.setTextColor(Color.WHITE);
                btnSharedVehicles.setBackgroundResource(R.drawable.bg_tab_unselected);
                btnSharedVehicles.setTextColor(Color.BLACK);
            } else {
                btnSharedVehicles.setBackgroundResource(R.drawable.bg_tab_selected);
                btnSharedVehicles.setTextColor(Color.WHITE);
                btnMyVehicles.setBackgroundResource(R.drawable.bg_tab_unselected);
                btnMyVehicles.setTextColor(Color.BLACK);
            }
        }
    }


