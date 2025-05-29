
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Shield, Info, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import BookingOtpVerification from './BookingOtpVerification';
import TermsAndConditionsModal from '@/components/modals/TermsAndConditionsModal';

interface BookingFormProps {
  vendorId: string;
  vendorName: string;
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  amount: number;
  onSuccess?: () => void;
}

const bookingSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, { message: "Please select a time" }),
  notes: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingForm: React.FC<BookingFormProps> = ({
  vendorId,
  vendorName,
  serviceId,
  serviceName,
  serviceDescription,
  amount,
  onSuccess,
}) => {
  const { createBooking } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);

  // Check if user has already accepted terms
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return localStorage.getItem('termsAccepted') === 'true';
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      notes: '',
      agreeToTerms: termsAccepted, // Pre-set if already accepted
    }
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!isAuthenticated || !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to book this service',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    // Verify user is approved before allowing booking
    if (!user.isVerified) {
      toast({
        title: 'Account Not Verified',
        description: 'Your account must be verified by an admin before you can make bookings. Please check back later.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Store booking data and trigger OTP verification
      setBookingData(data);
      setShowOtpVerification(true);

      // Simulate sending OTP
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${user.email}`,
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: 'There was a problem creating your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerified = async () => {
    if (!bookingData || !user) return;
    
    // Add all required fields to match the Booking interface
    const success = await createBooking({
      userId: user.id,
      vendorId,
      vendorName,
      serviceId,
      serviceName,
      serviceDescription,
      date: bookingData.date.toISOString().split('T')[0],
      time: bookingData.time,
      amount,
      notes: bookingData.notes || '',
      // Add the missing properties required by the Booking interface
      name: user.name,
      email: user.email,
      roomType: serviceName, // Using serviceName as roomType
      checkInDate: bookingData.date.toISOString().split('T')[0],
      checkOutDate: bookingData.date.toISOString().split('T')[0], // Same as checkInDate for non-hotel services
      totalPrice: amount,
    });

    if (success) {
      setShowOtpVerification(false);
      toast({
        title: "Booking Confirmed",
        description: "Your booking has been successfully confirmed!",
      });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleCancelOtp = () => {
    setShowOtpVerification(false);
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
  };

  const handleTermsAccepted = () => {
    setTermsAccepted(true);
    form.setValue('agreeToTerms', true);
    setShowTermsModal(false);
  };

  // Generate time slot options
  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    const hourFormat = hour > 12 ? (hour - 12) : hour;
    const amPm = hour >= 12 ? 'PM' : 'AM';
    timeSlots.push(`${hourFormat}:00 ${amPm}`);
    if (hour < 18) {
      timeSlots.push(`${hourFormat}:30 ${amPm}`);
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-kasadya-purple" />
          Book This Service
        </h2>
        <div className="mb-6">
          <p className="font-medium">{serviceName}</p>
          <p className="text-sm text-gray-600 mb-2">{serviceDescription}</p>
          <p className="text-lg font-semibold text-kasadya-purple">₱{amount.toLocaleString()}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => 
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Time</FormLabel>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests or Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any special requirements or questions here..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium leading-none">
                      I agree to the{" "}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-500 hover:text-blue-700"
                        onClick={(e) => {
                          e.preventDefault();
                          openTermsModal();
                        }}
                      >
                        terms and conditions
                      </Button>
                    </FormLabel>
                    <p className="text-xs text-muted-foreground mt-1">
                      {termsAccepted ? "You have already accepted the terms and conditions." : "You must agree to the terms and conditions before proceeding."}
                    </p>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <Shield size={16} className="text-kasadya-purple" />
              <span>Your booking will be secured with OTP verification</span>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-kasadya-purple hover:bg-kasadya-deep-purple"
              disabled={isSubmitting || !form.getValues().agreeToTerms}
            >
              {isSubmitting ? 'Processing...' : 'Continue to Verification'}
            </Button>
          </form>
        </Form>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpVerification} onOpenChange={setShowOtpVerification}>
        <DialogContent className="sm:max-w-[500px]">
          <BookingOtpVerification 
            onVerified={handleOtpVerified} 
            onCancel={handleCancelOtp}
            email={user?.email}
          />
        </DialogContent>
      </Dialog>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccepted}
      />
    </>
  );
};

export default BookingForm;
