import React, { useEffect, useState } from 'react';
import { Check, Clock, Crown, DollarSign } from 'lucide-react';
import DefaultLayout from '@/layouts/default';
import { Button, Card, CardBody, CardFooter, CardHeader } from '@heroui/react';
import { Subscription } from '@/types/ParkingLot';
import { formatDuration, formatPrice } from '@/components/utils/stringUtils';
import { useNavigate } from 'react-router-dom';
import { fetchSubscriptions } from '@/services/parkinglot/subscriptionService';




const SubscriptionComponent: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);


  useEffect(() => {
    const fetchSubscriptions2 = async () => {
      const response = await fetchSubscriptions();
      setSubscriptions(response);
    };
    fetchSubscriptions2();
  }, []);


  // Calculate monthly equivalent price
  const getMonthlyPrice = (price: number, duration: number): string => {
    const months = duration / (30 * 24 * 60 * 60 * 1000);
    return (price / months).toFixed(2);
  };


  // Sort subscriptions by duration (shortest to longest)
  const sortedSubscriptions = [...subscriptions].sort((a, b) => a.duration - b.duration);

  return (
    <DefaultLayout title='subscription' className="my-5">
      <div className="text-center mb-12">
        <h1 className="text-xl font-bold text-primary mb-2">Choose Your Subscription</h1>
        <p className="text-sm text-primary/80 max-w-2xl mx-auto">
          Select the perfect plan that fits your timeline and budget. All plans include full access to our platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedSubscriptions.map((subscription) => {
          
          const monthlyEquivalent = getMonthlyPrice(subscription.price, subscription.duration);

          return (
            <Card
              key={subscription.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 
                ${selectedPlan === subscription.id
                  ? 'border-primary ring-4 ring-primary/20'
                  : 'border-primary/20 hover:border-primary/40'
                }`}
            >
             
              {/* Header */}
              <CardHeader className='flex flex-col items-center justify-center'>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold text-primary">{subscription.name}</h3>
                </div>
                <div className="text-sm text-primary/80 mb-4">
                  {formatDuration(subscription.duration)} commitment
                </div>

              </CardHeader>

              <CardBody >
                <div className="text-center mb-6">
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(subscription.price)}
                    </span>
                    <span className="text-primary/80 ml-1 text-sm">
                      /{formatDuration(subscription.duration)}
                    </span>
                  </div>

                  {subscription.duration > 2629746000 && (
                    <div className="text-sm text-primary/80">
                      {formatPrice(Number(monthlyEquivalent))}/month equivalent
                    </div>
                  )}
                </div>


                {/* Description */}
                <p className="text-primary/80 text-sm mb-6 leading-relaxed">
                  {subscription.description}
                </p>

              </CardBody>
              <CardFooter className=''>
                {/* CTA Button */}
                <Button
                  className={`w-full ${selectedPlan === subscription.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  onPress={() => setSelectedPlan(subscription.id)}
                >
                  {selectedPlan === subscription.id ? 'Selected' : 'Choose Plan'}
                </Button>
              </CardFooter>

            
            </Card>
          );
        })}
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6 border-2 border-primary/20">
          <h3 className="text-xl font-bold text-primary mb-4">Selected Plan Summary</h3>
          {(() => {
            const selected = subscriptions.find(sub => sub.id === selectedPlan);
            if (!selected) return null;
            return (

              <>
                {/* Plan Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Plan Name */}
                  <div className="bg-background/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Crown className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Plan Type</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{selected.name}</p>
                  </div>

                  {/* Duration */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Duration</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{formatDuration(selected.duration)}</p>
                  </div>

                  {/* Total Price */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Total Price</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{formatPrice(selected.price)}</p>

                  </div>

                  {/* Monthly Equivalent */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">Per Month</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">{formatPrice(Number(getMonthlyPrice(selected.price, selected.duration)))}</p>
                    <p className="text-sm text-gray-500 mt-1">Monthly rate</p>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  {/* Additional Info */}
                  <div className="mt-8 p-6 bg-background/50 rounded-2xl border border-blue-100">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600/30 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Plan Active</p>
                          <p className="text-sm text-gray-600">Billing starts immediately</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Next billing in</p>
                        <p className="font-semibold text-gray-800">{formatDuration(selected.duration)}</p>
                      </div>
                    </div>
                  </div>

                  <Button className='' onPress={() => navigate(`/owner/subscription/payment/${selectedPlan}`)}>
                    Proceed to payment
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </DefaultLayout>
  );
};

export default SubscriptionComponent;

