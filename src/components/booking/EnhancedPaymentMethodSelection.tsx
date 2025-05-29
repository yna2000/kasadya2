
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Banknote, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  logo?: string;
}

interface PaymentMethodSelectionProps {
  onSelectMethod: (method: string) => void;
  selectedMethod: string;
  onBack: () => void;
  onCancel: () => void;
  onContinue: () => void;
  isProcessing?: boolean;
}

export const EnhancedPaymentMethodSelection = ({ 
  onSelectMethod, 
  selectedMethod,
  onBack,
  onCancel,
  onContinue,
  isProcessing = false
}: PaymentMethodSelectionProps) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'gcash',
      name: 'GCash',
      icon: <Wallet size={24} />,
      description: 'Fast and secure mobile payment',
      color: 'bg-blue-500',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/GCash_Logo.png'
    },
    {
      id: 'maya',
      name: 'Maya',
      icon: <CreditCard size={24} />,
      description: 'Pay with Maya digital wallet',
      color: 'bg-green-500',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/PayMaya_Logo.png'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: <Banknote size={24} />,
      description: 'Direct bank transfer',
      color: 'bg-purple-500'
    },
    {
      id: 'cash',
      name: 'Cash',
      icon: <Banknote size={24} />,
      description: 'Pay with cash on arrival',
      color: 'bg-yellow-500'
    }
  ];

  const [amount, setAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Make sure a payment method is selected before allowing to continue
  const handleContinue = () => {
    if (selectedMethod) {
      if (selectedMethod === 'gcash' || selectedMethod === 'maya') {
        setShowPaymentDetails(true);
      } else {
        onContinue();
      }
    }
  };

  const handleSubmitPayment = () => {
    // Here we would validate inputs in a real system
    setSubmitting(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setSubmitting(false);
      if (selectedMethod && amount) {
        onContinue();
      } else {
        toast({
          title: "Payment Information Required",
          description: "Please enter all required payment details",
          variant: "destructive"
        });
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {!showPaymentDetails ? (
        <>
          <h3 className="text-lg font-medium">Select Payment Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <Card 
                key={method.id}
                className={cn(
                  "p-4 cursor-pointer transition-all border-2",
                  selectedMethod === method.id 
                    ? "border-kasadya-purple bg-purple-50" 
                    : "border-gray-200 hover:border-gray-300"
                )}
                onClick={() => onSelectMethod(method.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white",
                    method.color
                  )}>
                    {method.logo ? (
                      <img 
                        src={method.logo} 
                        alt={method.name} 
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      method.icon
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="ml-auto">
                      <div className="w-4 h-4 rounded-full bg-kasadya-purple"></div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          
          <div className="pt-4 border-t mt-6">
            <h4 className="text-sm font-medium mb-2">Payment Instructions:</h4>
            {selectedMethod === 'gcash' && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
                <p className="font-medium">GCash Payment Instructions:</p>
                <ol className="list-decimal ml-4 mt-2">
                  <li>Open your GCash app</li>
                  <li>Tap on 'Send Money'</li>
                  <li>Enter recipient number: 09XX-XXX-XXXX</li>
                  <li>Enter the exact amount</li>
                  <li>Include your booking reference in the notes</li>
                  <li>Take a screenshot of your payment confirmation</li>
                </ol>
              </div>
            )}
            {selectedMethod === 'maya' && (
              <div className="bg-green-50 border border-green-200 rounded p-4 text-sm">
                <p className="font-medium">Maya Payment Instructions:</p>
                <ol className="list-decimal ml-4 mt-2">
                  <li>Open your Maya app</li>
                  <li>Select 'Send Money'</li>
                  <li>Enter recipient account: kasadya@events.com</li>
                  <li>Enter the exact amount</li>
                  <li>Include your booking reference in the notes</li>
                  <li>Submit your payment receipt</li>
                </ol>
              </div>
            )}
            {selectedMethod === 'bank' && (
              <div className="bg-purple-50 border border-purple-200 rounded p-4 text-sm">
                <p className="font-medium">Bank Transfer Instructions:</p>
                <ol className="list-decimal ml-4 mt-2">
                  <li>Transfer to our account:</li>
                  <li>Bank: Kasadya Bank</li>
                  <li>Account Number: 1234-5678-9012</li>
                  <li>Account Name: Kasadya Events</li>
                  <li>Include your booking reference in the notes</li>
                  <li>Upload your payment slip</li>
                </ol>
              </div>
            )}
            {selectedMethod === 'cash' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
                <p className="font-medium">Cash Payment Instructions:</p>
                <ol className="list-decimal ml-4 mt-2">
                  <li>Prepare the exact amount</li>
                  <li>Pay on the event day or at our office</li>
                  <li>A receipt will be provided</li>
                  <li>Please note that a booking is only fully confirmed after payment</li>
                </ol>
              </div>
            )}
          </div>
          
          <div className="flex justify-between pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              disabled={isProcessing}
            >
              Back
            </Button>
            <div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="mr-2"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleContinue}
                disabled={!selectedMethod || isProcessing}
                className="bg-kasadya-purple hover:bg-kasadya-deep-purple"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Payment Details - {selectedMethod === 'gcash' ? 'GCash' : 'Maya'}</h3>
          
          <Alert className="bg-blue-50 border border-blue-200">
            <AlertDescription className="text-blue-700">
              Please fill in your payment details to proceed.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount to Pay (₱)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">₱</span>
                <Input 
                  id="amount" 
                  type="number" 
                  className="pl-7" 
                  placeholder="Enter amount" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="reference">Reference Number</Label>
              <Input 
                id="reference" 
                placeholder="Enter reference number from your payment" 
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                You can find this in your payment confirmation from {selectedMethod === 'gcash' ? 'GCash' : 'Maya'}.
              </p>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <p className="text-sm text-gray-700 mb-4">
                By submitting, you confirm you've sent the payment through {selectedMethod === 'gcash' ? 'GCash' : 'Maya'}.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowPaymentDetails(false)}
              disabled={submitting}
            >
              Back
            </Button>
            <div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="mr-2"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={handleSubmitPayment}
                disabled={!amount || !referenceNumber || submitting}
                className="bg-kasadya-purple hover:bg-kasadya-deep-purple"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </div>
                ) : (
                  'Submit Payment'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
