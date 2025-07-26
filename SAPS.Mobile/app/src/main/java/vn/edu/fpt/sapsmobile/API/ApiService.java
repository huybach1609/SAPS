package vn.edu.fpt.sapsmobile.API;
import retrofit2.Call;
import retrofit2.http.GET;
import vn.edu.fpt.sapsmobile.models.NotificationsResponse;

public interface ApiService {
    @GET("notifications")
    Call<NotificationsResponse> getNotifications();
}
