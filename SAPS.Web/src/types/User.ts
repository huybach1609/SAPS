export interface User {
  id: string;
  email: string;
  role: 'admin' | 'parkinglotowner';
  fullName: string;
  phone: string;
  address: string;
  profileImageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  staffProfile?: StaffProfile;
  clientProfile?: ClientProfile;
  parkingLotOwnerProfile?: ParkingLotOwnerProfile;
  adminProfile?: AdminProfile;

}
export interface StaffProfile {
  userId: string;
  staffId: string;
  parkingLotId: string;
}

export interface ClientProfile {
  userId: string;
  citizenId: string;
  dateOfBirth: string; // ISO format "YYYY-MM-DD"
  sex: boolean;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  shareCode: string;
}

export interface ParkingLotOwnerProfile {
  userId: string;
  parkingLotOwnerId: string;
}

export interface AdminProfile {
  userId: string;
  adminId: string;
  role: string;
}
