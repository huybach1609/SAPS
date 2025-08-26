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
    expiredAt?: string;
    isExpired?: boolean;
    settings?: string;
}

export interface Subscription {
    id: string;
    name: string;
    duration: number; // in milliseconds
    price: number;
    status: 'Active' | 'Inactive';
    updatedBy: string;
    description?: string;
}

export interface ParkingLotSubscription {
    parkingLotId: string;
    subscriptionId: string;
    startedDate: string;

    // extent data
    parkingLot?: ParkingLot;
    subscription?: Subscription;
}

export interface PayOsResponse {
    
    code: string;
    desc: string;
    data: {
        bin: string;
        accountNumber: string;
        accountName: string;
        amount: number;
        description: string;
        orderCode: number;
        currency: string;
        paymentLinkId: string;
        status: string;
        checkoutUrl: string;
        qrCode: string;
        expiredAt?: number;
    };
    signature: string;
    // Keep subscription data for backward compatibility
    subscription?: Subscription;
}

export interface PaymentResponse {
    code: string;
    desc: string;
    data: {
        bin: string;
        accountNumber: string;
        accountName: string;
        amount: number;
        description: string;
        orderCode: number;
        currency: string;
        paymentLinkId: string;
        status: string;
        checkoutUrl: string;
        qrCode: string;
        expiredAt: number;
    };
    signature: string;
}