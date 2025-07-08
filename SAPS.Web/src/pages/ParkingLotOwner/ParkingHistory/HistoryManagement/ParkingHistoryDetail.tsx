import React, { useState, useEffect } from 'react';
import { Car, Camera, CreditCard, Clock, MapPin, User, Calendar } from 'lucide-react';
import { ParkingSession } from '@/services/parkinglot/parkingHistoryService';
import { ParkingSessionStatus } from './ParkingHistory';
import DefaultLayout from '@/layouts/default';
import { Card, CardFooter, CardBody, Button, Image, Modal, ModalContent, ModalBody, ModalFooter, ModalHeader } from '@heroui/react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { apiUrl } from '@/config/base';

export const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(date));
};

export const formatTime = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(new Date(date));
};

interface ModalImageInfoContent {
    imageUrl: string;
    time: string;
    licensePlate: string;
}

interface ModalImageInfoProps extends ModalImageInfoContent {
    isOpen: boolean;
    onClose: () => void;
}

const ParkingHistoryDetail: React.FC = () => {
    const { parkingLotId, sessionId } = useParams<{ parkingLotId: string; sessionId: string }>();
    const [session, setSession] = useState<ParkingSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalImageInfo, setModalImageInfo] = useState<ModalImageInfoContent | null>(null);

    useEffect(() => {
        if (!parkingLotId || !sessionId) {
            setError('Missing parkingLotId or sessionId');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        axios.get(`${apiUrl}/api/ParkingSession/${parkingLotId}/${sessionId}`)
            .then(res => {
                setSession(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch session data');
                setLoading(false);
            });
    }, [parkingLotId, sessionId]);

    if (loading) {
        return <DefaultLayout title="Parking History Detail"><div className="p-8 text-center">Loading...</div></DefaultLayout>;
    }
    if (error || !session) {
        return <DefaultLayout title="Parking History Detail"><div className="p-8 text-center text-red-500">{error || 'Session not found.'}</div></DefaultLayout>;
    }

    const getStatusColor = (status: ParkingSessionStatus) => {
        switch (status) {
            case ParkingSessionStatus.COMPLETED:
                return 'bg-green-100 text-green-800';
            case ParkingSessionStatus.CURRENTLY_PARKED:
                return 'bg-blue-100 text-blue-800';
            case ParkingSessionStatus.PAYMENT_PENDING:
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const subtotal = session.cost / 1.1; // Assuming 10% tax
    const tax = session.cost - subtotal;

    return (
        <DefaultLayout title="Parking History Detail" className="m-4">
            {/* Session Overview */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Car className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-800">Session Overview</h1>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-blue-500 rounded-lg p-3">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {session.vehicle?.licensePlate} ({session.vehicle?.brand} {session.vehicle?.model})
                                </h2>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-gray-600">Session ID: {session.id}</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                                        {session.status === ParkingSessionStatus.CURRENTLY_PARKED ? 'Currently Parked' : session.status === ParkingSessionStatus.COMPLETED ? 'Completed' : 'Payment Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Total Duration: {session.duration}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Session Information */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-6 h-6 text-orange-600" />
                        <h2 className="text-xl font-bold text-gray-800">Session Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Entry Date</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                {formatDateTime(session.entryDateTime)}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Entry Time</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                {formatTime(session.entryDateTime)}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Exit Date</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                {session.exitDateTime ? formatDateTime(session.exitDateTime) : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Exit Time</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                {session.exitDateTime ? formatTime(session.exitDateTime) : 'N/A'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Parking Slot</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                {session.parkingLotId}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Staff Processed</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                Automatic System
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Car className="w-6 h-6 text-red-600" />
                        <h2 className="text-xl font-bold text-gray-800">Vehicle Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
                            <div className="bg-blue-100 rounded-lg p-3 text-blue-800 font-bold">
                                {session.vehicle?.licensePlate}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                2020 {session.vehicle?.brand} {session.vehicle?.model}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                {session.vehicle?.color}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                {session.vehicle?.ownerVehicleFullName}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Camera Captures */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Camera className="w-6 h-6 text-gray-600" />
                        <h2 className="text-xl font-bold text-gray-800">Camera Captures</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                <h3 className="font-semibold text-gray-800">Entry Captures</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">License Plate Recognition</p>
                                    <Card isFooterBlurred className="border-none relative" radius="lg">
                                        <div className="absolute top-2 left-2 bg-blue-500/20 backdrop-blur-md text-xs px-3 py-1 rounded z-20 text-white font-semibold shadow">
                                            Entrance Back Cam 1
                                        </div>
                                        <Button
                                            className="focus:outline-none w-full h-48 md:h-64 block"
                                            onPress={() => setModalImageInfo({
                                                imageUrl: session.entryBackCaptureUrl || '',
                                                time: session.entryDateTime || '',
                                                licensePlate: session.vehicle?.licensePlate || ''
                                            })}
                                            aria-label="View full size entry image"
                                            type="button"
                                            isIconOnly
                                        >
                                            <img
                                                alt={`Entry capture of license plate ${session.vehicle?.licensePlate || ''}`}
                                                className="object-cover w-full  rounded-t-lg"
                                                src={session.entryBackCaptureUrl || ''}
                                            />
                                        </Button>
                                        <CardFooter className="justify-between before:bg-white/40 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                                            <div>
                                                <div className="text-xl font-bold  text-background">{session.vehicle?.licensePlate}</div>
                                                <div className="text-xs text-background">
                                                    {formatDateTime(session.entryDateTime)} {formatTime(session.entryDateTime)}
                                                </div>
                                            </div>
                                            <a
                                                href={session.entryBackCaptureUrl || ''}
                                                target="_blank"
                                                download
                                                className="text-tiny text-white bg-blue-600/40 backdrop-blur-md hover:bg-blue-700 transition px-3 py-1 rounded-lg ml-2 font-medium"
                                                aria-label="Download entry image"
                                            >
                                                Download Image
                                            </a>
                                        </CardFooter>
                                    </Card>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Driver Recognition</p>
                                    <Card isFooterBlurred className="border-none relative" radius="lg">
                                        <div className="absolute top-2 left-2 bg-blue-500/20 backdrop-blur-md text-xs px-3 py-1 rounded z-20 text-white font-semibold shadow">
                                            Entrance Front Cam 1
                                        </div>
                                        <Button
                                            className="focus:outline-none w-full h-48 md:h-64 block"
                                            onPress={() => setModalImageInfo({
                                                imageUrl: session.entryFrontCaptureUrl || '',
                                                time: session.entryDateTime || '',
                                                licensePlate: session.vehicle?.licensePlate || ''
                                            })}
                                            aria-label="View full size entry image"
                                            type="button"
                                            isIconOnly
                                        >
                                            <img
                                                alt={`Entry capture of license plate ${session.vehicle?.licensePlate || ''}`}
                                                className="object-cover w-full  rounded-t-lg"
                                                src={session.entryFrontCaptureUrl || ''}
                                            />
                                        </Button>
                                        <CardFooter className="justify-between before:bg-white/40 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                                            <div>
                                                <div className="text-xs text-background">
                                                    {formatDateTime(session.entryDateTime)} {formatTime(session.entryDateTime)}
                                                </div>
                                            </div>
                                            <a
                                                href={session.entryFrontCaptureUrl || ''}
                                                target="_blank"
                                                download
                                                className="text-tiny text-white bg-blue-600/40 backdrop-blur-md hover:bg-blue-700 transition px-3 py-1 rounded-lg ml-2 font-medium"
                                                aria-label="Download entry image"
                                            >
                                                Download Image
                                            </a>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                <h3 className="font-semibold text-gray-800">Exit Captures</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">License Plate Recognition</p>
                                    <Card isFooterBlurred className="border-none relative" radius="lg">
                                        <div className="absolute top-2 left-2 bg-blue-500/20 backdrop-blur-md text-xs px-3 py-1 rounded z-20 text-white font-semibold shadow">
                                            Exit Back Cam 1
                                        </div>
                                        <Button
                                            className="focus:outline-none w-full h-48 md:h-64 block"
                                            onPress={() => setModalImageInfo({
                                                imageUrl: session.exitBackCaptureUrl || '',
                                                time: session.exitDateTime || '',
                                                licensePlate: session.vehicle?.licensePlate || ''
                                            })}
                                            aria-label="View full size exit image"
                                            type="button"
                                            isIconOnly
                                        >
                                            <img
                                                alt={`Exit capture of license plate ${session.vehicle?.licensePlate || ''}`}
                                                className="object-cover w-full  rounded-t-lg"
                                                src={session.exitBackCaptureUrl || ''}
                                            />
                                        </Button>
                                        <CardFooter className="justify-between before:bg-white/40 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                                            <div>
                                                <div className="text-xl font-bold  text-background">{session.vehicle?.licensePlate}</div>
                                                <div className="text-xs text-background">
                                                    {session.exitDateTime ? `${formatDateTime(session.exitDateTime)} ${formatTime(session.exitDateTime)}` : 'N/A'}
                                                </div>
                                            </div>
                                            <a
                                                href={session.exitBackCaptureUrl || ''}
                                                target="_blank"
                                                download
                                                className="text-tiny text-white bg-blue-600/40 backdrop-blur-md hover:bg-blue-700 transition px-3 py-1 rounded-lg ml-2 font-medium"
                                                aria-label="Download exit image"
                                            >
                                                Download Image
                                            </a>
                                        </CardFooter>
                                    </Card>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Driver Recognition</p>
                                    <Card isFooterBlurred className="border-none relative" radius="lg">
                                        <div className="absolute top-2 left-2 bg-blue-500/20 backdrop-blur-md text-xs px-3 py-1 rounded z-20 text-white font-semibold shadow">
                                            Exit Front Cam 1
                                        </div>
                                        <Button
                                            className="focus:outline-none w-full h-48 md:h-64 block"
                                            onPress={() => setModalImageInfo({
                                                imageUrl: session.exitFrontCaptureUrl || '',
                                                time: session.exitDateTime || '',
                                                licensePlate: session.vehicle?.licensePlate || ''
                                            })}
                                            aria-label="View full size exit image"
                                            type="button"
                                            isIconOnly
                                        >
                                            <img
                                                alt={`Exit capture of license plate ${session.vehicle?.licensePlate || ''}`}
                                                className="object-cover w-full  rounded-t-lg"
                                                src={session.exitFrontCaptureUrl || ''}
                                            />
                                        </Button>
                                        <CardFooter className="justify-between before:bg-white/40 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                                            <div>
                                                <div className="text-xs text-background">
                                                    {session.exitDateTime ? `${formatDateTime(session.exitDateTime)} ${formatTime(session.exitDateTime)}` : 'N/A'}
                                                </div>
                                            </div>
                                            <a
                                                href={session.exitFrontCaptureUrl || ''}
                                                target="_blank"
                                                download
                                                className="text-tiny text-white bg-blue-600/40 backdrop-blur-md hover:bg-blue-700 transition px-3 py-1 rounded-lg ml-2 font-medium"
                                                aria-label="Download exit image"
                                            >
                                                Download Image
                                            </a>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                            <Camera className="w-4 h-4" />
                            <p className="text-sm">
                                <strong>Image Information:</strong> All images are automatically captured by the AI recognition system.
                                Images are stored securely and can be used for verification purposes. Click on any image to view in full size.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <CreditCard className="w-6 h-6 text-yellow-600" />
                        <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hourly Rate</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                $5.00/hour
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Charged</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                2.25 hours
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subtotal</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                ${subtotal.toFixed(2)}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tax (10%)</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                ${tax.toFixed(2)}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                Bank Transfer
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
                            <div className="bg-gray-50 rounded-lg p-3 text-gray-800">
                                {session.transactionId}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModalImageInfo
                imageUrl={modalImageInfo?.imageUrl || ''}
                time={modalImageInfo?.time || ''}
                licensePlate={modalImageInfo?.licensePlate || ''}
                isOpen={!!modalImageInfo}
                onClose={() => setModalImageInfo(null)}
            />
        </DefaultLayout>
    );
};

const ModalImageInfo = ({ imageUrl, time, licensePlate, isOpen, onClose }: ModalImageInfoProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size='4xl'>
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>
                            <h2 className="text-xl font-bold text-gray-800">Image Information</h2>
                        </ModalHeader>
                        <ModalBody>
                            <img
                                src={imageUrl}
                                alt={`Full size capture of license plate ${licensePlate}`}
                                className="rounded-lg  w-full object-contain"
                            />
                        </ModalBody>
                        <ModalFooter>
                            <div className="mt-2 text-gray-700 text-center">
                                <div className="font-semibold">{licensePlate}</div>
                                <div className="text-xs">{time ? `${formatDateTime(time)} ${formatTime(time)}` : ''}</div>
                            </div>

                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export default ParkingHistoryDetail;