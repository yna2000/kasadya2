import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBooking } from '@/contexts/BookingContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, CalendarMinus, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BookingCalendar = () => {
  const { bookings, getBookedDates, getBookingsByDate, isDateAvailable } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [dateBookings, setDateBookings] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  // Load booked dates when component mounts
  useEffect(() => {
    if (bookings.length > 0) {
      const dates = getBookedDates();
      setBookedDates(dates);
    }
  }, [bookings, getBookedDates]);

  // Update bookings for selected date when date changes
  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const bookingsForDate = getBookingsByDate(dateStr);
      setDateBookings(bookingsForDate);
    }
  }, [selectedDate, getBookingsByDate]);

  // Function to determine if a date is booked
  const isDateUnavailable = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // If filtering by vendor, check only that vendor's bookings
    if (selectedVendorId) {
      return !isDateAvailable(dateStr, selectedVendorId);
    }
    
    // Otherwise check all bookings
    return bookedDates.some(
      bookedDate => format(bookedDate, 'yyyy-MM-dd') === dateStr
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Booking Calendar</h1>
      
      <Alert className="mb-6 bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          Check date availability before making a booking. Red dates are already booked and unavailable.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select a Date</CardTitle>
            <CardDescription>Red dates are already booked</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border rounded-md pointer-events-auto"
              modifiers={{
                booked: bookedDates,
              }}
              modifiersStyles={{
                booked: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
              }}
              disabled={(date) => {
                // Disable past dates
                if (date < new Date()) return true;
                return false;
              }}
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 opacity-50 rounded-full"></div>
                <span className="text-sm">Booked Date</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 opacity-50 rounded-full"></div>
                <span className="text-sm">Past Date (Unavailable)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              Bookings for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
            </CardTitle>
            <CardDescription>
              {dateBookings.length === 0 
                ? 'No bookings for this date' 
                : `${dateBookings.length} booking(s) scheduled`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dateBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6">
                <CalendarCheck className="h-12 w-12 text-green-500 mb-2" />
                <p className="text-lg font-medium">This date is available for booking!</p>
                {user && (
                  <Button 
                    className="mt-4 bg-kasadya-purple hover:bg-kasadya-deep-purple"
                    onClick={() => navigate('/vendors')}
                  >
                    Find vendors for this date
                  </Button>
                )}
                {!user && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      You need to be logged in to make a booking
                    </p>
                    <Button 
                      onClick={() => navigate('/login')}
                      className="bg-kasadya-purple hover:bg-kasadya-deep-purple"
                    >
                      Log in to book
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {dateBookings.map((booking, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{booking.serviceName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.vendorName}
                        </p>
                        <p className="text-sm">
                          Time: {booking.time || 'Not specified'}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          booking.status === 'confirmed' ? 'secondary' : 
                          booking.status === 'pending' ? 'outline' : 
                          booking.status === 'cancelled' ? 'destructive' : 
                          'default'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                <Alert className="bg-amber-50 border-amber-200 mt-4">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <AlertDescription className="text-amber-700">
                    This date has existing bookings. Some vendors might be unavailable.
                  </AlertDescription>
                </Alert>
                
                {user && (
                  <Button 
                    className="mt-2 w-full bg-kasadya-purple hover:bg-kasadya-deep-purple"
                    onClick={() => navigate('/vendors')}
                  >
                    Check available vendors
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingCalendar;
