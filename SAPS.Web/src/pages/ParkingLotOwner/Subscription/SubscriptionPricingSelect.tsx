import React, { useState } from 'react';
import { Check, Star, Clock } from 'lucide-react';
import DefaultLayout from '@/layouts/default';
import { Button, Card, CardBody, CardFooter, CardHeader } from '@heroui/react';

// Define the type for a subscription plan
interface SubscriptionPlan {
  id: string;
  name: string;
  duration: number; // in milliseconds
  description: string;
  price: number;
  status: 'active' | 'inactive';
}

const subscriptions: SubscriptionPlan[] = [
  {
    id: "sub_001",
    name: "Monthly Plan",
    duration: 2629746000, // 1 month in milliseconds
    description: "Perfect for trying out our service with full access to all features",
    price: 290000,
    status: "active"
  },
  {
    id: "sub_002",
    name: "Quarterly Plan",
    duration: 7889238000, // 3 months in milliseconds
    description: "Great value for short-term projects with 15% savings compared to monthly",
    price: 760000,
    status: "active"
  },
  {
    id: "sub_003",
    name: "Semi-Annual Plan",
    duration: 15778476000, // 6 months in milliseconds
    description: "Best for medium-term commitments with 25% savings and priority support",
    price: 1340000,
    status: "active"
  },
  {
    id: "sub_004",
    name: "Annual Plan",
    duration: 31556952000, // 1 year in milliseconds
    description: "Maximum savings of 40% with annual billing plus exclusive features",
    price: 2150000,
    status: "active"
  }
];

const SubscriptionComponent: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Helper function to format duration
  const formatDuration = (milliseconds: number): string => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years >= 1) return `${years} year${years > 1 ? 's' : ''}`;
    if (months >= 1) return `${months} month${months > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''}`;
  };
  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Calculate monthly equivalent price
  const getMonthlyPrice = (price: number, duration: number): string => {
    const months = duration / (30 * 24 * 60 * 60 * 1000);
    return (price / months).toFixed(2);
  };

  // Get savings percentage compared to monthly
  const getSavings = (price: number, duration: number): number => {
    const monthlyEquivalent = parseFloat(getMonthlyPrice(price, duration));
    const baseMonthlyCost = 29.99; // Reference monthly price
    const savings = ((baseMonthlyCost - monthlyEquivalent) / baseMonthlyCost) * 100;
    return savings > 0 ? Math.round(savings) : 0;
  };

  // Sort subscriptions by duration (shortest to longest)
  const sortedSubscriptions = [...subscriptions].sort((a, b) => a.duration - b.duration);

  return (
    <DefaultLayout title='subscription' className="mt-5">
      <div className="text-center mb-12">
        <h1 className="text-xl font-bold text-primary mb-2">Choose Your Subscription</h1>
        <p className="text-sm text-primary/80 max-w-2xl mx-auto">
          Select the perfect plan that fits your timeline and budget. All plans include full access to our platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedSubscriptions.map((subscription, index) => {
          const savings = getSavings(subscription.price, subscription.duration);
          const monthlyEquivalent = getMonthlyPrice(subscription.price, subscription.duration);

          return (
            <Card
              key={subscription.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer 
                ${selectedPlan === subscription.id
                  ? 'border-primary ring-4 ring-primary/20'
                  : 'border-primary/20 hover:border-primary/40'
                }`}
              isPressable
              onPress={() => setSelectedPlan(subscription.id)}
            >
              {/* Savings Badge */}
              {/* {savings > 0 && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Save {savings}%
                  </div>
                </div>
              )} */}
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
                        {monthlyEquivalent}đ/month equivalent
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

                {/* Status */}
                {/* <div className="mt-4 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div> */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Plan:</strong> {selected.name}</p>
                  <p><strong>Duration:</strong> {formatDuration(selected.duration)}</p>
                  <p><strong>Price:</strong> €{selected.price}</p>
                </div>
                <div>
                  <p><strong>ID:</strong> {selected.id}</p>
                  <p><strong>Status:</strong> {selected.status}</p>
                  <p><strong>Monthly Equivalent:</strong> €{getMonthlyPrice(selected.price, selected.duration)}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </DefaultLayout>
  );
};

export default SubscriptionComponent;

{/* Features */ }
{/* <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">Full platform access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">24/7 customer support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">Regular updates</span>
                  </div>
                  {subscription.duration >= 15778476000 && (
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">Priority support</span>
                    </div>
                  )}
                  {subscription.duration >= 31556952000 && (
                    <div className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">Exclusive features</span>
                    </div>
                  )}
                </div> */}