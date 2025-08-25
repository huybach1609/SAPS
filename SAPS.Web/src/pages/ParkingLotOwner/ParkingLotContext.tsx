import React, { createContext, useContext, useEffect, useState } from 'react';
import { ParkingLot } from '@/types/ParkingLot';
import { parkingLotInfoService } from '@/services/parkinglot/parkingLotInfoService';

interface ParkingLotContextType {
    parkingLots: ParkingLot[];
    selectedParkingLot: ParkingLot | null;
    selectedParkingLotId: string | null;
    selectedParkingLotData: ParkingLot | null;
    loading: boolean;
    setSelectedParkingLotId: (id: string) => void;
    refresh: () => void;
}

const ParkingLotContext = createContext<ParkingLotContextType | undefined>(undefined);

export const ParkingLotProvider: React.FC<{ children: React.ReactNode, userId: string }> = ({ children, userId }) => {
    const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
    const [selectedParkingLotId, setSelectedParkingLotId] = useState<string | null>(() => {
        // Initialize from localStorage
        const saved = localStorage.getItem('selectedParkingLotId');
        return saved || null;
    });
    const [selectedParkingLotData, setSelectedParkingLotData] = useState<ParkingLot | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchParkingLots = async () => {
        setLoading(true);
        try {
            const data = await parkingLotInfoService.fetchParkingLots(userId);
            setParkingLots(data);
            
            // If no parking lot is selected and we have parking lots, select the first one
            if (!selectedParkingLotId && data.length > 0) {
                setSelectedParkingLotId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching parking lots:', error);
            setParkingLots([]);
        } finally {
            setLoading(false);
        }
    };

    // // Fetch detailed parking lot data when selectedParkingLotId changes
    // useEffect(() => {
    //     const fetchSelectedParkingLotData = async () => {
    //         if (selectedParkingLotId) {
    //             try {
    //                 const parkingLotData = await parkingLotInfoService.fetchParkingLotById(selectedParkingLotId);
    //                 setSelectedParkingLotData(parkingLotData);
    //             } catch (error) {
    //                 console.error('Error fetching selected parking lot data:', error);
    //                 setSelectedParkingLotData(null);
    //             }
    //         } else {
    //             setSelectedParkingLotData(null);
    //         }
    //     };

    //     fetchSelectedParkingLotData();
    // }, [selectedParkingLotId]);

    // Save selected parking lot ID to localStorage whenever it changes
    useEffect(() => {
        if (selectedParkingLotId) {
            localStorage.setItem('selectedParkingLotId', selectedParkingLotId);
        } else {
            localStorage.removeItem('selectedParkingLotId');
        }
    }, [selectedParkingLotId]);

    useEffect(() => {
        fetchParkingLots();
    }, [userId]);

    const selectedParkingLot = parkingLots.find(lot => lot.id === selectedParkingLotId) || null;

    const handleSetSelectedParkingLotId = (id: string) => {
        setSelectedParkingLotId(id);
    };

    return (
        <ParkingLotContext.Provider value={{ 
            parkingLots, 
            selectedParkingLot, 
            selectedParkingLotId,
            selectedParkingLotData,
            loading, 
            setSelectedParkingLotId: handleSetSelectedParkingLotId,
            refresh: fetchParkingLots 
        }}>
            {children}
        </ParkingLotContext.Provider>
    );
};

export const useParkingLot = () => {
    const context = useContext(ParkingLotContext);
    if (!context) throw new Error('useParkingLot must be used within a ParkingLotProvider');
    return context;
};