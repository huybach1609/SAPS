import { useEffect, useState } from 'react';
import { User, MapPin, Phone, Mail, Calendar, Badge, Building, Clock, CornerUpLeft } from 'lucide-react';


import {  useParams } from 'react-router-dom';
import DefaultLayout from '@/layouts/default';
import { Link } from '@heroui/link';
import { fetchStaffDetail } from '@/services/parkinglot/staffService';
import { Image } from '@heroui/react';

export interface StaffDetail {
    id: string,
    email: string,
    fullName: string,
    phoneNumber: string,
    createdAt: string,
    status: string,
    googleId: string,
    profileImageUrl: string,
    phone: string,
    updatedAt: string,
    role: string,
    parkingLotId: string,
    staffId: string
}
const StaffDetailScreen = () => {
    const { staffId } = useParams<{ staffId: string; }>();
    const [staffData, setStafData] = useState<StaffDetail | null>(null);

    useEffect(() => {

        const getStaffDetail = async () => {
            if (!staffId) return;
            try {
                const data = await fetchStaffDetail(staffId);
                setStafData(data);
                console.log('Staff details:', data);
            } catch (error) {
                console.error('Error fetching staff details:', error);
            }
        };
        getStaffDetail();

    }, [staffId]);


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
        <DefaultLayout title='Staff Detail' description={`${staffData?.fullName} information`}>
            <Link href='/owner/staff' className='my-5'><CornerUpLeft size={16} /> return to staff list</Link>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <Image
                                src={staffData?.profileImageUrl}
                                alt={staffData?.fullName}
                                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                            />
                            <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor((staffData?.status) ? staffData?.status : "")}`}>
                                {staffData?.status}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{staffData?.fullName}</h1>
                            <div className="flex items-center space-x-4 text-gray-600">
                                <div className="flex items-center space-x-1">
                                    <Badge className="w-4 h-4" />
                                    <span>Staff ID: {staffData?.staffId}</span>
                                </div>
                                {/* <div className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span>User ID: {staffData?.id}</span>
                                </div> */}
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
                                    <p className="text-gray-900 font-medium">{staffData?.phoneNumber || staffData?.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Start Date</p>
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

                    {/* Role Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Badge className="w-5 h-5 mr-2 text-blue-600" />
                            Role Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Role</p>
                                <p className="text-gray-900 font-medium text-lg capitalize">{staffData?.role}</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Building className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Parking Lot ID</p>
                                    <p className="text-gray-900 font-medium">{staffData?.parkingLotId}</p>
                                </div>
                            </div>
                            {staffData?.googleId && (
                                <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 text-gray-400">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Google ID</p>
                                        <p className="text-gray-900 font-medium text-sm">{staffData?.googleId}</p>
                                    </div>
                                </div>
                            )}
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