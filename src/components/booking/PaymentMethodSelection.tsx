
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, DollarSign, Building, Wallet, Loader2 } from 'lucide-react';

interface PaymentMethodSelectionProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onContinue?: () => void;
  isProcessing?: boolean;
}

const PaymentMethodSelection = ({ 
  selectedMethod, 
  onMethodChange,
  onContinue,
  isProcessing = false
}: PaymentMethodSelectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Payment Method</h3>
      
      <RadioGroup value={selectedMethod} onValueChange={onMethodChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
          selectedMethod === 'gcash' ? 'border-blue-500 shadow-md bg-blue-50' : 'border-gray-200'
        }`}>
          <CardContent className="p-4">
            <RadioGroupItem value="gcash" id="gcash" className="sr-only" />
            <Label htmlFor="gcash" className="flex items-center gap-2 cursor-pointer">
              <div className={`p-2 rounded-full ${selectedMethod === 'gcash' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Wallet className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">GCash</div>
                <p className="text-sm text-muted-foreground">Pay using your GCash account</p>
              </div>
              {selectedMethod === 'gcash' && (
                <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </Label>
          </CardContent>
        </Card>

        <Card className={`border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
          selectedMethod === 'maya' ? 'border-green-500 shadow-md bg-green-50' : 'border-gray-200'
        }`}>
          <CardContent className="p-4">
            <RadioGroupItem value="maya" id="maya" className="sr-only" />
            <Label htmlFor="maya" className="flex items-center gap-2 cursor-pointer">
              <div className={`p-2 rounded-full ${selectedMethod === 'maya' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <CreditCard className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Maya</div>
                <p className="text-sm text-muted-foreground">Pay using your Maya account</p>
              </div>
              {selectedMethod === 'maya' && (
                <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </Label>
          </CardContent>
        </Card>

        <Card className={`border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
          selectedMethod === 'bank' ? 'border-indigo-500 shadow-md bg-indigo-50' : 'border-gray-200'
        }`}>
          <CardContent className="p-4">
            <RadioGroupItem value="bank" id="bank" className="sr-only" />
            <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer">
              <div className={`p-2 rounded-full ${selectedMethod === 'bank' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                <Building className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Bank Transfer</div>
                <p className="text-sm text-muted-foreground">Pay via bank transfer</p>
              </div>
              {selectedMethod === 'bank' && (
                <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </Label>
          </CardContent>
        </Card>

        <Card className={`border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
          selectedMethod === 'cash' ? 'border-gray-500 shadow-md bg-gray-50' : 'border-gray-200'
        }`}>
          <CardContent className="p-4">
            <RadioGroupItem value="cash" id="cash" className="sr-only" />
            <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
              <div className={`p-2 rounded-full ${selectedMethod === 'cash' ? 'bg-gray-300' : 'bg-gray-100'}`}>
                <DollarSign className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Cash</div>
                <p className="text-sm text-muted-foreground">Pay in cash</p>
              </div>
              {selectedMethod === 'cash' && (
                <div className="h-5 w-5 rounded-full bg-gray-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </Label>
          </CardContent>
        </Card>
      </RadioGroup>

      {onContinue && (
        <div className="mt-6">
          <Button 
            onClick={onContinue}
            disabled={!selectedMethod || isProcessing}
            className="w-full bg-kasadya-purple hover:bg-kasadya-deep-purple"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : (
              `Continue with ${selectedMethod ? selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1) : 'Payment'}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelection;
