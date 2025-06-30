import React, { createContext, useContext, useEffect, useState } from 'react';
import { ParkingLot } from '@/types/ParkingLot';
import { apiUrl } from '@/config/base';

interface ParkingLotContextType {
    parkingLot: ParkingLot | null;
    loading: boolean;
    refresh: () => void;
}

const ParkingLotContext = createContext<ParkingLotContextType | undefined>(undefined);

export const ParkingLotProvider: React.FC<{ children: React.ReactNode, userId: string }> = ({ children, userId }) => {
    const [parkingLot, setParkingLot] = useState<ParkingLot | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchParkingLot = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/ParkingLot/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch parking lot');
            const data = await response.json();
            console.log(data);
            setParkingLot(data);
        } catch (error) {
            setParkingLot(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParkingLot();
    }, [userId]);

    return (
        <ParkingLotContext.Provider value={{ parkingLot, loading, refresh: fetchParkingLot }}>
            {children}
        </ParkingLotContext.Provider>
    );
};

export const useParkingLot = () => {
    const context = useContext(ParkingLotContext);
    if (!context) throw new Error('useParkingLot must be used within a ParkingLotProvider');
    return context;
};