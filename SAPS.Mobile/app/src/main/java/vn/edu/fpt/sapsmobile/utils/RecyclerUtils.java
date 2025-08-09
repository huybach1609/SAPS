package vn.edu.fpt.sapsmobile.utils;

import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class RecyclerUtils  {

    // Generic method: nhận adapter, danh sách mới, và cập nhật
    public static <T> void updateRecyclerView(RecyclerView recyclerView, List<T> newData) {
        RecyclerView.Adapter adapter = recyclerView.getAdapter();

        if (adapter instanceof UpdatableAdapter<?>) {
            ((UpdatableAdapter<T>) adapter).updateData(newData);
        } else {
            throw new IllegalArgumentException("Adapter must implement UpdatableAdapter");
        }
    }

    // Interface bắt buộc adapter phải hỗ trợ cập nhật
    public interface UpdatableAdapter<T> {
        void updateData(List<T> newData);
    }
}
