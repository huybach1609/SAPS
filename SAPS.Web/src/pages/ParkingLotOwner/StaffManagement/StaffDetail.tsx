import React, { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail, Calendar, Badge, Building, Clock, CornerUpLeft } from 'lucide-react';


import { useNavigate, useParams } from 'react-router-dom';
import DefaultLayout from '@/layouts/default';
import { Link } from '@heroui/link';
import axios from 'axios';
import { apiUrl } from '@/config/base';

export interface StaffDetail {
    userId: string,
    fullName: string,
    email: string,
    phone: string,
    profileImageUrl: string,
    userStatus: string,
    createdAt: string,
    updatedAt: string,
    staffId: string,
    parkingLotId: string,
    parkingLotName: string,
    parkingLotAddress: string,
    parkingLotStatus: string
}
const StaffDetailScreen = () => {
    const { parkingLotId, staffId } = useParams<{ parkingLotId: string; staffId: string; }>();
    // const [staffData] = useState({
    //     userId: "1123",
    //     fullName: "John Smith",
    //     email: "john.smith@parkingco.com",
    //     phone: "+1 (555) 123-4567",
    //     profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    //     userStatus: "Active",
    //     createdAt: "2023-01-15T08:30:00Z",
    //     updatedAt: "2024-06-20T14:22:00Z",
    //     staffId: "ST-001",
    //     parkingLotId: "123",
    //     parkingLotName: "Downtown Central Parking",
    //     parkingLotAddress: "123 Main Street, Downtown, City 12345",
    //     parkingLotStatus: "Operational"
    // });    // Sample data based on your SQL query structure

    const [staffData, setStafData] = useState<StaffDetail | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStaffDetail = async () => {
            if (!staffId || !parkingLotId) return;

            try {
                const response = await axios.get(`${apiUrl}/api/staff/${parkingLotId}/${staffId}`);

                setStafData(response.data);
                // Handle the fetched data here
                console.log('Staff details:', response.data);

            } catch (error) {
                console.error('Error fetching staff details:', error);
            }
        };

        fetchStaffDetail();

    }, [staffId, parkingLotId]);


    const formatDate = (dateString: string | null) => {
        if (dateString) {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return "empty"

    };


    const getStatusColor = (status: string | null) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'operational':
                return 'bg-green-100 text-green-800';
            case 'inactive':
            case 'maintenance':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DefaultLayout role="parkinglotowner">
            <Link href='/owner/staff' className='my-5'><CornerUpLeft size={16} /> return to staff list</Link>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <img
                                src={staffData?.profileImageUrl}
                                alt={staffData?.fullName}
                                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                            />
                            <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor((staffData?.userStatus) ? staffData?.userStatus : "")}`}>
                                {staffData?.userStatus}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{staffData?.fullName}</h1>
                            <div className="flex items-center space-x-4 text-gray-600">
                                <div className="flex items-center space-x-1">
                                    <Badge className="w-4 h-4" />
                                    <span>Staff ID: {staffData?.staffId}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span>User ID: {staffData?.userId}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-600" />
                            Personal Information
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-900 font-medium">{staffData?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-gray-900 font-medium">{staffData?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Created At</p>
                                    <p className="text-gray-900 font-medium">{formatDate((staffData?.createdAt) ? staffData?.createdAt : "")}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Updated At</p>
                                    <p className="text-gray-900 font-medium">{formatDate((staffData?.updatedAt) ? staffData?.updatedAt : "")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parking Lot Assignment */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Building className="w-5 h-5 mr-2 text-blue-600" />
                            Parking Lot Assignment
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Parking Lot Name</p>
                                <p className="text-gray-900 font-medium text-lg">{staffData?.parkingLotName}</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="text-gray-900 font-medium">{staffData?.parkingLotAddress}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Parking Lot ID</p>
                                    <p className="text-gray-900 font-medium">{staffData?.parkingLotId}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor((staffData?.parkingLotStatus) ? staffData?.parkingLotAddress : "")}`}>
                                    {staffData?.parkingLotStatus}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {/* <div className="mt-6 flex space-x-4">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Edit Staff
                    </button>
                    <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                        View Schedule
                    </button>
                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
                        Send Message
                    </button>
                </div> */}
            </div>
        </DefaultLayout>
    );
};

export default StaffDetailScreen;