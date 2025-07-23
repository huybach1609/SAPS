import { StaffStatus } from '@/types/User';

// Configuration for staff status display
const staffStatusConfig = {
    [StaffStatus.ACTIVE]: {
        label: 'Active',
        color: 'text-green-600 bg-green-100',
        dotColor: 'bg-green-600'
    },
    [StaffStatus.ON_LEAVE]: {
        label: 'On Leave',
        color: 'text-yellow-600 bg-yellow-100',
        dotColor: 'bg-yellow-600'
    },
    [StaffStatus.SUSPENDED]: {
        label: 'Suspended',
        color: 'text-orange-600 bg-orange-100',
        dotColor: 'bg-orange-600'
    },
    [StaffStatus.TERMINATED]: {
        label: 'Terminated',
        color: 'text-red-600 bg-red-100',
        dotColor: 'bg-red-600'
    }
};

// Helper function to get status display info
export const getStaffStatusDisplay = (status: number) => {
    const config = staffStatusConfig[status as StaffStatus];
    return config || {
        label: 'Unknown',
        color: 'text-gray-600 bg-gray-100',
        dotColor: 'bg-gray-600'
    };
};

// Component to render status with color
export const StaffStatusBadge = ({ status }: { status: number }) => {
    const statusDisplay = getStaffStatusDisplay(status);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${statusDisplay.dotColor}`}></span>
            {statusDisplay.label}
        </span>
    );
};

// Alternative simple version without badge styling
export const StaffStatusSimple = ({ status }: { status: number }) => {
    const statusDisplay = getStaffStatusDisplay(status);

    return (
        <span className={`font-medium ${statusDisplay.color.split(' ')[0]}`}>
            {statusDisplay.label}
        </span>
    );
}; 