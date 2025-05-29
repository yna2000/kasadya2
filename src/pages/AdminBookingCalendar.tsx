
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/contexts/BookingContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CalendarCheck, CalendarMinus, AlertCircle, CheckCircle, XCircle, CreditCard, DollarSign, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminBookingCalendar = () => {
  const { bookings, getBookedDates, getBookingsByDate, updateBookingStatus, updatePaymentStatus } = useBooking();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [dateBookings, setDateBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  });

  // Load booked dates when component mounts
  useEffect(() => {
    if (bookings.length > 0) {
      const dates = getBookedDates();
      setBookedDates(dates);
      
      // Calculate booking stats
      setBookingStats({
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        completed: bookings.filter(b => b.status === 'completed').length
      });
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
  const isDateBooked = (date: Date) => {
    return bookedDates.some(
      bookedDate => format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  // Function to get the number of bookings for a date
  const getBookingCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return getBookingsByDate(dateStr).length;
  };

  // Render functions for calendar UI
  const renderDay = (day: Date) => {
    const isBooked = isDateBooked(day);
    const count = getBookingCount(day);
    
    return (
      <div className="relative flex flex-col items-center justify-center">
        <div className={isBooked ? 'z-10 relative' : ''}>{day.getDate()}</div>
        {isBooked && (
          <>
            <div className="absolute inset-0 bg-red-500 opacity-30 rounded-full" />
            {count > 0 && (
              <span className="absolute bottom-0 right-0 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center z-20">
                {count}
              </span>
            )}
          </>
        )}
      </div>
    );
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = (bookingId, status) => {
    updateBookingStatus(bookingId, status);
    setIsDialogOpen(false);
  };

  const handleUpdatePaymentStatus = (bookingId, paymentStatus) => {
    updatePaymentStatus(bookingId, paymentStatus);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-4 w-4 mr-1" />
            Pending
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 mr-1" />
            Confirmed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="h-4 w-4 mr-1" />
            Cancelled
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            <CalendarCheck className="h-4 w-4 mr-1" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case 'unpaid':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4 mr-1" />
            Unpaid
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            <CreditCard className="h-4 w-4 mr-1" />
            Partial
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
            <DollarSign className="h-4 w-4 mr-1" />
            Paid
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {paymentStatus}
          </Badge>
        );
    }
  };

  const getPaymentMethodBadge = (method) => {
    switch (method) {
      case 'gcash':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">GCash</Badge>;
      case 'maya':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Maya</Badge>;
      case 'bank':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Bank Transfer</Badge>;
      case 'cash':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cash</Badge>;
      default:
        return <Badge variant="outline">{method || 'Not specified'}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Booking Calendar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-4">
                <CalendarCheck className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{bookingStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100 mr-4">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{bookingStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{bookingStats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Booking Calendar</CardTitle>
            <CardDescription>Red dates have bookings scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border rounded-md pointer-events-auto"
              components={{
                DayContent: ({ date }) => renderDay(date),
              }}
            />
            <div className="mt-4 flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 opacity-50 rounded-full"></div>
              <span className="text-sm">Has Bookings</span>
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
                <CalendarMinus className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-lg font-medium text-gray-500">No bookings for this date</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dateBookings.map((booking, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{booking.name}</div>
                        <div className="text-sm text-muted-foreground">{booking.email}</div>
                      </TableCell>
                      <TableCell>{booking.serviceName}</TableCell>
                      <TableCell>{booking.time || 'Not specified'}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getPaymentBadge(booking.paymentStatus)}
                          {booking.paymentMethod && (
                            <div className="mt-1">{getPaymentMethodBadge(booking.paymentMethod)}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBooking(booking)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription>
                  Manage booking status and payment information
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="font-medium">Client:</p>
                  <p className="col-span-3">{selectedBooking.name}</p>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="font-medium">Service:</p>
                  <p className="col-span-3">{selectedBooking.serviceName}</p>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="font-medium">Date:</p>
                  <p className="col-span-3">{selectedBooking.date}</p>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="font-medium">Time:</p>
                  <p className="col-span-3">{selectedBooking.time || 'Not specified'}</p>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="font-medium">Amount:</p>
                  <p className="col-span-3">₱{selectedBooking.amount?.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="font-medium">Status:</p>
                  <div className="col-span-3">{getStatusBadge(selectedBooking.status)}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <p className="font-medium">Payment:</p>
                  <div className="col-span-3">
                    {getPaymentBadge(selectedBooking.paymentStatus)}
                    {selectedBooking.paymentMethod && (
                      <div className="mt-1">{getPaymentMethodBadge(selectedBooking.paymentMethod)}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'pending')}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Pending
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="border-green-500 text-green-700 hover:bg-green-50"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="border-blue-500 text-blue-700 hover:bg-blue-50"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                  >
                    <CalendarCheck className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="border-red-500 text-red-700 hover:bg-red-50"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
                
                <h4 className="font-medium mb-2">Update Payment</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="border-red-500 text-red-700 hover:bg-red-50"
                    onClick={() => handleUpdatePaymentStatus(selectedBooking.id, 'unpaid')}
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Unpaid
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="border-amber-500 text-amber-700 hover:bg-amber-50"
                    onClick={() => handleUpdatePaymentStatus(selectedBooking.id, 'partial')}
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Partial
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => handleUpdatePaymentStatus(selectedBooking.id, 'paid')}
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Paid
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookingCalendar;
