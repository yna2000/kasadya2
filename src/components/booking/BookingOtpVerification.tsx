
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface BookingOtpVerificationProps {
  onVerified: () => void;
  onCancel: () => void;
  email?: string;
}

const BookingOtpVerification = ({ onVerified, onCancel, email }: BookingOtpVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Clean up the timer
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleVerify = () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // In a real app, this would verify with a server
    // For demo purposes, we'll use the mock OTP "123456"
    setTimeout(() => {
      if (otp === "123456") {
        toast({
          title: "Verification Successful",
          description: "Your booking is being processed",
        });
        onVerified();
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid OTP code. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleResendOtp = () => {
    // Reset timer
    setTimeLeft(60);
    
    // Restart countdown
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    toast({
      title: "OTP Resent",
      description: "A new verification code has been sent to your email",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium">Verify Your Booking</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the 6-digit code sent to {email || "your email"}
        </p>
      </div>

      <div className="flex justify-center py-4">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      
      <div className="mt-2">
        <p className="text-center text-sm text-muted-foreground">
          For demo purposes, use the code: <strong>123456</strong>
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleVerify} 
          className="bg-kasadya-purple hover:bg-kasadya-deep-purple"
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify & Book"}
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Didn't receive the code?{" "}
        {timeLeft > 0 ? (
          <span>Resend in {timeLeft} seconds</span>
        ) : (
          <Button 
            variant="link" 
            className="p-0 h-auto text-blue-500 hover:text-blue-700"
            onClick={handleResendOtp}
          >
            Resend code
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookingOtpVerification;
