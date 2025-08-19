package vn.edu.fpt.sapsmobile.adapters;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import vn.edu.fpt.sapsmobile.fragments.RegisterFragment;
import vn.edu.fpt.sapsmobile.fragments.RegisterPhase2Fragment;

public class RegisterPagerAdapter extends FragmentStateAdapter {

    public RegisterPagerAdapter(@NonNull FragmentActivity fragmentActivity) {
        super(fragmentActivity);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        switch (position) {
            case 0: return new RegisterFragment();
            case 1: return new RegisterPhase2Fragment();
            default: return new RegisterFragment();
        }
    }

    @Override
    public int getItemCount() {
        return 3;
    }
}
