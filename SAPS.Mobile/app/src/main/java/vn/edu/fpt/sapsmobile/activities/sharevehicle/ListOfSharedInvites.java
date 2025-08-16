package vn.edu.fpt.sapsmobile.activities.sharevehicle;

import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.actionhandler.SharedInvitesHandler;
import vn.edu.fpt.sapsmobile.adapter.SharedInvitationAdapter;
import vn.edu.fpt.sapsmobile.models.SharedInvitation;

public class ListOfSharedInvites extends AppCompatActivity {

    private RecyclerView rvSharedInvites;
    private SharedInvitationAdapter adapter;
    private List<SharedInvitation> invitationList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_list_of_shared_invites);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // Ánh xạ RecyclerView
        rvSharedInvites = findViewById(R.id.rvSharedInvites);
        rvSharedInvites.setLayoutManager(new LinearLayoutManager(this));

        // Tạo dữ liệu mẫu
        invitationList = new ArrayList<>();
        invitationList.add(new SharedInvitation("John Doe", "2025-08-16", "2021-05-10"));
        invitationList.add(new SharedInvitation("Jane Smith", "2025-08-15", "2020-11-01"));
        invitationList.add(new SharedInvitation("David Brown", "2025-08-14", "2019-07-22"));

        // Khởi tạo Adapter
        adapter = new SharedInvitationAdapter(invitationList, new SharedInvitesHandler(this));
        rvSharedInvites.setAdapter(adapter);
    }
}
