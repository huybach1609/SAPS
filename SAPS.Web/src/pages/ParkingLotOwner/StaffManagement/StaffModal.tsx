import  { useState, useEffect } from 'react';
import { Accordion, AccordionItem, addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, PressEvent, Select, SelectItem,  UseDisclosureProps } from '@heroui/react';
import { Calendar, InfoIcon, Users } from 'lucide-react';
import { AddStaffFormRequest, userStatusOptions } from '@/components/utils/staffUtils';
import { UserStatus, User } from '@/types/User';
import { addStaff, updateStaff } from '@/services/parkinglot/staffService';


export const AddStaffModal = ({ addModalDisclosure, parkingLotId }: { addModalDisclosure: UseDisclosureProps, parkingLotId: string }) => {


    // const [formData, setFormData] = useState<AddStaffFormRequest>({
    //     fullName: '',
    //     email: 'staff@downtownmall.com',
    //     phone: '+1 (555) 123-4567',
    //     employeeId: 'EMP-2025-XXX',
    //     dateOfBirth: '',
    //     status: UserStatus.ACTIVE
    // });
      const [formData, setFormData] = useState<AddStaffFormRequest>({
        fullName: '',
        email: '',
        phone: '',
        employeeId: '',
        dateOfBirth: '',
        status: UserStatus.ACTIVE
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
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
            addToast({
                title: 'Validation Error',
                description: 'Full Name, Email, and Phone are required.',
                color: 'danger',
            });
            return;
        }
        try {
            const response = await addStaff(parkingLotId, formData);
            console.log("succces", response);
            addModalDisclosure.onClose?.();
            addToast({
                title: 'Success',
                description: 'Staff member added successfully!',
                color: 'success',
            });
        } catch (error) {
            console.error('Error adding staff:', error);
            
            // Extract error message from the service
            let errorMessage = 'Failed to add staff';
            let errorTitle = 'Error';
            
            if (error instanceof Error) {
                // The service now throws errors with format "Title: Message"
                const errorText = error.message;
                const colonIndex = errorText.indexOf(':');
                
                if (colonIndex !== -1) {
                    errorTitle = errorText.substring(0, colonIndex).trim();
                    errorMessage = errorText.substring(colonIndex + 1).trim();
                } else {
                    errorMessage = errorText;
                }
            }
            
            addToast({
                title: errorTitle,
                description: errorMessage,
                color: 'danger',
            });
        }
    }

    return (
        <Modal size='xl' isOpen={addModalDisclosure.isOpen} onClose={addModalDisclosure.onClose}
        scrollBehavior="inside"
        >
            <ModalContent>
                {(onClose) => (
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
                                                placeholder=""
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
                                                placeholder=""
                                                className=""
                                            />
                                        </div>
                                    </div>

                                    {/* Employee ID and Date of Birth */}
                                    <div className=" grid-cols-1 md:grid-cols-2 gap-4 mb-6 hidden">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Employee ID (Optional)
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
                                                Date of Birth (Optional)
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
                            <Button color='danger' variant='light' className='' onPress={onClose}>
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

    const [selectedStatus, setSelectedStatus] = useState(new Set([user?.status || UserStatus.ACTIVE]));

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        employeeId: user?.staffProfile?.staffId || '',
        dateOfBirth: '',
        status: user?.status || UserStatus.ACTIVE
    });
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user?.fullName || '',
                email: user?.email || '',
                phone: user?.phoneNumber || '',
                employeeId: user?.staffProfile?.staffId || '',
                dateOfBirth: '',
                status: user?.status || UserStatus.ACTIVE
            });
            setSelectedStatus(new Set([user?.status || UserStatus.ACTIVE]));
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
            status: statusValue
        }));
    };

    async function handleUpdateUser(e: PressEvent): Promise<void> {
        console.log(e);
        // Validation
        if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
            addToast({
                title: 'Validation Error',
                description: 'Full Name, Email, and Phone are required.',
                color: 'danger',
            });
            return;
        }
        try {
            const response = await updateStaff(parkingLotId, formData);
            console.log("succces", response);
            updateModalDisclosure.onClose?.();
            addToast({
                title: 'Success',
                description: 'Staff member updated successfully!',
                color: 'success',
            });
        } catch (error) {
            console.error('Error updating staff:', error);
            
            // Extract error message from the service
            let errorMessage = 'Failed to update staff';
            let errorTitle = 'Error';
            
            if (error instanceof Error) {
                // The service now throws errors with format "Title: Message"
                const errorText = error.message;
                const colonIndex = errorText.indexOf(':');
                
                if (colonIndex !== -1) {
                    errorTitle = errorText.substring(0, colonIndex).trim();
                    errorMessage = errorText.substring(colonIndex + 1).trim();
                } else {
                    errorMessage = errorText;
                }
            }
            
            addToast({
                title: errorTitle,
                description: errorMessage,
                color: 'danger',
            });
        }
    }

    return (
        <Modal size='xl' isOpen={updateModalDisclosure.isOpen} onClose={updateModalDisclosure.onClose}
           scrollBehavior="inside"
           closeButton={true}
        >
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
                                                {userStatusOptions.map((status) => (
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
                                    <div className=" grid-cols-1 md:grid-cols-2 gap-4 mb-6 hidden">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-900/90 mb-2">
                                                Employee ID (Optional)
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
                                                Date of Birth (Optional)
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