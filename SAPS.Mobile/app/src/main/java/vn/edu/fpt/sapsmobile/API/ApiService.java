package vn.edu.fpt.sapsmobile.API;
import okhttp3.MultipartBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Multipart;
import retrofit2.http.POST;
import retrofit2.http.Part;
import vn.edu.fpt.sapsmobile.models.IdCardResponse;
import vn.edu.fpt.sapsmobile.models.NotificationsResponse;

public interface ApiService {
    @GET("notifications")
    Call<NotificationsResponse> getNotifications();
    @Multipart
    @POST("api/Ocr/getInfoIdCard")
    Call<IdCardResponse> getInfoIdCard(
            @Part MultipartBody.Part front,
            @Part MultipartBody.Part back
    );
}
