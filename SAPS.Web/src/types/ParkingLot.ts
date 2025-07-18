export interface ParkingLot {
    id: string;
    name: string;
    description?: string;
    address: string;
    totalParkingSlot: number;
    createdAt: string;
    updatedAt: string;
    status: 'Active' | 'Inactive';
    parkingLotOwnerId: string;
}