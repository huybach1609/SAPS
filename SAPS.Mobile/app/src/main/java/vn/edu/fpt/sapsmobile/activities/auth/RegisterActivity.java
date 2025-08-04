package vn.edu.fpt.sapsmobile.activities.auth;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.viewpager2.widget.ViewPager2;

import vn.edu.fpt.sapsmobile.R;
import vn.edu.fpt.sapsmobile.adapters.RegisterPagerAdapter;
import vn.edu.fpt.sapsmobile.models.RegisterData;

public class RegisterActivity extends AppCompatActivity {

    public RegisterData registerData = new RegisterData();
    private ViewPager2 viewPager;
    private RegisterPagerAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register_phases);

        viewPager = findViewById(R.id.view_pager);
        adapter = new RegisterPagerAdapter(this);
        viewPager.setAdapter(adapter);
        viewPager.setUserInputEnabled(false); // Ngăn swipe tay
    }

    public void nextPhase() {
        if (viewPager.getCurrentItem() < 2) {
            viewPager.setCurrentItem(viewPager.getCurrentItem() + 1);
        }
    }

    public void completeRegister() {
        // TODO: Gửi dữ liệu lên backend
        finish();
    }
}
