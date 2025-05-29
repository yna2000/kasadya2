
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Edit, 
  Plus, 
  Trash2, 
  Info, 
  Package, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Bell,
  Check,
  X,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { useToast } from '@/hooks/use-toast';
import ServiceUploadForm from '@/components/vendor/ServiceUploadForm';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { bookings, updateBookingStatus, updatePaymentStatus } = useBooking();
  const [services, setServices] = useState<any[]>([]);
  const [vendorBookings, setVendorBookings] = useState<any[]>([]);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [vendorNotifications, setVendorNotifications] = useState<any[]>([]);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<any>(null);
  const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isMarkAsPaidOpen, setIsMarkAsPaidOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'bank' | 'cash'>('cash');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user && !user.isVendor) {
      toast({
        title: "Access Denied",
        description: "You need a vendor account to access this page.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [user, navigate, toast]);

  useEffect(() => {
    // Load vendor services
    const loadVendorServices = () => {
      if (user?.id) {
        try {
          const storedServices = localStorage.getItem('vendorServices');
          if (storedServices) {
            const allServices = JSON.parse(storedServices);
            const vendorServices = allServices.filter(
              (service: any) => service.vendorId === user.id
            );
            setServices(vendorServices);
          }
        } catch (error) {
          console.error('Error loading services:', error);
        }
      }
    };

    // Load bookings for the vendor
    const loadVendorBookings = () => {
      if (user?.id) {
        try {
          const storedBookings = localStorage.getItem('bookings');
          if (storedBookings) {
            const allBookings = JSON.parse(storedBookings);
            const vendorBookings = allBookings.filter(
              (booking: any) => booking.vendorId === user.id
            );
            setVendorBookings(vendorBookings);
          }
        } catch (error) {
          console.error('Error loading bookings:', error);
        }
      }
    };
    
    // Load vendor notifications
    const loadVendorNotifications = () => {
      if (user?.id) {
        try {
          const storedNotifications = localStorage.getItem('vendorNotifications');
          if (storedNotifications) {
            const allNotifications = JSON.parse(storedNotifications);
            const notifications = allNotifications.filter(
              (notification: any) => notification.vendorId === user.id
            );
            setVendorNotifications(notifications);
          }
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    };

    loadVendorServices();
    loadVendorBookings();
    loadVendorNotifications();
  }, [user, bookings]);

  const handleDeleteService = (serviceId: string) => {
    setServiceToDelete(serviceId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteService = () => {
    try {
      const storedServices = localStorage.getItem('vendorServices');
      if (storedServices && serviceToDelete) {
        const allServices = JSON.parse(storedServices);
        const updatedServices = allServices.filter(
          (service: any) => service.id !== serviceToDelete
        );
        localStorage.setItem('vendorServices', JSON.stringify(updatedServices));
        
        // Update local state
        setServices(services.filter(service => service.id !== serviceToDelete));
        
        toast({
          title: "Service Deleted",
          description: "Your service has been successfully deleted.",
        });
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete the service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const handleEditService = (service: any) => {
    setServiceToEdit(service);
    setIsEditServiceOpen(true);
  };

  const handleAddServiceSuccess = () => {
    setIsAddServiceOpen(false);
    setIsEditServiceOpen(false);
    setServiceToEdit(null);
    
    // Reload services
    try {
      const storedServices = localStorage.getItem('vendorServices');
      if (storedServices) {
        const allServices = JSON.parse(storedServices);
        const vendorServices = allServices.filter(
          (service: any) => service.vendorId === user?.id
        );
        setServices(vendorServices);
      }
    } catch (error) {
      console.error('Error reloading services:', error);
    }
  };
  
  const markNotificationAsRead = (notificationId: string) => {
    try {
      const storedNotifications = localStorage.getItem('vendorNotifications');
      if (storedNotifications) {
        const allNotifications = JSON.parse(storedNotifications);
        const updatedNotifications = allNotifications.map((notification: any) => {
          if (notification.id === notificationId) {
            return { ...notification, read: true };
          }
          return notification;
        });
        
        localStorage.setItem('vendorNotifications', JSON.stringify(updatedNotifications));
        
        // Update local state
        setVendorNotifications(vendorNotifications.map(notification => {
          if (notification.id === notificationId) {
            return { ...notification, read: true };
          }
          return notification;
        }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    updateBookingStatus(bookingId, newStatus);
    
    // Update local state
    setVendorBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
    );
    
    // Close the dialog
    setIsBookingDetailOpen(false);
    setSelectedBooking(null);
    
    toast({
      title: "Booking Updated",
      description: `Booking status has been updated to ${newStatus}.`,
    });
  };
  
  const handlePaymentStatusChange = (bookingId: string, newStatus: 'unpaid' | 'partial' | 'paid') => {
    if (newStatus === 'paid' || newStatus === 'partial') {
      // Open the mark as paid dialog
      setSelectedBooking(vendorBookings.find(booking => booking.id === bookingId));
      setPaymentAmount(newStatus === 'paid' ? selectedBooking?.amount || 0 : 0);
      setIsMarkAsPaidOpen(true);
    } else {
      // Directly update to unpaid
      updatePaymentStatus(bookingId, newStatus);
      setVendorBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId ? { ...booking, paymentStatus: newStatus } : booking
        )
      );
      
      toast({
        title: "Payment Status Updated",
        description: `Payment status has been updated to ${newStatus}.`,
      });
    }
  };
  
  const handleMarkAsPaid = () => {
    if (!selectedBooking) return;
    
    updatePaymentStatus(selectedBooking.id, 
      paymentAmount >= selectedBooking.amount ? 'paid' : 'partial', 
      paymentMethod
    );
    
    // Update local state
    setVendorBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === selectedBooking.id ? { 
          ...booking, 
          paymentStatus: paymentAmount >= selectedBooking.amount ? 'paid' : 'partial',
          paymentMethod,
          amountPaid: paymentAmount
        } : booking
      )
    );
    
    // Close the dialog
    setIsMarkAsPaidOpen(false);
    
    toast({
      title: "Payment Recorded",
      description: `Payment of ₱${paymentAmount.toLocaleString()} has been recorded.`,
    });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getApprovalStatusBadge = (service: any) => {
    if (service.isApproved) {
      return <Badge className="bg-green-500">Approved</Badge>;
    } else {
      return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500">Partial</Badge>;
      case 'unpaid':
        return <Badge variant="outline" className="text-red-600 border-red-200">Unpaid</Badge>;
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>;
    }
  };
  
  const unreadNotificationsCount = vendorNotifications.filter(n => !n.read).length;
  
  const filteredBookings = filterStatus === 'all' 
    ? vendorBookings 
    : vendorBookings.filter(booking => booking.status === filterStatus);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your services and bookings</p>
        </div>
        <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
          <DialogTrigger asChild>
            <Button className="bg-kasadya-purple hover:bg-kasadya-deep-purple">
              <Plus className="mr-2 h-4 w-4" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Fill out the form below to create a new service offering for your clients.
              </DialogDescription>
            </DialogHeader>
            <ServiceUploadForm onSuccess={handleAddServiceSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="services">
            <Package className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="bookings">
            <Calendar className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
            {unreadNotificationsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                {unreadNotificationsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Your Services</CardTitle>
              <CardDescription>
                Manage the services you offer to your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No services yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first service to start attracting clients
                  </p>
                  <Button 
                    className="bg-kasadya-purple hover:bg-kasadya-deep-purple"
                    onClick={() => setIsAddServiceOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Service
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {service.images && service.images.length > 0 ? (
                                <img 
                                  src={service.images[0]} 
                                  alt={service.name} 
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                  <Camera className="h-5 w-5 text-gray-500" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {service.description.substring(0, 50)}
                                  {service.description.length > 50 ? '...' : ''}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {service.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(service.price)}</TableCell>
                          <TableCell>{formatDate(service.createdAt)}</TableCell>
                          <TableCell>
                            {getApprovalStatusBadge(service)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditService(service)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteService(service.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Your Bookings</CardTitle>
                  <CardDescription>
                    View and manage client bookings for your services
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No bookings {filterStatus !== 'all' ? `with status "${filterStatus}"` : ''}</h3>
                  <p className="text-muted-foreground mb-4">
                    {filterStatus !== 'all' 
                      ? `Try selecting a different status filter or wait for new bookings.` 
                      : `Bookings will appear here when clients book your services.`}
                  </p>
                  {filterStatus !== 'all' && (
                    <Button variant="outline" onClick={() => setFilterStatus('all')}>
                      Show All Bookings
                    </Button>
                  )}
                  {filteredBookings.length === 0 && filterStatus === 'all' && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Get more bookings</AlertTitle>
                      <AlertDescription>
                        Make sure to add attractive services with detailed descriptions and high-quality images to attract more clients.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date/Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{booking.name}</span>
                              <span className="text-xs text-muted-foreground">{booking.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>{booking.serviceName}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{booking.date}</span>
                              <span className="text-xs text-muted-foreground">{booking.time}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getPaymentStatusBadge(booking.paymentStatus)}
                              <span className="text-xs text-muted-foreground">
                                {booking.amountPaid ? `₱${booking.amountPaid.toLocaleString()} of ₱${booking.amount.toLocaleString()}` : `₱${booking.amount.toLocaleString()}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsBookingDetailOpen(true);
                              }}
                            >
                              <Info className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Updates and alerts about your services and bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vendorNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
                  <p className="text-muted-foreground">
                    You'll receive notifications about your services and bookings here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vendorNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border rounded-lg p-4 ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      <div className="flex justify-between">
                        <h3 className="font-medium">{notification.title}</h3>
                        {!notification.read && <Badge className="bg-blue-500">New</Badge>}
                      </div>
                      <p className="text-sm mt-1">{notification.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          {notification.bookingId && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const relatedBooking = vendorBookings.find(b => b.id === notification.bookingId);
                                if (relatedBooking) {
                                  setSelectedBooking(relatedBooking);
                                  setIsBookingDetailOpen(true);
                                }
                              }}
                            >
                              View Booking
                            </Button>
                          )}
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteService}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Service Dialog */}
      <Dialog open={isEditServiceOpen} onOpenChange={setIsEditServiceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update your service information
            </DialogDescription>
          </DialogHeader>
          {serviceToEdit && (
            <ServiceUploadForm 
              onSuccess={handleAddServiceSuccess}
              initialValues={serviceToEdit}
              isEdit={true}
              serviceId={serviceToEdit.id}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Booking Details Dialog */}
      <Dialog open={isBookingDetailOpen} onOpenChange={setIsBookingDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View and manage this booking
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-sm">Client</h3>
                  <p>{selectedBooking.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Service</h3>
                  <p>{selectedBooking.serviceName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Date & Time</h3>
                  <p>{selectedBooking.date}</p>
                  <p className="text-sm text-muted-foreground">{selectedBooking.time}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Status</h3>
                  <div className="mt-1">
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>
                <div className="col-span-2">
                  <h3 className="font-semibold text-sm mb-1">Payment Status</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      {getPaymentStatusBadge(selectedBooking.paymentStatus)}
                      <span className="ml-2 text-sm">
                        {selectedBooking.amountPaid 
                          ? `₱${selectedBooking.amountPaid.toLocaleString()} of ₱${selectedBooking.amount.toLocaleString()}` 
                          : `₱${selectedBooking.amount.toLocaleString()} (Unpaid)`
                        }
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setPaymentAmount(selectedBooking.amount - (selectedBooking.amountPaid || 0));
                        setIsMarkAsPaidOpen(true);
                      }}
                      disabled={selectedBooking.paymentStatus === 'paid'}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      {selectedBooking.paymentStatus === 'unpaid' ? 'Record Payment' : 'Add Payment'}
                    </Button>
                  </div>
                </div>
                {selectedBooking.notes && (
                  <div className="col-span-2">
                    <h3 className="font-semibold text-sm">Notes</h3>
                    <p className="text-sm">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedBooking.status !== 'pending' && (
                    <Button 
                      variant="outline"
                      onClick={() => handleStatusChange(selectedBooking.id, 'pending')}
                      className="justify-start"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Mark as Pending
                    </Button>
                  )}
                  {selectedBooking.status !== 'confirmed' && (
                    <Button 
                      variant={selectedBooking.status === 'pending' ? 'default' : 'outline'}
                      className={selectedBooking.status === 'pending' ? 'bg-green-600 hover:bg-green-700 justify-start' : 'justify-start'}
                      onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </Button>
                  )}
                  {selectedBooking.status !== 'cancelled' && (
                    <Button 
                      variant={selectedBooking.status === 'pending' ? 'destructive' : 'outline'} 
                      className="justify-start"
                      onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
                  )}
                  {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => handleStatusChange(selectedBooking.id, 'completed')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsBookingDetailOpen(false);
                    setSelectedBooking(null);
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Mark as Paid Dialog */}
      <Dialog open={isMarkAsPaidOpen} onOpenChange={setIsMarkAsPaidOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter payment details for this booking
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="amount">Payment Amount (₱)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      id="amount"
                      type="number" 
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="pl-9"
                      min={0}
                      max={selectedBooking.amount - (selectedBooking.amountPaid || 0)}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedBooking.amountPaid 
                      ? `Previously paid: ₱${selectedBooking.amountPaid.toLocaleString()} | Remaining: ₱${(selectedBooking.amount - selectedBooking.amountPaid).toLocaleString()}` 
                      : `Total amount: ₱${selectedBooking.amount.toLocaleString()}`
                    }
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value: 'gcash' | 'maya' | 'bank' | 'cash') => setPaymentMethod(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gcash" id="gcash" />
                      <Label htmlFor="gcash">GCash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maya" id="maya" />
                      <Label htmlFor="maya">Maya</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank">Bank Transfer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  onClick={handleMarkAsPaid}
                  disabled={paymentAmount <= 0}
                >
                  Record Payment
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDashboard;
