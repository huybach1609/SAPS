// User details interfaces for user detail page
export interface VehicleInfo {
  licensePlate: string;
  model: string;
  color: string;
  registrationDate: string;
  status: string;
}

export interface SharedVehicle extends VehicleInfo {
  owner: string;
  accessType: string;
}

export interface ParkingActivity {
  date: string;
  location: string;
  vehicle: string;
  duration: string;
  amount: string;
}

export interface UserDetails {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string | null;
  status: "active" | "suspended" | "inactive";
  verificationStatus: string;
  citizenId: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  registrationDate: string;
  lastLogin: string;
  vehicles: VehicleInfo[];
  sharedVehicles?: SharedVehicle[];
  parkingActivity: ParkingActivity[];
  stats: {
    totalParkingSessions: number;
    totalSpent: string;
    avgSessionDuration: string;
  };
}
