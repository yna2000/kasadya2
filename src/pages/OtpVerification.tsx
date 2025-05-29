
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from '@/contexts/AuthContext';

const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Extract the email and password from location state
  const { email, password } = location.state || {};

  useEffect(() => {
    // Redirect if there's no email/password in state
    if (!email || !password) {
      navigate('/login');
      return;
    }

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
  }, [email, password, navigate]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would verify with a server
      // For demo purposes, we'll use the mock OTP "123456"
      if (otp === "123456") {
        // Get login data from localStorage
        const loginData = localStorage.getItem("pendingLogin");
        
        if (loginData) {
          const { email, password } = JSON.parse(loginData);
          
          // Perform login
          const success = await login(email, password);
          
          if (success) {
            // Clear the pendingLogin from localStorage
            localStorage.removeItem("pendingLogin");
            
            // Navigate based on user role
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user?.isAdmin) {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
            
            toast({
              title: "Success",
              description: "You have been successfully logged in",
            });
          } else {
            throw new Error("Login failed");
          }
        }
      } else {
        throw new Error("Invalid OTP code");
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid OTP code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
    <div className="container mx-auto py-12">
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Verify Your Identity</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to your email {email && <strong>{email}</strong>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <Button 
              onClick={handleVerify} 
              className="w-full" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify & Login"}
            </Button>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
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
            <Button 
              variant="ghost" 
              className="mt-2" 
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OtpVerification;
