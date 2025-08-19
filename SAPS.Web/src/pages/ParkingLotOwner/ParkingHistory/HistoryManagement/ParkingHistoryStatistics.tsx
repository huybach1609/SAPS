import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, DollarSign,  Car, Activity } from 'lucide-react';
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

const ParkingHistoryStatistics: React.FC<{ parkingLotId: string }> = ({ parkingLotId }) => {
    const [selectedRange, setSelectedRange] = useState<number>(0);
    const [status, setStatus] = useState<ParkingStatus | null>(null);
    const [statistics, setStatistics] = useState<ParkingStatistics | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Replace with your actual API base URL

    const rangeOptions = [
        { label: 'Today', value: 0 },
        { label: 'This Week', value: 1 },
        { label: 'This Month', value: 2 },
        { label: 'This Year', value: 3 }
    ];

    const fetchParkingData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch status data
            // console.log(`${apiUrl}/ParkingSession/${parkingLotId}/status`);
            const statusResponse = await fetch(`${apiUrl}/api/ParkingSession/${parkingLotId}/status`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!statusResponse.ok) {
                throw new Error(`Status API error: ${statusResponse.status}`);
            }
            const statusData = await statusResponse.json();

            // Fetch statistics data
            // console.log(`${apiUrl}./ParkingSession/${parkingLotId}/statistics?range=${selectedRange}`);
            const statisticsResponse = await fetch(`${apiUrl}/api/ParkingSession/${parkingLotId}/statistics?range=${selectedRange}`);
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
    }, [parkingLotId, selectedRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDuration = (hours: number) => {
        return `${hours.toFixed(1)}h`;
    };

    const formatPercentage = (value: number) => {
        return `${Math.round(value)}%`;
    };

    if (loading) {
        return (
            <div className="pt-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="text-red-600 mr-3">⚠️</div>
                            <div>
                                <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
                                <p className="text-red-600 mt-1">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={fetchParkingData}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            title="Total Sessions Today"
                            value={status?.totalSessionsToday.toString() || '0'}
                            icon={<Car className="w-8 h-8" />}
                        />
                        <StatCard
                            title="Revenue Today"
                            value={formatCurrency(status?.revenueToday || 0)}
                            icon={<DollarSign className="w-8 h-8" />}
                        />
                        <StatCard
                            title="Avg Duration"
                            value={formatDuration(status?.avgDuration || 0)}
                            icon={<Clock className="w-8 h-8" />}
                        />
                        <StatCard
                            title="Occupancy Rate"
                            value={formatPercentage(status?.occupancyRate || 0)}
                            icon={<Activity className="w-8 h-8" />}
                        />
                    </div>
                </div>


                {/* Performance Statistics */}
                
               
                {/* Peak Hours Analysis */}
                <div className="bg-background-100/20 rounded-xl shadow-lg p-4">
                    <div className="flex items-center mb-6">
                        <Clock className="w-6 h-6 text-purple-600 mr-2" />
                        <h2 className=" font-bold">Peak Hours Analysis</h2>
                        {/* <div className="text-xl font-semibold text-gray-900">Peak Hours Analysis</div> */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                            <div className="text-sm font-medium text-purple-700 mb-1">Busiest Hour:</div>
                            <div className="text-xl font-bold text-purple-900">
                                {statistics?.busiestHour || 'N/A'}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                            <div className="text-sm font-medium text-green-700 mb-1">Quietest Hour:</div>
                            <div className="text-xl font-bold text-green-900">
                                {statistics?.quietestHour || 'N/A'}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                            <div className="text-sm font-medium text-orange-700 mb-1">Peak Occupancy:</div>
                            <div className="text-xl font-bold text-orange-900">
                                {statistics?.peakOccupancy
                                    ? `${statistics.peakOccupancy.slots}/${statistics.peakOccupancy.total} slots (${statistics.peakOccupancy.percentage.toFixed(1)}%)`
                                    : 'N/A'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParkingHistoryStatistics;