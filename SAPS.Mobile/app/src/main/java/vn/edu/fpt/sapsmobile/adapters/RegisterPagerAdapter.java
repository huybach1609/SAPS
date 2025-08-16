package vn.edu.fpt.sapsmobile.adapters;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import vn.edu.fpt.sapsmobile.fragments.RegisterPhase1Fragment;
import vn.edu.fpt.sapsmobile.fragments.RegisterPhase2Fragment;
import vn.edu.fpt.sapsmobile.activities.auth.RegisterPhase3Activity;

public class RegisterPagerAdapter extends FragmentStateAdapter {

    public RegisterPagerAdapter(@NonNull FragmentActivity fragmentActivity) {
        super(fragmentActivity);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        switch (position) {
            case 0: return new RegisterPhase1Fragment();
            case 1: return new RegisterPhase2Fragment();
            default: return new RegisterPhase1Fragment();
        }
    }

    @Override
    public int getItemCount() {
        return 3;
    }
}
