
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Calendar, Clock, MapPin, User, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

interface BookingConfirmationProps {
  bookingDetails: {
    vendorName: string;
    serviceName: string;
    date: Date | string;
    time: string;
    amount: number;
    paymentMethod: string;
    userName: string;
    location: string;
    bookingId: string;
  };
  onDone: () => void;
}

const BookingConfirmation = ({ bookingDetails, onDone }: BookingConfirmationProps) => {
  const formattedDate = typeof bookingDetails.date === 'string' 
    ? bookingDetails.date 
    : format(bookingDetails.date, 'PPP');
    
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-2xl font-bold">Booking Successful!</h3>
        <p className="text-gray-500 mt-1">Your booking has been confirmed</p>
      </div>
      
      <Card className="p-6 border-green-200 bg-green-50">
        <h4 className="font-medium text-lg mb-4 text-center">Booking Details</h4>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <div className="font-medium">Booking ID</div>
            <div>{bookingDetails.bookingId}</div>
          </div>
          
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Customer</div>
              <div>{bookingDetails.userName}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Date</div>
              <div>{formattedDate}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Time</div>
              <div>{bookingDetails.time}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div>{bookingDetails.location}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <div className="text-sm text-gray-500">Payment</div>
              <div className="font-semibold">₱{bookingDetails.amount.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Via {bookingDetails.paymentMethod}</div>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-600">
        <p className="font-medium">What's Next?</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>A confirmation email has been sent to your registered email address</li>
          <li>The vendor will contact you shortly to discuss further details</li>
          <li>You can view and manage your bookings in your dashboard</li>
          <li>For any questions, please contact our support team</li>
        </ul>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={onDone}
          className="bg-kasadya-purple hover:bg-kasadya-deep-purple px-8"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
