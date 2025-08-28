import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Clock, MapPin, User, Copy } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import DefaultLayout from '@/layouts/default';
import { useParkingLot } from '../ParkingLotContext';
import QRCode from 'qrcode';
import { Button, Spinner, Tab, Tabs } from '@heroui/react';
import { formatPrice } from '@/components/utils/stringUtils';
import { PayOsResponse, Subscription } from '@/types/ParkingLot';
import { createPayment, getLatestPayment, fetchSubscriptions } from '@/services/parkinglot/subscriptionService';
import PaymentStatusChecker from './PaymentStatusChecker';
import vietQRLogo from '../../../assets/Logo/VietQR_Logo.png';
import napasLogo from '../../../assets/Logo/Logo-Napas.webp';


// Mock data from your response
// const mockPaymentData = {
//    paymentResponse: {
//       code: "00",
//       desc: "success",
//       data: {
//          bin: "970418",
//          accountNumber: "V3CAS3230387593",
//          accountName: "NGUYEN DINH NAM",
//          amount: 7000,
//          description: "CSC5ZUJHBJ8 Test request",
//          orderCode: 1791444297,
//          currency: "VND",
//          paymentLinkId: "72b8e0fd8abf4179a5b1f6f585bc2476",
//          status: "PENDING",
//          checkoutUrl: "https://pay.payos.vn/web/72b8e0fd8abf4179a5b1f6f585bc2476",
//          qrCode: "00020101021238590010A000000727012900069704180115V3CAS32303875930208QRIBFTTA5303704540470005802VN62280824CSC5ZUJHBJ8 Test request63042AD9"
//       },
//       signature: "9e46fc93182421c09ae95480afd794eee7e34770c1d04f9a4abb478bc659bb33"
//    },
//    subscription: {
//       id: "sub_001",
//       name: "Monthly Plan",
//       duration: 2629746000,
//       description: "Perfect for trying out our service with full access to all features",
//       price: 5000,
//       status: "active" as const
//    }
// };

const QRCodeImage = ({ qrCodeValue }: { qrCodeValue: string }) => {
   const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);


   useEffect(() => {

      QRCode.toDataURL(qrCodeValue, { width: 300 }, (err, url) => {
         if (err) {
            console.error(err);
            return;
         }
         setQrImageUrl(url);
      });

   }, []);

   return (
      <div>
         {qrImageUrl ? <img src={qrImageUrl} alt="QR Code" /> : <p>Generating QR...</p>}
      </div>
   );
};


const PaymentSubscriptionComponent: React.FC = () => {
   const { subscriptionId } = useParams<{ subscriptionId: string }>()
   const { selectedParkingLot } = useParkingLot();

   const [showQRCode, setShowQRCode] = useState(false);
   const [parkingLotSubscription, setParkingLotSubscription] = useState<PayOsResponse | null>(null);
   const [subscriptionData, setSubscriptionData] = useState<Subscription | null>(null);
   const [copiedField, setCopiedField] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(false);

   const navigate = useNavigate();

   const [paymentComplete, setPaymentComplete] = useState(false);
   console.log(paymentComplete);

   useEffect(() => {
      const fetchSubscription = async () => {
         setIsLoading(true);
         try {
            // Step 1: Create payment to get transaction ID
             await createPayment(selectedParkingLot?.id || '', subscriptionId || '');
            // console.log('Payment created:', createResponse);
            
            // Step 2: Get latest payment details
            const response = await getLatestPayment(selectedParkingLot?.id || '');
            // console.log('Latest payment:', response);
            setParkingLotSubscription(response);
            
            // console.log('nothing new:', response.transactionId.data.qrCode);
            
            // Step 3: Fetch subscription details separately
            const subscriptions = await fetchSubscriptions();
            const currentSubscription = subscriptions.find(sub => sub.id === subscriptionId);
            if (currentSubscription) {
               setSubscriptionData(currentSubscription);
            }
         } catch (error) {
            console.error('Error fetching payment:', error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchSubscription();
   }, [selectedParkingLot, subscriptionId]);

   const copyToClipboard = async (text: string, fieldName: string) => {
      try {
         await navigator.clipboard.writeText(text);
         setCopiedField(fieldName);
         setTimeout(() => setCopiedField(null), 2000);
      } catch (err) {
         console.error('Failed to copy text: ', err);
      }
   };

   const formatCurrency = (amount: number, currency: string = 'VND') => {
      return new Intl.NumberFormat('vi-VN', {
         style: 'currency',
         currency: currency,
         minimumFractionDigits: 0
      }).format(amount);
   };

   const formatDuration = (durationMs: number) => {
      const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));
      const months = Math.floor(days / 30);
      return months > 0 ? `${months} month${months > 1 ? 's' : ''}` : `${days} days`;
   };

   // Calculate monthly equivalent price
   const getMonthlyPrice = (price: number, duration: number): string => {
      const months = duration / (30 * 24 * 60 * 60 * 1000);
      return (price / months).toFixed(2);
   };


   // Payment status handlers
   const handlePaymentSuccess = (data: any) => {
      console.log('Payment successful:', data);
      setPaymentComplete(true);

      // Show success message for 2 seconds then redirect
      setTimeout(() => {
         // console.log('Payment successful:', data);
         
         navigate(`/owner/parking-info`);
      }, 10000);
   };

   const handlePaymentFailed = (data: any) => {
      // console.log('Payment failed:', data);

      // Redirect to failure page
      setTimeout(() => {
         console.log('Payment failed:', data);
         // navigate(`/parking-lot/${selectedParkingLot?.id}/subscription/failed?paymentId=${data.data.id}`);
      }, 1000);
   };

   const handlePaymentTimeout = () => {
      console.log('Payment check timeout');
      // Continue showing the page but with manual check option
   };

   return (
      <DefaultLayout className="p-4 flex  gap-6 justify-center " title="Payment Details"
         description="Complete your subscription payment">
         {/* Left Column - Subscription & Parking Info */}

         <div className="max-w-md  p-6 rounded-lg  ">
            {/* Header */}
            <div className="mb-6">
               <h1 className="text-lg font-medium text-gray-900 mb-2">Subscription Plan : {subscriptionData?.name}</h1>
               <div className="flex items-baseline">
                  <span className="text-3xl font-normal text-gray-900">
                     {formatPrice(Number(getMonthlyPrice(subscriptionData?.price || 0, subscriptionData?.duration || 0)))}</span>
                  <span className="text-sm text-gray-500 ml-2">per month</span>
               </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
               {/* Subscription Details */}
               <div className="">
                  {/* <div className="font-semibold text-primary flex items-center">
                     <CreditCard className="w-5 h-5 mr-2 text-primary" />
                     Subscription Plan : {subscription.name}
                  </div> */}
                  <p className="text-foreground/60 mt-1 text-sm mb-5">{subscriptionData?.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <div className='flex items-center gap-2'>
                           <p className="text-sm text-gray-500">Duration</p>
                           <p className="font-medium">{formatDuration(subscriptionData?.duration || 0)}</p>
                        </div>
                     </div>
                     {/* <div className="flex items-center">
                        <span className="text-xl font-normal text-primary">
                           {formatCurrency(parkingLotSubscription?.subscription?.price || 0)}
                        </span>
                     </div> */}
                  </div>
               </div>

               <hr className="border-foreground/10" />

               {/* Payment Summary */}
               <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
                  <div className="space-y-3">
                     <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{subscriptionData?.name} </span>
                        <span className="text-sm font-medium">{formatCurrency(subscriptionData?.price || 0)}</span>
                     </div>
                     {/* <div className="mt-4">
                        <div className="flex justify-between">
                           <span className="text-sm text-gray-600">Subtotal</span>
                           <span className="text-sm font-medium">{formatCurrency(subscription.price)}</span>
                        </div>
                     </div> */}
                     <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tax</span>
                        <span className="text-sm font-medium text-gray-400">{formatCurrency(0)}</span>
                     </div>

                     <hr className="border-foreground/10 mt-4" />

                     <div className="flex justify-between text-lg font-semibold pt-2">
                        <span>Total</span>
                        <span className="">{formatCurrency(subscriptionData?.price || 0)}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column - Payment Summary & Methods */}
         <div className="max-w-md ">
            {/* Payment Summary */}
            <div className=" rounded-xl shadow-sm border p-4 mb-4">
               <div className="space-y-4">
                  <div>
                     <h3 className="text-lg font-medium text-gray-900">{selectedParkingLot?.name}</h3>
                     {selectedParkingLot?.description && (
                        <p className="text-gray-600 mt-1">{selectedParkingLot.description}</p>
                     )}
                  </div>

                  <div className="flex items-start">
                     <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                     <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-900">{selectedParkingLot?.address}</p>
                     </div>
                  </div>
               </div>

            </div>

            {/* Payment Status Checker */}
            {parkingLotSubscription?.data?.paymentLinkId && (
               <PaymentStatusChecker
                  paymentId={parkingLotSubscription?.data?.orderCode.toString()}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailed={handlePaymentFailed}
                  onTimeout={handlePaymentTimeout}
                  autoStart={true}
                  className="mb-4"
                  expireAt={parkingLotSubscription?.data?.expiredAt}
               />
            )}

            {/* Payment Methods */}
            <div className=" rounded-xl shadow-sm border  p-4">
               <Tabs aria-label="Options" >
                  <Tab key="qr" title="QR Code">
                     <div className="text-center flex flex-col items-center">
                        <div className='flex gap-2 '>
                                           <img src={vietQRLogo} alt="vietqr" className='w-auto h-5 ' />
                <img src={napasLogo} alt="napas247" className='w-auto h-5 m-1' />
                        </div>
                        <div className="inline-flex items-center justify-center w-full h-full">
                           {isLoading ? (
                              <div className="flex items-center justify-center">
                                 <Spinner color="primary" />
                              </div>
                           ) : (
                              <QRCodeImage qrCodeValue={parkingLotSubscription?.data?.qrCode || ''} />
                           )}
                        </div>
                        <p className="text-sm text-gray-600 my-2">
                           Open any Banking App to scan VietQR code or transfer the exact amount, content below
                        </p>
                        <button
                           onClick={() => setShowQRCode(!showQRCode)}
                           className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                           {showQRCode ? 'Hide' : 'Show'} QR Code Data
                        </button>
                        {showQRCode && (
                           <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
                              {parkingLotSubscription?.data?.qrCode}
                           </div>
                        )}
                     </div>
                  </Tab>
                  <Tab key="payment" title="Payment Link">
                     <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                           <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                           <span className="text-sm text-yellow-800">
                              Status: {parkingLotSubscription?.data?.status}
                           </span>
                        </div>
                     </div>
                     <Button
                        onPress={() => window.open(parkingLotSubscription?.data?.checkoutUrl || '', '_blank')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                     >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                     </Button>

                     <div className="text-xs text-gray-500 space-y-1">
                        <p>Order Code: {parkingLotSubscription?.data?.orderCode}</p>
                        <p>Payment ID: {parkingLotSubscription?.data?.paymentLinkId}</p>
                     </div>
                  </Tab>

               </Tabs>


               {/* account info */}
               <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm mb-3">
                     <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                           <p className="text-gray-500">Account Name</p>
                           <p className="font-medium">{parkingLotSubscription?.data?.accountName}</p>
                        </div>
                     </div>
                     <button
                        onClick={() => copyToClipboard(parkingLotSubscription?.data?.accountName || '', 'accountName')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy account name"
                     >
                        {copiedField === 'accountName' ? (
                           <Check className="w-4 h-4 text-green-500" />
                        ) : (
                           <Copy className="w-4 h-4 text-gray-400" />
                        )}
                     </button>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                     <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                           <p className="text-gray-500">Account Number</p>
                           <p className="font-medium">{parkingLotSubscription?.data?.accountNumber}</p>
                        </div>
                     </div>
                     <button
                        onClick={() => copyToClipboard(parkingLotSubscription?.data?.accountNumber || '', 'accountNumber')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy account number"
                     >
                        {copiedField === 'accountNumber' ? (
                           <Check className="w-4 h-4 text-green-500" />
                        ) : (
                           <Copy className="w-4 h-4 text-gray-400" />
                        )}
                     </button>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                     <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                           <p className="text-gray-500">Description</p>
                           <p className="font-medium">{parkingLotSubscription?.data?.description}</p>
                        </div>
                     </div>
                     <button
                        onClick={() => copyToClipboard(parkingLotSubscription?.data?.description || '', 'description')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy description"
                     >
                        {copiedField === 'description' ? (
                           <Check className="w-4 h-4 text-green-500" />
                        ) : (
                           <Copy className="w-4 h-4 text-gray-400" />
                        )}
                     </button>
                  </div>
               </div>
            </div>


         </div>
      </DefaultLayout>
   );



   // Helper functions for status display
   // function getStatusColor(status: string): "success" | "warning" | "danger" | "default" {
   //    switch (status) {
   //       case 'PAID':
   //          return 'success';
   //       case 'PENDING':
   //          return 'warning';
   //       case 'CANCELLED':
   //       case 'EXPIRED':
   //          return 'danger';
   //       default:
   //          return 'default';
   //    }
   // }

   // function getStatusIcon(status: string) {
   //    switch (status) {
   //       case 'PAID':
   //          return <CheckCircle className="w-4 h-4" />;
   //       case 'PENDING':
   //          return <Clock className="w-4 h-4" />;
   //       case 'CANCELLED':
   //       case 'EXPIRED':
   //          return <XCircle className="w-4 h-4" />;
   //       default:
   //          return <Clock className="w-4 h-4" />;
   //    }
   // }

   // function getStatusText(status: string): string {
   //    switch (status) {
   //       case 'PAID':
   //          return 'Đã thanh toán';
   //       case 'PENDING':
   //          return 'Đang chờ thanh toán';
   //       case 'CANCELLED':
   //          return 'Đã hủy';
   //       case 'EXPIRED':
   //          return 'Đã hết hạn';
   //       default:
   //          return 'Không xác định';
   //    }
   // }
};

export default PaymentSubscriptionComponent;
