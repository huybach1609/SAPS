import { apiUrl } from "@/config/base";
import { useAuth } from "@/services/auth/AuthContext";
// import { PaymentSource, PaymentStatistics } from "@/types";
import { Button, Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import axios from "axios";
import { Banknote, BarChart, CheckCircle2, Pencil, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useParkingLot } from "../ParkingLotContext";

export interface PaymentSource {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swiftCode: string;
};

export interface PaymentStatistics {
  monthlyRevenue: number;
  totalTransactions: number;
  successRate: number;
};



export default function ParkingLotPayment() {

  const [paymentSource, setPaymentSource] = useState<PaymentSource | null>(null);
  const [paymentStatistics, setPaymentStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { selectedParkingLot } = useParkingLot();

  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!user?.id || !selectedParkingLot?.id) return;

      try {
        setLoading(true);
        const [sourceResponse, statsResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/PaymentSource/${user.id}`),
          axios.get(`${apiUrl}/api/PaymentSource/${user.id}/Statistics`)
        ]);
        console.log(sourceResponse.data);
        console.log(statsResponse.data);

        setPaymentSource(sourceResponse.data);
        setPaymentStatistics(statsResponse.data);
      } catch (error) {
        console.error('Error fetching payment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
      }, [user?.id, selectedParkingLot?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!paymentSource || !paymentStatistics) {
    return (
      <div className="text-center py-12">
        <Banknote className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-background-900">No payment data found</h3>
        <p className="mt-1 text-sm text-background-500">Payment information is not available.</p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <Card className="bg-background-100/20">
        <CardHeader className="flex items-center gap-2">
          <Banknote className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-bold">Current Payment Source</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-background-600 text-background p-4 rounded-lg">
                <Banknote size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{paymentSource.bankName}</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-primary-900/50">Account Number</p>
                <p className="font-semibold">{paymentSource.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-primary-900/50">Account Name</p>
                <p className="font-semibold">{paymentSource.accountName}</p>
              </div>
              <div>
                <p className="text-sm text-primary-900/50">Branch</p>
                <p className="font-semibold">{paymentSource.branch}</p>
              </div>
              <div>
                <p className="text-sm text-primary-900/50">Swift Code</p>
                <p className="font-semibold">{paymentSource.swiftCode}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 bg-background-50 p-4 rounded-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-sm">Active and verified for payment processing</p>
            </div>
            <span className="text-sm font-semibold bg-green-200 text-green-800 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-background-100/20">
        <CardHeader className="flex items-center gap-2">
          <BarChart className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-bold">Payment Statistics</h2>
        </CardHeader>
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-900 text-background p-4 rounded-lg text-center">
            <p className="text-3xl font-bold">${paymentStatistics.monthlyRevenue}</p>
            <p className="text-sm">This Month Revenue</p>
          </div>
          <div className="bg-primary-900 text-background p-4 rounded-lg text-center">
            <p className="text-3xl font-bold">{paymentStatistics.totalTransactions}</p>
            <p className="text-sm">Total Transactions</p>
          </div>
          <div className="bg-primary-900 text-background p-4 rounded-lg text-center">
            <p className="text-3xl font-bold">{paymentStatistics.successRate}%</p>
            <p className="text-sm">Success Rate</p>
          </div>
        </CardBody>
      </Card>

      <Card className="bg-background-100/20">
        <CardHeader className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-bold">Account Management</h2>
        </CardHeader>
        <CardBody>
          <div className="bg-cyan-100/60 p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-bold">Note:</span> Changes to payment source information require verification and may take 1-2 business days to process. Your current payment processing will continue during the verification period.
            </p>
          </div>
          <div className="mt-4">
            <Button color="primary" className="bg-primary-900 hover:bg-cyan-500 text-background">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Payment Source
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}