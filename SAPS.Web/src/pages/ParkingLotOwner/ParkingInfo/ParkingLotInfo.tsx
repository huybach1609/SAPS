import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Calendar, Phone, Mail, Edit, Save } from 'lucide-react';
import DefaultLayout from '@/layouts/default';
import { ParkingLot } from '@/types/ParkingLot';
import { useAuth } from '@/services/auth/AuthContext';
import { useParkingLot } from '../ParkingLotContext';
import { Button } from '@heroui/button';
import { addToast, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress, Spinner, Tab, Tabs, useDisclosure, user } from '@heroui/react';
import axios from 'axios';
import { apiUrl } from '@/config/base';
import ParkingLotPayment from './ParkingLotPayment';
import { User } from '@/types/User';
import { formatDate } from '@/components/utils/stringUtils';
import SubscriptionInfo from './SubscriptionInfo';


const ParkingLotInfoContainer: React.FC = () => {
    const [editFormData, setEditFormData] = useState<Partial<ParkingLot>>({});
    const [useWhitelist, setUseWhitelist] = useState(false);

    const { selectedParkingLot, parkingLots, loading, refresh } = useParkingLot();
    const { user } = useAuth();

    console.log(user);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleEditClick = () => {
        setEditFormData({
            name: selectedParkingLot?.name || '',
            description: selectedParkingLot?.description || '',
            totalParkingSlot: selectedParkingLot?.totalParkingSlot || 0
        });

        onOpen();

        // setIsEditModalOpen(true);
    };

    const handleSaveChanges = async () => {
        try {
            const response = await axios.put(
                `${apiUrl}/api/ParkingLot/${user?.id}/${selectedParkingLot?.id}`,
                editFormData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.status === 200) {
                console.log('Parking lot updated successfully:', response.data);
                addToast({
                    title: "Success",
                    description: "update information successfully",
                    color: "success"
                })
                refresh();
            }
        } catch (error) {
            console.error('Error updating parking lot:', error);

            // Handle error appropriately (show toast notification, etc.)
        }
        console.log('Saving changes:', editFormData);
        onClose();
        // Optionally call refresh() from context

    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                {/* <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div> */}
                <Spinner />
            </div>
        );
    }

    if (!selectedParkingLot) {
        return (
            <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-background-900">No parking lot found</h3>
                <p className="mt-1 text-sm text-background-500">Get started by creating a new parking lot.</p>
            </div>
        );
    }

    return (
        <div>
            {/* System Information Section */}
            <div className=" rounded-lg shadow-md m-2  shadow-background-200/30">
                <div className="p-6">

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-muted rounded-lg">
                                <Building2 className="h-6 w-6 " />
                            </div>
                            <h2 className="text-xl font-semibold ">System Information</h2>
                        </div>
                        <Button
                            onPress={handleEditClick}
                            startContent={<Edit className="h-4 w-4" />}
                            className="flex items-center space-x-2 px-4
                             py-2 
                              rounded-lg hover:bg-background-800 transition-colors bg-background-900 text-background-50"
                        >
                            <span>Edit</span>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-foreground mb-2">Parking Lot Address</h3>
                            <div className="bg-background-50 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-5 w-5  mt-0.5" />
                                    <div>
                                        <p className="">{selectedParkingLot.address}</p>
                                        <p className="text-sm text-background-900/50 mt-1">Cannot be modified - Contact support to update</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium  mb-2">Created Date</h3>
                            <div className="bg-background-50 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="h-5 w-5 " />
                                    <div>
                                        <p className="">{formatDate(selectedParkingLot.createdAt)}</p>
                                        <p className="text-sm text-background-900/50 mt-1">Registration date in SAPLS system</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Owner Information */}
                    <div className="mt-8">
                        <h3 className="text-lg font-medium  mb-4">Owner Information</h3>
                        <div className=" bg-background-50 rounded-lg p-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-background-900 rounded-full p-3">
                                    <Building2 className="h-6 w-6 text-background" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-background-900">{user?.fullName}</h4>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-background-950" />
                                            <span className="text-background-950">{user?.email}</span>
                                        </div>
                                        {user?.phone && (
                                            <div className="flex items-center space-x-2">
                                                <Phone className="h-4 w-4 text-background-950" />
                                                <span className="text-background-950">{user.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm  mt-3 text-background-900/50">Owner details cannot be modified</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Subscription information section */}
            <SubscriptionInfo selectedParkingLot={selectedParkingLot} user={user as User} parkingLots={parkingLots} />

            {/* Edit Modal with HeroUI */}
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    onClose();
                }}
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Edit className="h-6 w-6 text-blue-600" />
                                </div>
                                <span className="text-xl font-semibold text-gray-900">Basic Information</span>
                            </ModalHeader>

                            <ModalBody className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parking Lot Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.name || ''}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter parking lot name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={editFormData.description || ''}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Parking Slots
                                    </label>
                                    <input
                                        type="number"
                                        value={editFormData.totalParkingSlot || 0}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, totalParkingSlot: parseInt(e.target.value) || 0 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter total parking slots"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="useWhitelist"
                                            checked={useWhitelist}
                                            onChange={(e) => setUseWhitelist(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div>
                                            <label htmlFor="useWhitelist" className="text-sm font-medium text-gray-900">
                                                Use whitelist
                                            </label>
                                            <p className="text-sm text-gray-500">
                                                Enable whitelist to restrict parking to pre-approved vehicles only
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </ModalBody>

                            <ModalFooter className="flex justify-end space-x-3">
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleSaveChanges}
                                    startContent={<Save className="h-4 w-4 text-background" />}
                                    className='text-background'
                                >


                                    Save Changes
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

        </div>
    );
}

const ParkingLotInfo: React.FC = () => {
    let tabs = [
        {
            id: "info",
            label: "Info",
            content: <ParkingLotInfoContainer />
        },

        {
            id: "payment",
            label: "Payment",
            content: <ParkingLotPayment />
        },

    ];

    return (
        <DefaultLayout title='Parking Lot Info'>
            <Tabs aria-label="Dynamic tabs" items={tabs} className='mt-2'>
                {(item) => (
                    <Tab key={item.id} title={item.label}>
                        {item.content}
                    </Tab>
                )}
            </Tabs>

        </DefaultLayout>
    )
};


export default ParkingLotInfo;