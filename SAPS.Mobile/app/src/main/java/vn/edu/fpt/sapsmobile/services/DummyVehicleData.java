package vn.edu.fpt.sapsmobile.services;

import java.util.ArrayList;
import java.util.List;

import vn.edu.fpt.sapsmobile.models.Vehicle;

public class DummyVehicleData {
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

        Vehicle v1 = new Vehicle();
        v1.setId("101");
        v1.setLicensePlate("51F-123.45");
        v1.setBrand("Hyundai");
        v1.setModel("Accent");
        v1.setEngineNumber("ENG001");
        v1.setChassisNumber("CHS001");
        v1.setColor("Đỏ");
        v1.setOwnerVehicleFullName("Phạm Minh Dương");
        v1.setCertificateTitle("Chính chủ");
        v1.setStatus("Đang hoạt động");
        v1.setSharingStatus("Chưa chia sẻ");
        v1.setCreatedAt("2021-05-01T08:30:00");
        v1.setUpdatedAt("2023-10-01T10:00:00");
        v1.setOwnerId("owner_101");

        Vehicle v2 = new Vehicle();
        v2.setId("102");
        v2.setLicensePlate("29A-888.88");
        v2.setBrand("VinFast");
        v2.setModel("Lux A2.0");
        v2.setEngineNumber("ENG002");
        v2.setChassisNumber("CHS002");
        v2.setColor("Xám");
        v2.setOwnerVehicleFullName("Ngô Thị Thanh");
        v2.setCertificateTitle("Công ty TNHH ABC");
        v2.setStatus("Đang sửa chữa");
        v2.setSharingStatus("Đã chia sẻ");
        v2.setCreatedAt("2020-08-20T15:45:00");
        v2.setUpdatedAt("2024-01-10T12:15:00");
        v2.setOwnerId("owner_102");

        Vehicle v3 = new Vehicle();
        v3.setId("103");
        v3.setLicensePlate("43C-456.78");
        v3.setBrand("Kia");
        v3.setModel("Morning");
        v3.setEngineNumber("ENG003");
        v3.setChassisNumber("CHS003");
        v3.setColor("Vàng");
        v3.setOwnerVehicleFullName("Hoàng Văn Khoa");
        v3.setCertificateTitle("Giấy uỷ quyền");
        v3.setStatus("Ngừng sử dụng");
        v3.setSharingStatus("Không chia sẻ");
        v3.setCreatedAt("2019-12-01T06:00:00");
        v3.setUpdatedAt("2022-03-15T09:00:00");
        v3.setOwnerId("owner_103");

        Vehicle v4 = new Vehicle();
        v4.setId("104");
        v4.setLicensePlate("60B-678.90");
        v4.setBrand("Mazda");
        v4.setModel("CX-5");
        v4.setEngineNumber("ENG004");
        v4.setChassisNumber("CHS004");
        v4.setColor("Xanh dương");
        v4.setOwnerVehicleFullName("Trịnh Hữu Tài");
        v4.setCertificateTitle("Chính chủ");
        v4.setStatus("Đang hoạt động");
        v4.setSharingStatus("Đã chia sẻ");
        v4.setCreatedAt("2023-04-12T11:11:11");
        v4.setUpdatedAt("2025-01-01T00:00:00");
        v4.setOwnerId("owner_104");

        list.add(v1);
        list.add(v2);
        list.add(v3);
        list.add(v4);

        return list;
    }

}
