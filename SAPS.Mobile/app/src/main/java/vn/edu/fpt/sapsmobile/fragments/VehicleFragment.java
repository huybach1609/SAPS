    package vn.edu.fpt.sapsmobile.fragments;

    import androidx.fragment.app.Fragment;
    import androidx.recyclerview.widget.LinearLayoutManager;
    import androidx.recyclerview.widget.RecyclerView;

    import android.content.ClipData;
    import android.content.ClipboardManager;
    import android.content.Context;
    import android.os.Bundle;
    import android.view.LayoutInflater;
    import android.view.View;
    import android.view.ViewGroup;
    import android.widget.Button;
    import android.widget.TextView;
    import android.widget.Toast;


    import java.util.List;

    import retrofit2.Call;
    import retrofit2.Callback;
    import retrofit2.Response;
    import vn.edu.fpt.sapsmobile.API.ApiTest;
    import vn.edu.fpt.sapsmobile.API.apiinterface.VehicleApiService;
    import vn.edu.fpt.sapsmobile.R;
    import vn.edu.fpt.sapsmobile.actionhandler.VehicleFragmentHandler;
    import vn.edu.fpt.sapsmobile.adapter.VehicleAdapter;
    import vn.edu.fpt.sapsmobile.models.Vehicle;


    public class VehicleFragment extends Fragment {
        private RecyclerView rvVehicles;
        private VehicleAdapter vehicleAdapter;
        private List<Vehicle> vehicleList;
        private TextView tv_share_code;
        private Button btn_copy_code;

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

            btn_copy_code.setOnClickListener(v -> {
                String code = tv_share_code.getText().toString();

                ClipboardManager clipboard = (ClipboardManager) requireContext()
                        .getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData clip = ClipData.newPlainText("Copied Code", code);
                clipboard.setPrimaryClip(clip);

                Toast.makeText(requireContext(), "Đã sao chép mã vào bộ nhớ tạm!", Toast.LENGTH_SHORT).show();
            });

            return view;
        }

        @Override
        public void onViewCreated(View view, Bundle savedInstanceState) {
            super.onViewCreated(view, savedInstanceState);
            tv_share_code.setText("Đang tải dữ liệu...");

            VehicleApiService vehicleApi = ApiTest.getService(requireContext()).create(VehicleApiService.class);
            vehicleApi.getListVehicles().enqueue(new Callback<List<Vehicle>>() {
                @Override
                public void onResponse(Call<List<Vehicle>> call, Response<List<Vehicle>> response) {
                    if (!isAdded() || getContext() == null) return;
                    if (response.isSuccessful() && response.body() != null) {
                        vehicleList = response.body();
                        vehicleAdapter = new VehicleAdapter(vehicleList, new VehicleFragmentHandler(requireContext()));
                        rvVehicles.setAdapter(vehicleAdapter);


                        tv_share_code.setText("ASSX1-adsa-XLM");
                    } else {
                        tv_share_code.setText("Lỗi: " + response.code());
                    }
                }

                @Override
                public void onFailure(Call<List<Vehicle>> call, Throwable t) {
                    if (!isAdded() || getContext() == null) return;
                    tv_share_code.setText("Lỗi kết nối: " + t.getMessage());
                }
            });
        }
    }


