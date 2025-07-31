import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { BarChart } from 'lucide-react';
import { fetchStaffListStatus } from '@/services/parkinglot/staffService';

export interface StaffListStatus {
  totalOwner: number;
  activeOwner: number;
  pendingApproval: number;
}

interface StaffListStatusComponentProps {
  parkingLotId: string;
  loadparking: boolean;
}

export const StaffListStatusComponent: React.FC<StaffListStatusComponentProps> = ({
  parkingLotId,
  loadparking,
}) => {
  const [staffListStatus, setStaffListStatus] = useState<StaffListStatus | null>(null);

  const fetch = async () => {
    const status = await fetchStaffListStatus(parkingLotId);
    setStaffListStatus(status);
  };

  useEffect(() => {
    if (!loadparking) {
      fetch();
    }
  }, [loadparking]);

  return (
    <Card className="bg-background-100/20 mb-6">
      <CardHeader className="flex items-center gap-2">
        <BarChart className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-bold">Staff List Status</h2>
      </CardHeader>
      <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary-900 text-background p-4 rounded-lg text-center">
          <p className="text-3xl font-bold">{staffListStatus?.totalOwner}</p>
          <p className="text-sm">Total Owner</p>
        </div>
        <div className="bg-primary-900/80 text-background p-4 rounded-lg text-center">
          <p className="text-3xl font-bold">{staffListStatus?.activeOwner}</p>
          <p className="text-sm">Active Owner</p>
        </div>
        <div className="bg-primary-900/70 text-background p-4 rounded-lg text-center">
          <p className="text-3xl font-bold">{staffListStatus?.pendingApproval}</p>
          <p className="text-sm">Pending Approval</p>
        </div>
      </CardBody>
    </Card>
  );
};

