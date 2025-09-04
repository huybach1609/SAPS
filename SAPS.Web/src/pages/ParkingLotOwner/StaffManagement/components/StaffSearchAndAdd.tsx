import React from 'react';
import { Button, Card, CardBody, CardHeader, Input, Select, SelectItem } from '@heroui/react';
import { FolderSearch, PlusIcon, RefreshCcw } from 'lucide-react';
import { UserStatus } from '@/types/User';

interface StaffSearchAndAddProps {
  tableSearch: string;
  setTableSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  setCurrentPage: (page: number) => void;
  handleSearch: () => void;
  handleReset: () => void;
  onAddStaffer: () => void;
  loadStaffList: () => void;
}

export const StaffSearchAndAdd: React.FC<StaffSearchAndAddProps> = ({
  tableSearch,
  setTableSearch,
  statusFilter,
  setStatusFilter,
  setCurrentPage,
  handleSearch,
  handleReset,
  onAddStaffer,
  loadStaffList,
}) => {
  return (
    <Card className="bg-background-100/20 mb-6">
      <CardHeader className="flex items-center gap-2">
        <FolderSearch className="w-6 h-6 text-primary" />
        <h2 className="font-bold">Search & Add User</h2>
      </CardHeader>
      <CardBody>
        <div className="flex gap-2 items-center justify-between w-full">
          <div className="flex gap-2 items-center w-full">
            <Input
              type="text"
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-1/2"
              size="sm"
              color="primary"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Select
              aria-label="Filter by Status"
              placeholder="All Statuses"
              className="w-40"
              size="sm"
              color="primary"
              selectedKeys={statusFilter === '' ? new Set() : new Set([statusFilter])}
              onSelectionChange={keys => {
                const val = Array.from(keys)[0]?.toString() ?? '';
                setStatusFilter(val);
                setCurrentPage(1);
                loadStaffList();
              }}
            >
              <SelectItem key={""}>All</SelectItem>
              <SelectItem key={UserStatus.ACTIVE}>Active</SelectItem>
              <SelectItem key={UserStatus.INACTIVE}>Inactive</SelectItem>
              <SelectItem key={UserStatus.DELETED}>Deleted</SelectItem>
              <SelectItem key={UserStatus.BANNED}>Banned</SelectItem>
            </Select>
            <Button
              size="sm"
              onPress={handleSearch}
              color="primary"
              className="text-background"
            >
              Search
            </Button>
            <Button
              size="sm"
              onPress={handleReset}
              color="primary"
              className="text-background"
              isIconOnly
            >
              <RefreshCcw size={16} />
            </Button>
          </div>
          <Button
            onPress={onAddStaffer}
            startContent={<PlusIcon size={30} />}
            radius="sm"
            size="sm"
            color="secondary"
            className="text-background"
          >
            Add Staff
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};