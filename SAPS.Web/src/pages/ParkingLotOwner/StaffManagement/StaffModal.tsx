import { useState, useEffect } from 'react';
import { Accordion, AccordionItem, addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, PressEvent, Select, SelectItem,  UseDisclosureProps } from '@heroui/react';
import { Calendar, InfoIcon, Users } from 'lucide-react';
import { AddStaffFormRequest, statusOptions } from '@/components/utils/staffUtils';
import { StaffStatus, User } from '@/types/User';
import { addStaff, updateStaff } from '@/services/parkinglot/staffService';


export const AddStaffModal = ({ addModalDisclosure, parkingLotId }: { addModalDisclosure: UseDisclosureProps, parkingLotId: string }) => {


    const [formData, setFormData] = useState<AddStaffFormRequest>({
        fullName: '',
        email: 'staff@downtownmall.com',
        phone: '+1 (555) 123-4567',
        employeeId: 'EMP-2025-XXX',
        dateOfBirth: '',
        status: StaffStatus.ACTIVE
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    async function handleAddUser(e: PressEvent): Promise<void> {
        console.log(e);
        // Validation
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.employeeId.trim()) {
            addToast({
                title: 'Validation Error',
                description: 'Full Name, Email, Phone, and Employee ID are required.',
                color: 'danger',
            });
            return;
        }
        try {
            const response = await addStaff(parkingLotId, formData);
            console.log("succces", response);
            addModalDisclosure.onClose?.();
        } catch (error) {
            console.error('Error adding staff:', error);
            // Handle error (show toast notification, etc.)
            addToast({
                title: 'Error',
                description: 'Failed to add staff',
                color: 'danger',
            });
        }
    }

    return (
        <Modal size='xl' isOpen={addModalDisclosure.isOpen}>
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-900" />
                            <h3 className="text-xl font-semibold text-primary-900">Personal Information</h3>
                        </ModalHeader>
                        <ModalBody>
                            <div className="p-2">
                                {/* Personal Information Section */}
                                <div className="">
                                    {/* Full Name */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            placeholder="Enter staff member's full name"
                                            className=""
                                        />
                                    </div>

                                    {/* Email and Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className=""
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Will be used for login and notifications</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className=""
                                            />
                                        </div>
                                    </div>

                                    {/* Employee ID and Date of Birth */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Employee ID
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.employeeId}
                                                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                                className=""
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Optional - auto-generated if empty</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Date of Birth
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                    className=""
                                                />
                                                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Optional - for HR records</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Setup Info */}
                                <Accordion>
                                    <AccordionItem key="1" aria-label="account-setup" title="Account Setup" startContent={<InfoIcon className='w-4 h-4 text-primary-900' />}>
                                        <div className="bg-cyan-50 border bordeir-cyan-200 rounded-lg p-4 ">
                                            <ul className=" text-sm text-primary-900/90">
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>System will auto-generate a secure temporary password</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Login credentials will be sent to the staff's email address</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Staff will be required to change password on first login</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Email will include desktop application download link and instructions</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="text-primary-600">•</span>
                                                    <span className='text-xs'>Additional employment details can be configured after account creation</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </AccordionItem>

                                </Accordion>
                            </div>

                        </ModalBody>
                        <ModalFooter>
                            <Button color='danger' variant='light' className='' onPress={addModalDisclosure.onClose}>
                                Cancel
                            </Button>
                            <Button color='primary' className='text-background' onPress={handleAddUser}>
                                Add
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>


    )
}
export const UpdateStaffModal = ({ updateModalDisclosure, parkingLotId, user }: { updateModalDisclosure: UseDisclosureProps, parkingLotId: string, user: User | null }) => {

    const [selectedStatus, setSelectedStatus] = useState(new Set([user?.staffProfile?.status?.toString() || '0']));

    const [formData, setFormData] = useState<AddStaffFormRequest>({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        employeeId: user?.staffProfile?.staffId || '',
        dateOfBirth: '',
        status: user?.staffProfile?.status || 0
    });
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user?.fullName || '',
                email: user?.email || '',
                phone: user?.phone || '',
                employeeId: user?.staffProfile?.staffId || '',
                dateOfBirth: '',
                status: user?.staffProfile?.status || 0
            });
            setSelectedStatus(new Set([user?.staffProfile?.status?.toString() || '0']));
        }
    }, [user]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleStatusChange = (keys: any) => {
        setSelectedStatus(keys);
        const statusValue = Array.from(keys)[0] as string;
        setFormData(prev => ({
            ...prev,
            status: parseInt(statusValue)
        }));
    };

    async function handleUpdateUser(e: PressEvent): Promise<void> {
        console.log(e);
        // Validation
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.employeeId.trim()) {
            addToast({
                title: 'Validation Error',
                description: 'Full Name, Email, Phone, and Employee ID are required.',
                color: 'danger',
            });
            return;
        }
        try {
            const response = await updateStaff(parkingLotId, formData);
            console.log("succces", response);
            updateModalDisclosure.onClose?.();

        } catch (error) {
            console.error('Error adding staff:', error);
            // Handle error (show toast notification, etc.)
            addToast({
                title: 'Error',
                description: 'Failed to add staff',
                color: 'danger',
            });
        }
    }

    return (
        <Modal size='xl' isOpen={updateModalDisclosure.isOpen}>
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-900" />
                            <h3 className="text-xl font-semibold text-primary-900">Personal Information</h3>
                        </ModalHeader>
                        <ModalBody>
                            <div className="p-2">
                                {/* Personal Information Section */}
                                <div className="">
                                    {/* Full Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">

                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                                placeholder="Enter staff member's full name"
                                                className=""
                                            />


                                        </div>

                                        {/* Status */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Status <span className="text-red-500">*</span>
                                            </label>
                                            <Select
                                                aria-label="Select Status"
                                                placeholder="Choose staff status"
                                                selectedKeys={selectedStatus}
                                                onSelectionChange={handleStatusChange}
                                                className="w-full"
                                            >
                                                {statusOptions.map((status) => (
                                                    <SelectItem key={status.key}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </div>


                                    </div>
                                    {/* Email and Phone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className=""
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Will be used for login and notifications</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className=""
                                            />
                                        </div>
                                    </div>

                                    {/* Employee ID and Date of Birth */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Employee ID
                                            </label>
                                            <Input
                                                isDisabled
                                                readOnly
                                                type="text"
                                                value={formData.employeeId}
                                                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                                className=""
                                            />
                                            {/* <p className="text-xs text-gray-500 mt-1">Optional - auto-generated if empty</p> */}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Date of Birth
                                            </label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    value={formData.dateOfBirth}
                                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                    className=""
                                                />
                                                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Optional - for HR records</p>
                                        </div>
                                    </div>


                                </div>

                            </div>

                        </ModalBody>
                        <ModalFooter>
                            <Button color='danger' variant='light' className='' onPress={updateModalDisclosure.onClose}>
                                Cancel
                            </Button>
                            <Button color='primary' className='text-background' onPress={handleUpdateUser}>
                                Update
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}