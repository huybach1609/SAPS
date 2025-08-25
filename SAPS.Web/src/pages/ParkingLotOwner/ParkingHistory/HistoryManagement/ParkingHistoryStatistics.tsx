import React, { useState, useEffect } from 'react';
import { Clock, DollarSign,  Car, Activity } from 'lucide-react';
import { apiUrl } from '@/config/base';

// Types for the API responses
interface ParkingStatus {
    totalSessionsToday: number;
    revenueToday: number;
    avgDuration: number;
    occupancyRate: number;
}

interface ParkingStatistics {
    totalParkingSessions: number;
    totalRevenue: number;
    uniqueVehicles: number;
    averageSessionTime: number;
    busiestHour: string;
    quietestHour: string;
    peakOccupancy: {
        slots: number;
        total: number;
        percentage: number;
    };
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, className = '' }) => (
    <div className={`bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl p-4 text-white shadow-lg ${className}`}>
        <div className="flex items-center justify-between">
            <div>
                <div className="text-3xl font-bold mb-1">{value}</div>
                <div className="text-cyan-100 text-sm opacity-90">{title}</div>
            </div>
            <div className="opacity-80">{icon}</div>
        </div>
    </div>
);

// Helper function to get client ID from JWT token
export const getClientId = (): string => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('No access token found');
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    } catch (error) {
        console.error('Error parsing JWT token:', error);
        throw new Error('Invalid token format');
    }
};

const ParkingHistoryStatistics: React.FC = () => {
    const [selectedRange] = useState<number>(0);
    const [status, setStatus] = useState<ParkingStatus | null>(null);
    const [statistics, setStatistics] = useState<ParkingStatistics | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchParkingData = async () => {
        setLoading(true);
        setError(null);

        try {
            const clientId = getClientId();
            
            // Fetch status data
            const statusResponse = await fetch(`${apiUrl}/api/parkingsession/status/owned/${clientId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            if (!statusResponse.ok) {
                throw new Error(`Status API error: ${statusResponse.status}`);
            }
            const statusData = await statusResponse.json();

            // Fetch statistics data
            const statisticsResponse = await fetch(`${apiUrl}/api/parkingsession/statistics/owned/${clientId}?range=${selectedRange}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            if (!statisticsResponse.ok) {
                throw new Error(`Statistics API error: ${statisticsResponse.status}`);
            }
            const statisticsData = await statisticsResponse.json();

            setStatus(statusData);
            setStatistics(statisticsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching parking data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParkingData();
    }, [selectedRange]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl p-4 text-white shadow-lg animate-pulse">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="h-8 bg-white/20 rounded mb-2"></div>
                                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                            </div>
                            <div className="w-8 h-8 bg-white/20 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Error loading statistics
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
                title="Total Sessions"
                value={statistics?.totalParkingSessions?.toString() || '0'}
                icon={<Car className="w-6 h-6" />}
            />
            <StatCard
                title="Total Revenue"
                value={`${statistics?.totalRevenue?.toLocaleString() || '0'} đ`}
                icon={<DollarSign className="w-6 h-6" />}
            />
            <StatCard
                title="Unique Vehicles"
                value={statistics?.uniqueVehicles?.toString() || '0'}
                icon={<Activity className="w-6 h-6" />}
            />
            <StatCard
                title="Avg Session Time"
                value={`${Math.round(statistics?.averageSessionTime || 0)} min`}
                icon={<Clock className="w-6 h-6" />}
            />
        </div>
    );
};

export default ParkingHistoryStatistics;