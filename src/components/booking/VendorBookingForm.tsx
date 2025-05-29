
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Shield, Info, Check, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import TermsAndConditionsModal from '@/components/modals/TermsAndConditionsModal';

const bookingSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string().min(1, { message: 'Please select a time' }),
  notes: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface VendorBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: {
    id: string;
    name: string;
    category: string;
    location: string;
    image: string;
  };
  service?: string;
  onSubmit?: (data: BookingFormData) => void;
}

const VendorBookingForm = ({ 
  isOpen, 
  onClose, 
  vendor, 
  service = vendor?.category,
  onSubmit 
}: VendorBookingFormProps) => {
  const { user } = useAuth();
  const { isDateAvailable } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingProgress, setBookingProgress] = useState(25);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Check if user has already accepted terms
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return localStorage.getItem('termsAccepted') === 'true';
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      notes: '',
      agreeToTerms: termsAccepted, // Pre-set if already accepted
    },
  });

  // Function to check if a date is already booked for this vendor
  const isDateBooked = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return !isDateAvailable(dateStr, vendor.id);
  };

  const handleSubmit = (data: BookingFormData) => {
    // Verify user is approved before allowing booking
    if (user && !user.isVerified) {
      toast({
        title: 'Account Not Verified',
        description: 'Your account must be verified by an admin before you can make bookings. Please check back later.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Check if the date is available before proceeding
    const dateStr = format(data.date, 'yyyy-MM-dd');
    const dateAvailable = isDateAvailable(dateStr, vendor.id);
    
    if (!dateAvailable) {
      form.setError('date', { 
        type: 'manual',
        message: 'This date is already booked for this vendor. Please select another date.'
      });
      setIsSubmitting(false);
      return;
    }

    // Store terms acceptance in localStorage
    if (data.agreeToTerms) {
      localStorage.setItem('termsAccepted', 'true');
      localStorage.setItem('termsAcceptedDate', new Date().toISOString());
    }

    // Update booking progress
    setBookingProgress(50);

    // If we have an onSubmit callback, call it with the form data
    if (onSubmit) {
      onSubmit(data);
    }
    
    setIsSubmitting(false);
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
  };

  const handleTermsAccepted = () => {
    setTermsAccepted(true);
    form.setValue('agreeToTerms', true);
    setShowTermsModal(false);
  };

  // Available time slots
  const timeSlots = [];
  for (let hour = 8; hour <= 20; hour++) {
    const hourFormat = hour > 12 ? (hour - 12) : hour;
    const amPm = hour >= 12 ? 'PM' : 'AM';
    timeSlots.push(`${hourFormat}:00 ${amPm}`);
    if (hour < 20) {
      timeSlots.push(`${hourFormat}:30 ${amPm}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Progress value={bookingProgress} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground text-center">Booking Progress</p>
        
        <div className="flex items-center mb-2 mt-4">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
            <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-medium">{vendor.name}</h3>
            <p className="text-sm text-gray-500">{service}</p>
          </div>
        </div>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Dates already booked for this vendor will appear disabled in the calendar.
        </AlertDescription>
      </Alert>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
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
                      initialFocus
                      disabled={(date) => {
                        // Disable past dates
                        if (date < new Date()) return true;
                        // Disable dates that are already booked
                        return isDateBooked(date);
                      }}
                      className="pointer-events-auto"
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
                <FormLabel>Time</FormLabel>
                <FormControl>
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
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requests (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Any special requirements or notes for the vendor" 
                    rows={3}
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
            <span>Your booking information is secure and protected</span>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-kasadya-purple hover:bg-kasadya-deep-purple"
              disabled={isSubmitting || !form.getValues().agreeToTerms}
            >
              {isSubmitting ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccepted}
      />
    </div>
  );
};

export default VendorBookingForm;
