import { UserStatus } from '@/types/User';
import { Chip } from '@heroui/react';

const userStatusConfig = {
  [UserStatus.ACTIVE]: {
    color: 'bg-green-100 text-green-800',
    icon: <div className="w-2 h-2 rounded-full bg-green-500" />
  },
  [UserStatus.INACTIVE]: {
    color: 'bg-gray-100 text-gray-800',
    icon: <div className="w-2 h-2 rounded-full bg-gray-500" />
  },
  [UserStatus.DELETED]: {
    color: 'bg-red-100 text-red-800',
    icon: <div className="w-2 h-2 rounded-full bg-red-500" />
  },
  [UserStatus.BANNED]: {
    color: 'bg-orange-100 text-orange-800',
    icon: <div className="w-2 h-2 rounded-full bg-orange-500" />
  }
};

export const getUserStatusDisplay = (status: string) => {
  const config = userStatusConfig[status as UserStatus];
  return config || {
    color: 'bg-gray-100 text-gray-800',
    icon: <div className="w-2 h-2 rounded-full bg-gray-500" />,
    label: status || 'Unknown'
  };
};

export const UserStatusBadge = ({ status }: { status: string }) => {
  const statusDisplay = getUserStatusDisplay(status);
  return (
    <Chip className={`inline-flex items-center px-1 pl-3 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}
      startContent={statusDisplay.icon}
    >
      {status || 'Unknown'}
    </Chip>
  );
};

export const UserStatusSimple = ({ status }: { status: string }) => {
  const statusDisplay = getUserStatusDisplay(status);
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${statusDisplay.color}`}>
      {status || 'Unknown'}
    </span>
  );
};

export const userStatusOptions = [
  { key: UserStatus.ACTIVE, label: 'Active' },
  { key: UserStatus.INACTIVE, label: 'Inactive' },
  { key: UserStatus.DELETED, label: 'Deleted' },
  { key: UserStatus.BANNED, label: 'Banned' }
];

// format date for input
export const formatDateForInput = (isoString: string) => {
  if (!isoString) return '';
  return isoString.split('T')[0];
};

// interface for add staff form request
export interface AddStaffFormRequest {
  fullName: string;
  email: string;
  phone: string;
  employeeId?: string; // Optional for new API, kept for backward compatibility
  dateOfBirth?: string; // Optional for new API, kept for backward compatibility
  status?: string; // Optional for new API, kept for backward compatibility
}
