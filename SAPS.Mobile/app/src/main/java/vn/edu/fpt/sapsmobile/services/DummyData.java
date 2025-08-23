package vn.edu.fpt.sapsmobile.services;

import java.util.ArrayList;
import java.util.List;

import vn.edu.fpt.sapsmobile.models.ParkingSession;
import vn.edu.fpt.sapsmobile.models.Vehicle;

public class DummyData {
    public static List<Vehicle> getSampleVehicles() {
        List<Vehicle> list = new ArrayList<>();

        Vehicle v1 = new Vehicle();
        v1.setId("1");
        v1.setLicensePlate("30A-12345");
        v1.setBrand("Toyota");
        v1.setModel("Vios");
        v1.setEngineNumber("ENG123456");
        v1.setChassisNumber("CHS123456");
        v1.setColor("Đen");
        v1.setOwnerVehicleFullName("Nguyễn Văn A");
        v1.setCertificateTitle("Chính chủ");
        v1.setStatus("Đang hoạt động");
        v1.setSharingStatus("Chưa chia sẻ");
        v1.setCreatedAt("2023-01-01T10:00:00");
        v1.setUpdatedAt("2023-06-01T10:00:00");
        v1.setOwnerId("owner_001");

        Vehicle v2 = new Vehicle();
        v2.setId("2");
        v2.setLicensePlate("29B-54321");
        v2.setBrand("Honda");
        v2.setModel("Civic");
        v2.setEngineNumber("ENG654321");
        v2.setChassisNumber("CHS654321");
        v2.setColor("Trắng");
        v2.setOwnerVehicleFullName("Trần Thị B");
        v2.setCertificateTitle("Công ty TNHH XYZ");
        v2.setStatus("Đang bảo trì");
        v2.setSharingStatus("Đã chia sẻ");
        v2.setCreatedAt("2022-03-15T09:00:00");
        v2.setUpdatedAt("2024-02-10T14:20:00");
        v2.setOwnerId("owner_002");

        Vehicle v3 = new Vehicle();
        v3.setId("3");
        v3.setLicensePlate("36C-98765");
        v3.setBrand("Ford");
        v3.setModel("Everest");
        v3.setEngineNumber("ENG999999");
        v3.setChassisNumber("CHS999999");
        v3.setColor("Bạc");
        v3.setOwnerVehicleFullName("Lê Văn C");
        v3.setCertificateTitle("Giấy ủy quyền");
        v3.setStatus("Không hoạt động");
        v3.setSharingStatus("Chưa chia sẻ");
        v3.setCreatedAt("2021-07-07T07:07:07");
        v3.setUpdatedAt("2023-08-08T08:08:08");
        v3.setOwnerId("owner_003");

        list.add(v1);
        list.add(v2);
        list.add(v3);

        return list;
    }
    public static List<Vehicle> getSampleVehicles2() {
        List<Vehicle> list = new ArrayList<>();

        list.add(new Vehicle("101", "51F-123.45", "Hyundai", "Accent", "ENG001", "CHS001", "Đỏ", "Phạm Minh Dương", "Chính chủ", "Đang hoạt động", "Chưa chia sẻ", "2021-05-01T08:30:00", "2023-10-01T10:00:00", "owner_101"));
        list.add(new Vehicle("102", "29A-888.88", "VinFast", "Lux A2.0", "ENG002", "CHS002", "Xám", "Ngô Thị Thanh", "Công ty TNHH ABC", "Đang sửa chữa", "Đã chia sẻ", "2020-08-20T15:45:00", "2024-01-10T12:15:00", "owner_102"));
        list.add(new Vehicle("103", "43C-456.78", "Kia", "Morning", "ENG003", "CHS003", "Vàng", "Hoàng Văn Khoa", "Giấy uỷ quyền", "Ngừng sử dụng", "Không chia sẻ", "2019-12-01T06:00:00", "2022-03-15T09:00:00", "owner_103"));
        list.add(new Vehicle("104", "60B-678.90", "Mazda", "CX-5", "ENG004", "CHS004", "Xanh dương", "Trịnh Hữu Tài", "Chính chủ", "Đang hoạt động", "Đã chia sẻ", "2023-04-12T11:11:11", "2025-01-01T00:00:00", "owner_104"));
        list.add(new Vehicle("105", "30E-999.99", "Toyota", "Vios", "ENG005", "CHS005", "Trắng", "Lê Thị Hoa", "Chính chủ", "Đang hoạt động", "Chưa chia sẻ", "2022-01-01T10:00:00", "2023-05-01T12:00:00", "owner_105"));
        list.add(new Vehicle("106", "59C-456.78", "Ford", "Ranger", "ENG006", "CHS006", "Đen", "Nguyễn Minh Trí", "Chính chủ", "Ngừng sử dụng", "Không chia sẻ", "2021-07-07T07:07:07", "2023-08-08T08:08:08", "owner_106"));
        list.add(new Vehicle("107", "72A-123.12", "Mitsubishi", "Xpander", "ENG007", "CHS007", "Bạc", "Trần Văn Bình", "Giấy uỷ quyền", "Đang hoạt động", "Đã chia sẻ", "2022-02-02T02:02:02", "2024-06-06T06:06:06", "owner_107"));
        list.add(new Vehicle("108", "92D-789.00", "Suzuki", "Ciaz", "ENG008", "CHS008", "Xanh lá", "Đặng Thị Mai", "Công ty TNHH XYZ", "Đang sửa chữa", "Chưa chia sẻ", "2020-09-09T09:09:09", "2023-12-12T12:12:12", "owner_108"));
        list.add(new Vehicle("109", "74B-321.11", "Nissan", "Sunny", "ENG009", "CHS009", "Cam", "Phan Quốc Bảo", "Chính chủ", "Đang hoạt động", "Không chia sẻ", "2018-03-03T03:03:03", "2022-11-11T11:11:11", "owner_109"));
        list.add(new Vehicle("110", "79C-654.32", "Chevrolet", "Spark", "ENG010", "CHS010", "Hồng", "Võ Hữu Nghĩa", "Giấy uỷ quyền", "Ngừng sử dụng", "Đã chia sẻ", "2019-06-06T06:06:06", "2021-07-07T07:07:07", "owner_110"));

        return list;
    }
    public static List<ParkingSession> getParkingSession30days() {
        List<ParkingSession> list = new ArrayList<>();

        // Mẫu 1 - đã checkout
        ParkingSession session1 = new ParkingSession(
                "PS123456",
                "8f4b1c2a-1234-4567-890a-bcdef0123456",
                "pl-1234-5678-90ab-cdef",
                "2025-07-03T14:30:00",
                "2025-07-04T17:19:05",
                "2025-07-04T17:20:00",
                "https://example.com/images/entry_front.jpg",
                "https://example.com/images/entry_back.jpg",
                "https://example.com/images/exit_front.jpg",
                "https://example.com/images/exit_back.jpg",
                "TXN987654",
                "Credit Card",
                12.38
        );

        // Mẫu 2 - chưa checkout
        ParkingSession session2 = new ParkingSession(
                "PS123457",
                "8f4b1c2a-1234-4567-890a-bcdef0123456",
                "pl-1234-5678-90ab-cdef",
                "2025-07-04T08:00:00",
                null,
                null,
                "https://example.com/images/entry_front_2.jpg",
                "https://example.com/images/entry_back_2.jpg",
                null,
                null,
                null,
                "Cash",
                0.0
        );

        // Thêm xen kẽ các bản sao (đúng như JSON bạn gửi)
        list.add(session1);
        list.add(session2);
        list.add(session1);
        list.add(session2);
        list.add(session1);
        list.add(session2);

        return list;
    }

    public static List<ParkingSession> getParkingSession3Months() {
        List<ParkingSession> list = new ArrayList<>();

        list.add(new ParkingSession(
                "PS123456",
                "8f4b1c2a-1234-4567-890a-bcdef0123456",
                "pl-1234-5678-90ab-cdef",
                "2025-07-03T14:30:00",
                "2025-07-04T17:19:05",
                "2025-07-04T17:20:00",
                "https://example.com/images/entry_front.jpg",
                "https://example.com/images/entry_back.jpg",
                "https://example.com/images/exit_front.jpg",
                "https://example.com/images/exit_back.jpg",
                "TXN987654",
                "Credit Card",
                12.38
        ));

        list.add(new ParkingSession(
                "PS123457",
                "8f4b1c2a-1234-4567-890a-bcdef0123456",
                "pl-1234-5678-90ab-cdef",
                "2025-07-04T08:00:00",
                null,
                null,
                "https://example.com/images/entry_front_2.jpg",
                "https://example.com/images/entry_back_2.jpg",
                null,
                null,
                null,
                "Cash",
                0.0
        ));

        // Bạn có thể thêm thủ công các phần tử lặp lại giống như mẫu trên
        // hoặc dùng vòng lặp để nhân bản 1 vài phiên bản giống nhau

        for (int i = 0; i < 10; i++) {
            list.add(new ParkingSession(
                    "PS123456",
                    "8f4b1c2a-1234-4567-890a-bcdef0123456",
                    "pl-1234-5678-90ab-cdef",
                    "2025-07-03T14:30:00",
                    "2025-07-04T17:19:05",
                    "2025-07-04T17:20:00",
                    "https://example.com/images/entry_front.jpg",
                    "https://example.com/images/entry_back.jpg",
                    "https://example.com/images/exit_front.jpg",
                    "https://example.com/images/exit_back.jpg",
                    "TXN987654",
                    "Credit Card",
                    12.38
            ));
        }

        for (int i = 0; i < 5; i++) {
            list.add(new ParkingSession(
                    "PS123457",
                    "8f4b1c2a-1234-4567-890a-bcdef0123456",
                    "pl-1234-5678-90ab-cdef",
                    "2025-07-04T08:00:00",
                    null,
                    null,
                    "https://example.com/images/entry_front_2.jpg",
                    "https://example.com/images/entry_back_2.jpg",
                    null,
                    null,
                    null,
                    "Cash",
                    0.0
            ));
        }

        return list;
    }
    public static ParkingSession GetNewestParkingSession() {
        return new ParkingSession(
                "PS123456",
                "8f4b1c2a-1234-4567-890a-bcdef0123456",
                "pl-1234-5678-90ab-cdef",
                "2025-07-03T14:30:00",
                "2025-07-04T17:19:05",
                "2025-07-04T17:20:00",
                "https://example.com/images/entry_front.jpg",
                "https://example.com/images/entry_back.jpg",
                "https://example.com/images/exit_front.jpg",
                "https://example.com/images/exit_back.jpg",
                "TXN987654",
                "Credit Card",
                12.38
        );

    }

}
