
import React, { useEffect, useState } from 'react';
import { Building2, Calendar, CreditCard, Clock, BarChart3 } from 'lucide-react';
import { ParkingLot, ParkingLotSubscription } from '@/types/ParkingLot';
import axios from 'axios';
import { apiUrl } from '@/config/base';
import { User } from '@/types/User';
import { formatDate, formatDuration, formatPrice } from '@/components/utils/stringUtils';
import { Button, Progress } from '@heroui/react';
import { useNavigate } from 'react-router-dom';

const SubscriptionInfo: React.FC<{ selectedParkingLot: ParkingLot, user: User, parkingLots: ParkingLot[] }> = ({ selectedParkingLot, user, parkingLots }) => {
   const navigate = useNavigate();

   const [parkingLotSubscriptionInfo, setParkingLotSubscriptionInfo] = useState<ParkingLotSubscription>();
   const [listParkingLotSubscription, setListParkingLotSubscription] = useState<ParkingLotSubscription[]>([]);

   const loadSubscriptionInfo = async () => {
      const response = await axios.get(`${apiUrl}/api/subscription/${user?.id}/${selectedParkingLot?.id}`, {
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
      });
      setParkingLotSubscriptionInfo(response.data);
      return response.data;
   }

   const loadListParkingLotSubscription = async () => {
      const response = await axios.get(`${apiUrl}/api/subscription/${user?.id}`, {
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
         }
      });
      setListParkingLotSubscription(response.data);
      console.log("listParkingLotSubscription", response.data);
      return response.data;
   }

   const calcEndedDate = (startedDate: string | undefined, duration: number | undefined) => {
      if (!startedDate || !duration) return '';
      const start = new Date(startedDate);
      const end = new Date(start.getTime() + duration);
      return end.toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric'
      });
   }

   const calcProgress = (startedDate: string | undefined, duration: number | undefined) => {
      if (!startedDate || !duration) return 0;
      const start = new Date(startedDate);
      const end = new Date(start.getTime() + duration);
      const now = new Date();
      const timeDiff = (end.getTime() - now.getTime());
      return Math.max(0, Math.min(100, 100 - ((timeDiff / duration) * 100)));
   }

   const calcRemainingDays = (startedDate: string | undefined, duration: number | undefined) => {
      if (!startedDate || !duration) return 0;
      const start = new Date(startedDate);
      const end = new Date(start.getTime() + duration);
      const now = new Date();
      const timeDiff = end.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return Math.max(0, daysRemaining);
   }

   const getProgressLabel = (progress: number, remainingDays: number) => {
      if (progress >= 100) return "Expired";
      if (remainingDays <= 7) return `${remainingDays} days left`;
      if (remainingDays <= 30) return `${remainingDays} days remaining`;
      return `${Math.round(progress)}% completed`;
   }



   useEffect(() => {
      loadSubscriptionInfo();
      loadListParkingLotSubscription();
   }, [selectedParkingLot]);


   // if subscription day is less than 7 days, show the subscription name in red
   // view button to view the subscription page

   const checkSubscriptionDay = (startedDate: string | undefined, duration: number | undefined) => {
      if (!startedDate || !duration) return false;
      const start = new Date(startedDate);
      const end = new Date(start.getTime() + duration);
      const now = new Date();
      const timeDiff = end.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      return daysRemaining < 7;
   }

   const returnProgressColor = (remainingDays: number) => {
      if (remainingDays <= 0) return 'danger';
      if (0 < remainingDays && remainingDays <= 7) return 'warning';
      return 'primary';
   }

   const currentProgress = calcProgress(parkingLotSubscriptionInfo?.startedDate, parkingLotSubscriptionInfo?.subscription?.duration);
   const remainingDays = calcRemainingDays(parkingLotSubscriptionInfo?.startedDate, parkingLotSubscriptionInfo?.subscription?.duration);

   return (
      <div className='rounded-lg shadow-md m-2 shadow-background-200/30 p-6 space-y-8'>
         {/* Main Subscription Card */}
         <div className="bg-background-50 rounded-lg shadow-md shadow-background-200/30 p-6 space-y-8">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                     <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                     <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Current Subscription
                     </h2>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedParkingLot?.name}
                     </p>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                     {parkingLotSubscriptionInfo?.subscription?.name || 'No Plan'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                     {formatPrice(parkingLotSubscriptionInfo?.subscription?.price)} / {formatDuration(parkingLotSubscriptionInfo?.subscription?.duration)}
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                           <Calendar className="h-4 w-4 text-gray-500" />
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Started</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                           {formatDate(parkingLotSubscriptionInfo?.startedDate || '')}
                        </span>

                        {checkSubscriptionDay(parkingLotSubscriptionInfo?.startedDate, parkingLotSubscriptionInfo?.subscription?.duration) && (
                           <div className='flex flex-col items-end space-x-2'>

                              <div className='text-sm font-medium text-red-500 dark:text-red-400'>
                                 Renew subscription in {remainingDays} days
                              </div>
                              <Button
                                 color="danger"
                                 className='text-white'
                                 size="sm"
                                 onPress={() => {
                                    navigate(`/owner/subscription`);
                                 }}
                              >
                                 Renew
                              </Button>
                           </div>
                        )}



                     </div>
                  </div>

                  <div className="bg-background-50 rounded-lg shadow-md shadow-background-200/30 p-6 space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                           <Clock className="h-4 w-4 text-gray-500" />
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Next billing</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                           {calcEndedDate(parkingLotSubscriptionInfo?.startedDate, parkingLotSubscriptionInfo?.subscription?.duration)}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Enhanced Progress Section */}
               <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                           Subscription Progress
                        </span>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                           {getProgressLabel(currentProgress, remainingDays)}
                        </div>
                        {remainingDays > 0 && (
                           <div className="text-xs text-gray-500">
                              {remainingDays} days remaining
                           </div>
                        )}
                     </div>
                  </div>
                  <div className="relative">
                     <Progress
                        value={currentProgress}
                        className="h-2"
                        color={returnProgressColor(remainingDays)}
                     />
                     <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Start</span>
                        <span>{Math.round(currentProgress)}%</span>
                        <span>End</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Other Subscriptions Card */}
         <div className="bg-background-50 rounded-lg shadow-md shadow-background-200/30 p-6 space-y-8">
            <div className="flex items-center space-x-3 mb-6">
               <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Other Parking Subscriptions
               </h3>
            </div>

            <div className="space-y-4">
               {parkingLots.map((item, index) => {
                  const parkingLotSubscription = listParkingLotSubscription.find(subscription => subscription.parkingLotId === item.id);
                  const progress = calcProgress(parkingLotSubscription?.startedDate, parkingLotSubscription?.subscription?.duration);
                  const remaining = calcRemainingDays(parkingLotSubscription?.startedDate, parkingLotSubscription?.subscription?.duration);

                  return (
                     item.id !== selectedParkingLot.id ? (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                           <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                 <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                       {item.name}
                                    </span>
                                 </div>
                                 {parkingLotSubscription?.subscription && (
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                                       {parkingLotSubscription.subscription.name}
                                    </span>
                                 )}
                              </div>
                              <div className="text-right">
                                 <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {calcEndedDate(parkingLotSubscription?.startedDate, parkingLotSubscription?.subscription?.duration) || 'No subscription'}
                                 </div>
                                 {remaining > 0 && (
                                    <div className="text-xs text-gray-500">
                                       {getProgressLabel(progress, remaining)}
                                    </div>
                                 )}
                              </div>
                           </div>

                           {parkingLotSubscription && (
                              <div className="relative">
                                 <Progress
                                    className="h-1.5"
                                    value={progress}
                                    color={returnProgressColor(remaining)}
                                 />
                                 <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>{Math.round(progress)}% </span>
                                    <span>{remaining} days left</span>
                                 </div>
                              </div>
                           )}
                        </div>
                     ) : (
                        <></>
                     )
                  );
               })}
            </div>
         </div>
      </div>
   )
}

export default SubscriptionInfo;