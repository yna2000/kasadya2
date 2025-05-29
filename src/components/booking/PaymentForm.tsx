
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useBooking } from '@/contexts/BookingContext';
import { toast } from '@/hooks/use-toast';
import { EnhancedPaymentMethodSelection } from './EnhancedPaymentMethodSelection';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PaymentFormProps {
  bookingId: string;
  serviceName: string;
  vendorName: string;
  totalAmount: number;
  onSuccess?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
}

const paymentSchema = z.object({
  cardName: z.string().min(3, { message: 'Name on card is required' }),
  cardNumber: z.string().regex(/^\d{16}$/, { message: 'Card number must be 16 digits' }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Format must be MM/YY' }),
  cvv: z.string().regex(/^\d{3,4}$/, { message: 'CVV must be 3 or 4 digits' }),
  amount: z.number().positive({ message: 'Amount must be positive' }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingId,
  serviceName,
  vendorName,
  totalAmount,
  onSuccess,
  onBack,
  onCancel
}) => {
  const { processPayment } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'bank' | 'cash'>('cash');
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'confirmation'>('method');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Set progress based on current step
    if (paymentStep === 'method') setProgress(33);
    else if (paymentStep === 'details') setProgress(66);
    else if (paymentStep === 'confirmation') setProgress(100);
  }, [paymentStep]);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      amount: totalAmount,
    }
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    try {
      const success = await processPayment(bookingId, data.amount, paymentMethod);
      
      if (success) {
        setPaymentStep('confirmation');
        toast({
          title: 'Payment Successful',
          description: `Your payment of ₱${data.amount.toLocaleString()} has been processed.`,
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was a problem processing your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry date with /
  const formatExpiryDate = (value: string) => {
    value = value.replace(/\D/g, '');
    if (value.length > 2) {
      return value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    return value;
  };

  // Handle simple payment method (like cash) directly without details
  const handleDirectPayment = async () => {
    setIsProcessing(true);
    try {
      // Use a short timeout to simulate processing
      setTimeout(async () => {
        const success = await processPayment(bookingId, totalAmount, paymentMethod);
        
        if (success) {
          setPaymentStep('confirmation');
          toast({
            title: 'Payment Method Selected',
            description: `You've selected ${paymentMethod} as your payment method.`,
          });
        }
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('Payment selection error:', error);
      toast({
        title: 'Process Failed',
        description: 'There was a problem processing your selection. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  // Handle continue button in payment method selection
  const handleContinueFromMethodSelection = () => {
    if (['cash', 'bank'].includes(paymentMethod)) {
      // For cash or bank transfer, skip the card details step
      handleDirectPayment();
    } else if (['gcash', 'maya'].includes(paymentMethod)) {
      // For GCash/Maya, handle in the enhanced component
      // The continue action is passed to and handled by EnhancedPaymentMethodSelection
    } else {
      // For card payments, go to details step
      setPaymentStep('details');
    }
  };

  // Handle the continue from the payment details step by the EnhancedPaymentMethodSelection component
  const handleContinueFromEnhancedSelection = async () => {
    setIsProcessing(true);
    try {
      // Use a short timeout to simulate processing
      setTimeout(async () => {
        const success = await processPayment(bookingId, totalAmount, paymentMethod);
        
        if (success) {
          setPaymentStep('confirmation');
          toast({
            title: 'Payment Successful',
            description: `Your payment via ${paymentMethod.toUpperCase()} has been processed.`,
          });
        }
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was a problem processing your payment. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (paymentStep) {
      case 'method':
        return (
          <EnhancedPaymentMethodSelection
            selectedMethod={paymentMethod}
            onSelectMethod={(method) => setPaymentMethod(method as 'gcash' | 'maya' | 'bank' | 'cash')}
            onContinue={handleContinueFromEnhancedSelection}
            onBack={() => onBack && onBack()}
            onCancel={() => onCancel && onCancel()}
            isProcessing={isProcessing}
          />
        );
        
      case 'details':
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name on Card</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="4111 1111 1111 1111"
                          maxLength={19}
                          className="pl-10"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, '');
                            if (/^\d*$/.test(value) && value.length <= 16) {
                              e.target.value = formatCardNumber(value);
                              field.onChange(value);
                            }
                          }}
                        />
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MM/YY"
                          maxLength={5}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\//g, '');
                            if (/^\d*$/.test(value) && value.length <= 4) {
                              e.target.value = formatExpiryDate(value);
                              field.onChange(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="123"
                          maxLength={4}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value) && value.length <= 4) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Payment Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₱</span>
                        <Input
                          type="number"
                          className="pl-7"
                          {...field}
                          value={value}
                          onChange={(e) => {
                            const newValue = parseFloat(e.target.value);
                            onChange(isNaN(newValue) ? 0 : newValue);
                          }}
                          min={0}
                          max={totalAmount}
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-gray-500">You can pay the full amount or make a partial payment.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPaymentStep('method')}
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-kasadya-purple hover:bg-kasadya-deep-purple"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Pay Now`
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Your payment information is secure and encrypted. We do not store your card details.
              </p>
            </form>
          </Form>
        );
        
      case 'confirmation':
        return (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-700">Payment Successful!</h3>
            <p>Thank you for your payment. Your booking has been confirmed.</p>
            <p className="font-medium">Transaction ID: {bookingId.substring(0, 8)}</p>
            
            <Button 
              onClick={onSuccess} 
              className="w-full bg-kasadya-purple hover:bg-kasadya-deep-purple mt-4"
            >
              Done
            </Button>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium">{serviceName}</p>
          <p className="text-sm text-gray-600">Provided by {vendorName}</p>
          <p className="text-lg font-semibold text-kasadya-purple mt-2">Total: ₱{totalAmount.toLocaleString()}</p>
        </div>
        
        {isProcessing && paymentStep !== 'confirmation' ? (
          <div className="flex flex-col items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-kasadya-purple mb-4" />
            <p>Processing your payment...</p>
            <p className="text-sm text-gray-500 mt-2">Please do not refresh the page.</p>
          </div>
        ) : (
          renderStepContent()
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
