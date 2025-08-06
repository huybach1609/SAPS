import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Check, Clock, X, RefreshCw, AlertCircle } from 'lucide-react';
import { Button, Spinner } from '@heroui/react';
import { apiUrl } from '@/config/base';

interface PaymentStatusCheckerProps {
  paymentId: string;
  onPaymentSuccess?: (data: any) => void;
  onPaymentFailed?: (data: any) => void;
  onTimeout?: () => void;
  autoStart?: boolean;
  className?: string;
}

interface PaymentCheckResponse {
  code: string;
  desc: string;
  data: {
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
    orderCode: string;
    amount: number;
    [key: string]: any;
  };
}

enum PaymentStatus {
  IDLE = 'IDLE',
  CHECKING = 'CHECKING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  ERROR = 'ERROR'
}

const PaymentStatusChecker: React.FC<PaymentStatusCheckerProps> = ({
  paymentId,
  onPaymentSuccess,
  onPaymentFailed,
  onTimeout,
  autoStart = true,
  className = ''
}) => {
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.IDLE);
  const [attempts, setAttempts] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [currentInterval, setCurrentInterval] = useState(5000); // Start with 5 seconds
  
  // Configuration
  const MAX_ATTEMPTS = 36; // 3 minutes total
  const MIN_INTERVAL = 5000; // 5 seconds
  const MAX_INTERVAL = 30000; // 30 seconds
  const BACKOFF_MULTIPLIER = 1.2;
  
  // Refs for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Timer for elapsed time display
  useEffect(() => {
    if (status === PaymentStatus.CHECKING) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  // Format elapsed time
  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // API call to check payment status
  const checkPaymentStatus = useCallback(async (): Promise<PaymentCheckResponse | null> => {
    try {
      const response = await fetch(`${apiUrl}/api/payos/${paymentId}/check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaymentCheckResponse = await response.json();
      setLastCheckTime(new Date());
      
      return data;
    } catch (error) {
      console.error('Payment check failed:', error);
      return null;
    }
  }, [paymentId]);

  // Handle payment status response
  const handlePaymentResponse = useCallback((data: PaymentCheckResponse) => {
    const paymentStatus = data.data?.status;
    
    switch (paymentStatus) {
      case 'PAID':
        setStatus(PaymentStatus.SUCCESS);
        onPaymentSuccess?.(data);
        break;
        
      case 'CANCELLED':
      case 'EXPIRED':
        setStatus(PaymentStatus.FAILED);
        onPaymentFailed?.(data);
        break;
        
      case 'PENDING':
        // Continue checking
        scheduleNextCheck();
        break;
        
      default:
        console.warn('Unknown payment status:', paymentStatus);
        scheduleNextCheck();
    }
  }, [onPaymentSuccess, onPaymentFailed]);

  // Schedule next check with exponential backoff
  const scheduleNextCheck = useCallback(() => {
    if (!isActiveRef.current) return;
    
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    if (newAttempts >= MAX_ATTEMPTS) {
      setStatus(PaymentStatus.TIMEOUT);
      onTimeout?.();
      return;
    }
    
    // Calculate next interval with exponential backoff
    const nextInterval = Math.min(
      currentInterval * BACKOFF_MULTIPLIER,
      MAX_INTERVAL
    );
    setCurrentInterval(nextInterval);
    
    timeoutRef.current = setTimeout(() => {
      if (isActiveRef.current) {
        performCheck();
      }
    }, nextInterval);
  }, [attempts, currentInterval, onTimeout]);

  // Perform the actual check
  const performCheck = useCallback(async () => {
    if (!isActiveRef.current) return;
    
    const response = await checkPaymentStatus();
    
    if (!response) {
      // API call failed, retry
      scheduleNextCheck();
      return;
    }
    
    if (response.code !== '00') {
      // PayOS API returned error
      console.warn('PayOS API error:', response.desc);
      scheduleNextCheck();
      return;
    }
    
    handlePaymentResponse(response);
  }, [checkPaymentStatus, handlePaymentResponse, scheduleNextCheck]);

  // Start checking
  const startChecking = useCallback(() => {
    if (status === PaymentStatus.CHECKING) return;
    
    setStatus(PaymentStatus.CHECKING);
    setAttempts(0);
    setTimeElapsed(0);
    setCurrentInterval(MIN_INTERVAL);
    isActiveRef.current = true;
    
    // Start immediately
    performCheck();
  }, [status, performCheck, MIN_INTERVAL]);

  // // Stop checking
  // const stopChecking = useCallback(() => {
  //   isActiveRef.current = false;
  //   setStatus(PaymentStatus.IDLE);
    
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //     timeoutRef.current = null;
  //   }
  // }, []);

  // Manual check
  const manualCheck = useCallback(async () => {
    setStatus(PaymentStatus.CHECKING);
    const response = await checkPaymentStatus();
    
    if (!response) {
      setStatus(PaymentStatus.ERROR);
      return;
    }
    
    if (response.code !== '00') {
      setStatus(PaymentStatus.ERROR);
      return;
    }
    
    handlePaymentResponse(response);
  }, [checkPaymentStatus, handlePaymentResponse]);

  // Auto start
  useEffect(() => {
    if (autoStart && paymentId && status === PaymentStatus.IDLE) {
      startChecking();
    }
  }, [autoStart, paymentId, startChecking, status]);

  // Render status message
  const renderStatusMessage = () => {
    switch (status) {
      case PaymentStatus.CHECKING:
        return (
          <div className="flex items-center space-x-2">
            <Spinner size="sm" color="primary" />
            <div className="text-sm">
              <p className="text-gray-600">Checking payment status...</p>
              <p className="text-xs text-gray-500">
                Attempt {attempts + 1}/{MAX_ATTEMPTS} • {formatElapsedTime(timeElapsed)}
              </p>
              {lastCheckTime && (
                <p className="text-xs text-gray-400">
                  Last checked: {lastCheckTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        );
        
      case PaymentStatus.SUCCESS:
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-medium">Payment successful!</p>
              <p className="text-xs text-gray-500">Redirecting...</p>
            </div>
          </div>
        );
        
      case PaymentStatus.FAILED:
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <X className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-medium">Payment failed or cancelled</p>
            </div>
          </div>
        );
        
      case PaymentStatus.TIMEOUT:
        return (
          <div className="flex items-center space-x-2 text-yellow-600">
            <Clock className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-medium">Auto-check timeout</p>
              <p className="text-xs text-gray-500">Please check manually</p>
            </div>
          </div>
        );
        
      case PaymentStatus.ERROR:
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-medium">Check failed</p>
              <p className="text-xs text-gray-500">Please try again</p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-sm text-gray-500">
            <p>Ready to check payment status</p>
          </div>
        );
    }
  };

  return (
    <div className={`p-4 bg-gray-50 rounded-lg border ${className}`}>
      <div className="space-y-3">
        {renderStatusMessage()}
        
        <div className="flex space-x-2">
          {status === PaymentStatus.IDLE && (
            <Button
              size="sm"
              color="primary"
              onPress={startChecking}
              startContent={<Clock className="w-4 h-4" />}
            >
              Start Auto Check
            </Button>
          )}
          
          {/* {status === PaymentStatus.CHECKING && (
            <Button
              size="sm"
              color="danger"
              variant="bordered"
              onPress={stopChecking}
            >
              Stop Checking
            </Button>
          )} */}
          
          {(status === PaymentStatus.TIMEOUT || 
            status === PaymentStatus.ERROR || 
            status === PaymentStatus.IDLE) && (
            <Button
              size="sm"
              color="primary"
              variant="bordered"
              onPress={manualCheck}
              startContent={<RefreshCw className="w-4 h-4" />}
            //   isLoading={status === PaymentStatus.CHECKING}
            >
              Check Now
            </Button>
          )}
        </div>
        
        {/* Progress indicator */}
        {status === PaymentStatus.CHECKING && (
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${(attempts / MAX_ATTEMPTS) * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusChecker;