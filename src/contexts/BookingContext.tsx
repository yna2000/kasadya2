
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';

export interface Booking {
  id: string;
  userId: string;
  vendorId: string;
  vendorName: string;
  serviceId: string;
  serviceName: string;
  serviceDescription: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  amount: number;
  amountPaid?: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paymentMethod?: 'gcash' | 'maya' | 'bank' | 'cash';
  paymentDate?: string;
  notes: string;
  createdAt: string;
  // Properties needed by AdminDashboard
  name: string;
  email: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
}

interface BookingContextType {
  bookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'status' | 'paymentStatus' | 'createdAt'>) => Promise<Booking>;
  getUserBookings: (userId: string) => Booking[];
  getVendorBookings: (vendorId: string) => Booking[];
  getBookedDates: () => Date[];
  getBookingsByDate: (dateStr: string) => Booking[];
  isDateAvailable: (dateStr: string, vendorId?: string) => boolean;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  updatePaymentStatus: (bookingId: string, paymentStatus: Booking['paymentStatus'], paymentMethod?: Booking['paymentMethod']) => void;
  cancelBooking: (bookingId: string) => void;
  processPayment: (bookingId: string, amount: number, paymentMethod: Booking['paymentMethod']) => Promise<boolean>;
  fetchBookings: () => void;
  getBookingById: (bookingId: string) => Booking | undefined;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Load bookings from local storage on startup
  useEffect(() => {
    fetchBookings();
  }, []);

  // Save bookings to local storage when they change
  useEffect(() => {
    if (bookings.length > 0) {
      localStorage.setItem('bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  const fetchBookings = () => {
    const storedBookings = localStorage.getItem('bookings');
    if (storedBookings) {
      try {
        setBookings(JSON.parse(storedBookings));
      } catch (error) {
        console.error('Error parsing bookings from localStorage:', error);
        setBookings([]);
      }
    }
  };

  const getBookingById = (bookingId: string) => {
    return bookings.find(booking => booking.id === bookingId);
  };

  const getBookedDates = () => {
    // Convert booking dates to Date objects
    return bookings
      .filter(booking => booking.status !== 'cancelled') // Don't include cancelled bookings
      .map(booking => {
        try {
          if (!booking.date) return null;
          const dateObj = parseISO(booking.date);
          return isValid(dateObj) ? dateObj : null;
        } catch (error) {
          console.error('Invalid date format:', booking.date);
          return null;
        }
      })
      .filter(date => date !== null) as Date[];
  };

  const getBookingsByDate = (dateStr: string) => {
    return bookings.filter(booking => {
      // Handle both ISO strings and simple date formats
      try {
        return booking.date === dateStr || 
               (booking.date && format(parseISO(booking.date), 'yyyy-MM-dd') === dateStr);
      } catch (error) {
        console.error('Date comparison error:', error);
        return false;
      }
    });
  };

  const isDateAvailable = (dateStr: string, vendorId?: string) => {
    const bookingsOnDate = getBookingsByDate(dateStr);
    if (vendorId) {
      // Check if this vendor has any non-cancelled bookings on this date
      return !bookingsOnDate.some(
        booking => booking.vendorId === vendorId && booking.status !== 'cancelled'
      );
    }
    // If no vendor specified, check if there are any bookings on this date
    return bookingsOnDate.length === 0;
  };

  const processPayment = async (
    bookingId: string, 
    amount: number, 
    paymentMethod: Booking['paymentMethod'] = 'cash'
  ): Promise<boolean> => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        console.error('Booking not found:', bookingId);
        return false;
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate amount already paid (if any)
      const previouslyPaid = booking.amountPaid || 0;
      const newTotalPaid = previouslyPaid + amount;
      
      // Determine the new payment status
      let newPaymentStatus: Booking['paymentStatus'] = 'unpaid';
      if (newTotalPaid >= booking.amount) {
        newPaymentStatus = 'paid';
      } else if (newTotalPaid > 0) {
        newPaymentStatus = 'partial';
      }

      // Update the booking
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId ? { 
            ...b, 
            paymentStatus: newPaymentStatus, 
            paymentMethod,
            amountPaid: newTotalPaid,
            paymentDate: new Date().toISOString()
          } : b
        )
      );

      // Create notification for both user and vendor
      addNotification({
        userId: booking.userId,
        title: 'Payment Successful',
        message: `Your payment of ₱${amount.toLocaleString()} for ${booking.serviceName} with ${booking.vendorName} has been processed via ${paymentMethod}.`,
        type: 'payment'
      });
      
      // Add notification for the vendor
      addVendorNotification({
        vendorId: booking.vendorId,
        title: 'Payment Received',
        message: `Payment of ₱${amount.toLocaleString()} received for booking ${booking.id.slice(0, 6)}... - ${booking.serviceName} via ${paymentMethod}.`,
        type: 'payment',
        bookingId: booking.id
      });

      toast({
        title: 'Payment Successful',
        description: `Your payment of ₱${amount.toLocaleString()} has been processed via ${paymentMethod}.`,
      });

      return true;
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was a problem processing your payment. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const addVendorNotification = (notification: { 
    vendorId: string; 
    title: string; 
    message: string; 
    type: string;
    bookingId?: string;
  }) => {
    try {
      const storedNotifications = localStorage.getItem('vendorNotifications') || '[]';
      const notifications = JSON.parse(storedNotifications);
      
      // Add the new notification
      notifications.push({
        id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        vendorId: notification.vendorId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        bookingId: notification.bookingId,
        read: false,
        createdAt: new Date().toISOString()
      });
      
      // Store back to localStorage
      localStorage.setItem('vendorNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error adding vendor notification:', error);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'paymentStatus' | 'createdAt'>): Promise<Booking> => {
    // Check if date is available first
    const isAvailable = isDateAvailable(bookingData.date, bookingData.vendorId);
    if (!isAvailable) {
      toast({
        title: 'Booking Failed',
        description: 'This date is already booked for this vendor. Please select another date.',
        variant: 'destructive',
      });
      throw new Error('Date unavailable');
    }

    // Create a new booking
    const newBooking: Booking = {
      ...bookingData,
      id: `booking-${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    };

    // Add the booking to the list
    setBookings(prev => [...prev, newBooking]);

    // Create notification for the user
    addNotification({
      userId: newBooking.userId,
      title: 'Booking Received',
      message: `Your booking with ${newBooking.vendorName} for ${newBooking.serviceName} has been received and is pending confirmation.`,
      type: 'booking'
    });
    
    // Create notification for the vendor
    addVendorNotification({
      vendorId: newBooking.vendorId,
      title: 'New Booking Request',
      message: `You have received a new booking request for ${newBooking.serviceName} on ${newBooking.date} at ${newBooking.time}.`,
      type: 'booking',
      bookingId: newBooking.id
    });

    toast({
      title: 'Booking Created',
      description: 'Your booking has been successfully created and is pending confirmation.',
    });

    return newBooking;
  };

  const getUserBookings = (userId: string) => {
    return bookings
      .filter(booking => booking.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getVendorBookings = (vendorId: string) => {
    return bookings
      .filter(booking => booking.vendorId === vendorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId ? { ...b, status } : b
      )
    );

    // Create notification about the status change for the user
    addNotification({
      userId: booking.userId,
      title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your booking for ${booking.serviceName} with ${booking.vendorName} has been ${status}.`,
      type: 'booking'
    });
    
    // Add notification for the vendor
    addVendorNotification({
      vendorId: booking.vendorId,
      title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `You have updated the booking status to ${status} for ${booking.serviceName} on ${booking.date}.`,
      type: 'status',
      bookingId: booking.id
    });

    toast({
      title: 'Booking Updated',
      description: `Booking status has been updated to ${status}.`,
    });
  };

  const updatePaymentStatus = (bookingId: string, paymentStatus: Booking['paymentStatus'], paymentMethod?: Booking['paymentMethod']) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const updates: Partial<Booking> = { paymentStatus };
    
    // If paymentMethod is provided, update it
    if (paymentMethod) {
      updates.paymentMethod = paymentMethod;
    }
    
    // If marked as paid and there's no amountPaid set, set it to the full amount
    if (paymentStatus === 'paid' && !booking.amountPaid) {
      updates.amountPaid = booking.amount;
    }
    
    // If marked as unpaid, reset amountPaid
    if (paymentStatus === 'unpaid') {
      updates.amountPaid = 0;
    }
    
    // Update the booking with all changes
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId ? { ...b, ...updates } : b
      )
    );

    // Create notification about the payment status for the user
    addNotification({
      userId: booking.userId,
      title: 'Payment Status Updated',
      message: `Payment status for your booking with ${booking.vendorName} has been updated to ${paymentStatus}.`,
      type: 'payment'
    });
    
    // Add notification for the vendor
    addVendorNotification({
      vendorId: booking.vendorId,
      title: 'Payment Status Updated',
      message: `Payment status has been updated to ${paymentStatus} for booking ${booking.id.slice(0, 6)}... - ${booking.serviceName}.`,
      type: 'payment',
      bookingId: booking.id
    });

    toast({
      title: 'Payment Status Updated',
      description: `Payment status has been updated to ${paymentStatus}.`,
    });
  };

  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      )
    );

    // Create notification about cancellation for the user
    addNotification({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking for ${booking.serviceName} with ${booking.vendorName} has been cancelled.`,
      type: 'booking'
    });
    
    // Add notification for the vendor
    addVendorNotification({
      vendorId: booking.vendorId,
      title: 'Booking Cancelled',
      message: `A booking for ${booking.serviceName} on ${booking.date} has been cancelled.`,
      type: 'booking',
      bookingId: booking.id
    });

    toast({
      title: 'Booking Cancelled',
      description: 'Your booking has been cancelled.',
      variant: 'destructive',
    });
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      createBooking,
      getUserBookings,
      getVendorBookings,
      getBookedDates,
      getBookingsByDate,
      isDateAvailable,
      updateBookingStatus,
      updatePaymentStatus,
      cancelBooking,
      processPayment,
      fetchBookings,
      getBookingById,
    }}>
      {children}
    </BookingContext.Provider>
  );
};
