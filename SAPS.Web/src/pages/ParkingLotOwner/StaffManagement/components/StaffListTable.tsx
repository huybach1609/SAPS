import React from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, UseDisclosureProps } from '@heroui/react';
import { EllipsisVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/User';
import { ParkingLot } from '@/types/ParkingLot';
import { formatPhoneNumber } from '@/components/utils/stringUtils';
import { StaffStatusBadge } from '@/components/utils/staffUtils';

interface StaffListTableProps {
  staffList: User[];
  selectUser: User | null;
  setSelectUser: React.Dispatch<React.SetStateAction<User | null>>;
  parkingLot: ParkingLot | null;
  updateModalDisclosure: UseDisclosureProps;
  handleDeactivateStaff: ( user: User) => void;
}

export const StaffListTable: React.FC<StaffListTableProps> = ({
  staffList,
  selectUser,
  setSelectUser,
  parkingLot,
  updateModalDisclosure,
  handleDeactivateStaff,
}) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <Table
        aria-label="Staff Table"
        color="secondary"
        selectedKeys={selectUser ? [selectUser.staffProfile?.staffId || ''] : []}
        onSelectionChange={(keys) => {
          if (typeof keys === 'string') {
            setSelectUser(null);
            return;
          }
          const [selectedid] = keys;
          const staff = staffList.find((s) => s.staffProfile?.staffId === selectedid);
          setSelectUser(staff || null);
        }}
      >
        <TableHeader>
          <TableColumn key="user" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Staff ID
          </TableColumn>
          <TableColumn key="addedDate" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </TableColumn>
          <TableColumn key="expiryDate" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email & Phone
          </TableColumn>
          <TableColumn key="createdAt" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Start Date
          </TableColumn>
          <TableColumn key="status" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </TableColumn>
          <TableColumn key="action" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody>
          {staffList.map((entry) => (
            <TableRow key={`${entry.staffProfile?.staffId}`}>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                {entry.staffProfile?.staffId}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium">
                      {entry.fullName || 'Unknown User'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                {entry.email}
                <div className="text-sm text-gray-500">
                  {entry.phone ? formatPhoneNumber(entry.phone) : 'No phone'}
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {new Date(entry.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <StaffStatusBadge status={entry.staffProfile?.status || 0} />
              </TableCell>
              <TableCell>
                <Dropdown className="mx-auto">
                  <DropdownTrigger>
                    <Button variant="light" isIconOnly>
                      <EllipsisVertical size={16} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="action">
                    <DropdownItem
                      key="detail"
                      onPress={() => navigate(`/owner/staff/${parkingLot?.id}/${entry?.staffProfile?.staffId}`)}
                    >
                      Detail
                    </DropdownItem>
                    <DropdownItem
                      key="update"
                      onPress={() => {
                        setSelectUser(entry);
                        updateModalDisclosure.onOpen?.();
                      }}
                    >
                      Update
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-danger"
                      color="danger"
                      onPress={() => handleDeactivateStaff(entry)}
                    >
                      Deactivate
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
