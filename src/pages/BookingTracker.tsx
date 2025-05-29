
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, CreditCard, Check, Banknote, FileText, User, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const BookingTracker = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { getBookingById } = useBooking();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any | null>(null);

  useEffect(() => {
    if (bookingId) {
      const foundBooking = getBookingById(bookingId);
      if (foundBooking) {
        setBooking(foundBooking);
      }
    }
  }, [bookingId, getBookingById]);

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <p className="mb-6">The booking you are looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Calculate booking status progress
  const getBookingProgress = () => {
    switch(booking.status) {
      case 'pending': return 25;
      case 'confirmed': return booking.paymentStatus === 'paid' ? 75 : 50;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  // Calculate payment status progress
  const getPaymentProgress = () => {
    switch(booking.paymentStatus) {
      case 'unpaid': return 0;
      case 'partial': 
        const amountPaid = booking.amountPaid || 0;
        return Math.round((amountPaid / booking.amount) * 100);
      case 'paid': return 100;
      default: return 0;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
          <p className="text-gray-500">Track the status of your booking and payment</p>
        </div>

        <div className="space-y-8">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Booking Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={
                    booking.status === 'completed' ? "bg-green-500" :
                    booking.status === 'confirmed' ? "bg-blue-500" :
                    booking.status === 'pending' ? "bg-yellow-500" :
                    "bg-red-500"
                  }>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
                <Progress value={getBookingProgress()} />
                <div className="grid grid-cols-4 text-xs text-center">
                  <div className={booking.status !== 'cancelled' ? "text-kasadya-purple" : "text-gray-400"}>Pending</div>
                  <div className={['confirmed', 'completed'].includes(booking.status) ? "text-kasadya-purple" : "text-gray-400"}>Confirmed</div>
                  <div className={booking.paymentStatus === 'paid' ? "text-kasadya-purple" : "text-gray-400"}>Paid</div>
                  <div className={booking.status === 'completed' ? "text-kasadya-purple" : "text-gray-400"}>Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="font-bold">₱{booking.amount.toLocaleString()}</span>
                </div>
                {booking.amountPaid !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Amount Paid:</span>
                    <span>₱{(booking.amountPaid || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Payment Status:</span>
                  <Badge className={
                    booking.paymentStatus === 'paid' ? "bg-green-500" :
                    booking.paymentStatus === 'partial' ? "bg-yellow-500" :
                    "bg-red-500"
                  }>
                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <Progress value={getPaymentProgress()} />
                {booking.paymentMethod && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Payment Method:</span>
                    <div className="flex items-center">
                      {booking.paymentMethod === 'gcash' ? (
                        <img src="/images/gcash-logo.png" alt="GCash" className="w-6 h-6 mr-2" />
                      ) : booking.paymentMethod === 'maya' ? (
                        <img src="/images/maya-logo.png" alt="Maya" className="w-6 h-6 mr-2" />
                      ) : booking.paymentMethod === 'bank' ? (
                        <Banknote size={16} className="mr-2" />
                      ) : (
                        <CreditCard size={16} className="mr-2" />
                      )}
                      {booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Booking Details</TabsTrigger>
              <TabsTrigger value="vendor" className="flex-1">Vendor Information</TabsTrigger>
              <TabsTrigger value="payment" className="flex-1">Payment History</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <dl className="space-y-4">
                    <div className="flex items-start">
                      <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                        <Calendar size={16} className="mr-2" />
                        Date:
                      </dt>
                      <dd>{formatDate(booking.date)}</dd>
                    </div>
                    <div className="flex items-start">
                      <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                        <Clock size={16} className="mr-2" />
                        Time:
                      </dt>
                      <dd>{booking.time}</dd>
                    </div>
                    <div className="flex items-start">
                      <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                        <FileText size={16} className="mr-2" />
                        Service:
                      </dt>
                      <dd>{booking.serviceName}</dd>
                    </div>
                    <div className="flex items-start">
                      <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                        <User size={16} className="mr-2" />
                        Booked by:
                      </dt>
                      <dd>{booking.name}</dd>
                    </div>
                    <div className="flex items-start">
                      <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                        <MapPin size={16} className="mr-2" />
                        Location:
                      </dt>
                      <dd>{booking.serviceDescription || "Not specified"}</dd>
                    </div>
                    {booking.notes && (
                      <div className="flex items-start">
                        <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                          <FileText size={16} className="mr-2" />
                          Notes:
                        </dt>
                        <dd>{booking.notes}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="vendor" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <dl className="space-y-4">
                    <div className="flex items-start">
                      <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                        <User size={16} className="mr-2" />
                        Vendor:
                      </dt>
                      <dd>{booking.vendorName}</dd>
                    </div>
                    <div className="flex items-start">
                      <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                        <FileText size={16} className="mr-2" />
                        Category:
                      </dt>
                      <dd>{booking.serviceId || "Not specified"}</dd>
                    </div>
                    <div className="flex items-start">
                      <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                        <FileText size={16} className="mr-2" />
                        Contact:
                      </dt>
                      <dd>Contact vendor through the app messaging</dd>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <Button className="bg-kasadya-purple hover:bg-kasadya-deep-purple">
                      Contact Vendor
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="payment" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  {booking.paymentStatus === 'unpaid' ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No payment has been made yet.</p>
                      <Button className="mt-4 bg-kasadya-purple hover:bg-kasadya-deep-purple">
                        Make Payment
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="border-b pb-4">
                        <h4 className="font-medium">Payment Information</h4>
                        <dl className="mt-4 space-y-4">
                          <div className="flex items-start">
                            <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                              <CreditCard size={16} className="mr-2" />
                              Method:
                            </dt>
                            <dd>{booking.paymentMethod || "Not specified"}</dd>
                          </div>
                          <div className="flex items-start">
                            <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                              <Calendar size={16} className="mr-2" />
                              Date:
                            </dt>
                            <dd>{booking.paymentDate ? formatDate(booking.paymentDate) : "Not available"}</dd>
                          </div>
                          <div className="flex items-start">
                            <dt className="w-36 flex items-center text-sm font-medium text-gray-500">
                              <Check size={16} className="mr-2" />
                              Status:
                            </dt>
                            <dd>
                              <Badge className={
                                booking.paymentStatus === 'paid' ? "bg-green-500" :
                                booking.paymentStatus === 'partial' ? "bg-yellow-500" :
                                "bg-red-500"
                              }>
                                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                              </Badge>
                            </dd>
                          </div>
                        </dl>
                      </div>

                      {booking.paymentStatus === 'partial' && (
                        <div className="mt-4">
                          <h4 className="font-medium">Remaining Balance</h4>
                          <div className="mt-2 flex items-center justify-between">
                            <span>₱{(booking.amount - (booking.amountPaid || 0)).toLocaleString()}</span>
                            <Button className="bg-kasadya-purple hover:bg-kasadya-deep-purple">
                              Pay Remaining Balance
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            {booking.status !== 'cancelled' && (
              <Button variant="destructive">
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTracker;
