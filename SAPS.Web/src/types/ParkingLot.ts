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

export interface Subscription {
    id: string;
    name: string;
    duration: number; // in milliseconds
    description: string;
    price: number;
    status: 'active' | 'inactive';
}

export interface ParkingLotSubscription {
    parkingLotId: string;
    subscriptionId: string;
    startedDate: string;

    // extent data
    parkingLot?: ParkingLot;
    subscription?: Subscription;
}
