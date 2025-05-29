
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking, Booking } from '@/contexts/BookingContext';
import { Calendar, Clock, CheckCircle2, XCircle, User, UserCheck, Users, Camera, FileCheck, Shield, DollarSign, Check, X, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, getAllUsers, getPendingVerificationUsers, verifyUser } = useAuth();
  const { bookings, updateBookingStatus, updatePaymentStatus, getBookingById } = useBooking();
  
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [serviceDetailOpen, setServiceDetailOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [adminComment, setAdminComment] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterVendor, setFilterVendor] = useState('all');
  const [vendors, setVendors] = useState<any[]>([]);
  const [bookingDetailOpen, setBookingDetailOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isMarkAsPaidOpen, setIsMarkAsPaidOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'bank' | 'cash'>('cash');

  useEffect(() => {
    // Redirect if not admin
    if (user && !user.isAdmin) {
      navigate('/dashboard');
    }

    // Get users that need verification
    const pendingVerificationUsers = getPendingVerificationUsers();
    setPendingUsers(pendingVerificationUsers);

    // Get all users
    const users = getAllUsers();
    setAllUsers(users);

    // Get all vendors
    const vendorList = users.filter(u => u.isVendor);
    setVendors(vendorList);

    // Load admin notifications
    const storedNotifications = localStorage.getItem('adminNotifications') || '[]';
    const notifications = JSON.parse(storedNotifications);
    setAdminNotifications(notifications);
    
    // Load pending services
    loadPendingServices();
  }, [user, navigate, getPendingVerificationUsers, getAllUsers]);

  const loadPendingServices = () => {
    try {
      const storedServices = localStorage.getItem('vendorServices') || '[]';
      const services = JSON.parse(storedServices);
      const pending = services.filter((service: any) => !service.isApproved);
      setPendingServices(pending);
    } catch (error) {
      console.error('Error loading pending services:', error);
    }
  };

  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    const success = await verifyUser(userId, isVerified);
    
    if (success) {
      // Update the pending users list
      const updatedPendingUsers = pendingUsers.filter(user => user.id !== userId);
      setPendingUsers(updatedPendingUsers);
      
      // Update the all users list
      const updatedAllUsers = allUsers.map(user => {
        if (user.id === userId) {
          return { ...user, isVerified };
        }
        return user;
      });
      setAllUsers(updatedAllUsers);
      
      toast({
        title: `User ${isVerified ? 'verified' : 'verification rejected'}`,
        description: `The user has been ${isVerified ? 'verified' : 'rejected'} successfully.`,
      });
      
      // Mark related notifications as read
      const updatedNotifications = adminNotifications.map(notification => {
        if (notification.userId === userId) {
          return { ...notification, read: true };
        }
        return notification;
      });
      setAdminNotifications(updatedNotifications);
      localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = adminNotifications.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    setAdminNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
  };

  const openServiceDetail = (service: any) => {
    setSelectedService(service);
    setServiceDetailOpen(true);
  };

  const handleApproveService = (approved: boolean) => {
    try {
      const storedServices = localStorage.getItem('vendorServices') || '[]';
      const services = JSON.parse(storedServices);
      
      const updatedServices = services.map((service: any) => {
        if (service.id === selectedService.id) {
          return {
            ...service,
            isApproved: approved,
            adminComments: adminComment,
            reviewedAt: new Date().toISOString(),
          };
        }
        return service;
      });
      
      localStorage.setItem('vendorServices', JSON.stringify(updatedServices));
      
      // Create notification for vendor
      const vendorNotifications = JSON.parse(localStorage.getItem('vendorNotifications') || '[]');
      vendorNotifications.push({
        id: `notification-${Date.now()}`,
        vendorId: selectedService.vendorId,
        title: approved ? 'Service Approved' : 'Service Rejected',
        message: approved 
          ? `Your service "${selectedService.name}" has been approved and is now live.`
          : `Your service "${selectedService.name}" was not approved. Reason: ${adminComment || 'No reason provided.'}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
      
      localStorage.setItem('vendorNotifications', JSON.stringify(vendorNotifications));
      
      // Mark related admin notification as read
      const updatedNotifications = adminNotifications.map(notification => {
        if (notification.serviceId === selectedService.id) {
          return { ...notification, read: true };
        }
        return notification;
      });
      
      localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
      setAdminNotifications(updatedNotifications);
      
      // Update local state
      setPendingServices(pendingServices.filter(service => service.id !== selectedService.id));
      
      // Show success toast
      toast({
        title: approved ? 'Service Approved' : 'Service Rejected',
        description: approved 
          ? `The service has been approved and is now live.` 
          : `The service has been rejected.`,
      });
      
      // Reset and close dialog
      setServiceDetailOpen(false);
      setSelectedService(null);
      setAdminComment('');
    } catch (error) {
      console.error('Error approving/rejecting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to process the service. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleOpenBookingDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setBookingDetailOpen(true);
  };
  
  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    updateBookingStatus(bookingId, newStatus);
    
    // Update the selected booking if it's open
    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({
        ...selectedBooking,
        status: newStatus
      });
    }
    
    toast({
      title: "Booking Updated",
      description: `Booking status has been updated to ${newStatus}.`,
    });
  };
  
  const handleMarkAsPaid = () => {
    if (!selectedBooking) return;
    
    updatePaymentStatus(selectedBooking.id, 
      paymentAmount >= selectedBooking.amount ? 'paid' : 'partial', 
      paymentMethod
    );
    
    // Update the selected booking
    setSelectedBooking({
      ...selectedBooking,
      paymentStatus: paymentAmount >= selectedBooking.amount ? 'paid' : 'partial',
      paymentMethod,
      amountPaid: paymentAmount + (selectedBooking.amountPaid || 0)
    });
    
    // Close the dialog
    setIsMarkAsPaidOpen(false);
    
    toast({
      title: "Payment Recorded",
      description: `Payment of ₱${paymentAmount.toLocaleString()} has been recorded.`,
    });
  };
  
  // Get filtered bookings based on status, payment status, and vendor
  const getFilteredBookings = () => {
    let filtered = [...bookings];
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }
    
    // Filter by payment status
    if (filterPayment !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === filterPayment);
    }
    
    // Filter by vendor
    if (filterVendor !== 'all') {
      filtered = filtered.filter(booking => booking.vendorId === filterVendor);
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return filtered;
  };
  
  const filteredBookings = getFilteredBookings();
  
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

  // Count users by role
  const vendorCount = allUsers.filter(user => user.isVendor).length;
  const customerCount = allUsers.filter(user => !user.isVendor && !user.isAdmin).length;
  const pendingVerificationCount = pendingUsers.length;
  const unreadNotificationsCount = adminNotifications.filter(n => !n.read).length;
  const pendingServicesCount = pendingServices.length;
  
  // Count bookings by status
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookingsCount = bookings.filter(b => b.status === 'completed').length;
  
  // Count bookings by payment status
  const unpaidBookingsCount = bookings.filter(b => b.paymentStatus === 'unpaid').length;
  const partiallyPaidBookingsCount = bookings.filter(b => b.paymentStatus === 'partial').length;
  const fullyPaidBookingsCount = bookings.filter(b => b.paymentStatus === 'paid').length;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {unreadNotificationsCount > 0 && (
          <Badge className="bg-red-500">
            {unreadNotificationsCount} new {unreadNotificationsCount === 1 ? 'notification' : 'notifications'}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users" className="relative">
            Users
            {pendingVerificationCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                {pendingVerificationCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="services" className="relative">
            Services
            {pendingServicesCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                {pendingServicesCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="relative">
            Bookings
            {pendingBookingsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                {pendingBookingsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="relative">
            Notifications
            {unreadNotificationsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                {unreadNotificationsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allUsers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {vendorCount} vendors, {customerCount} customers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Verification
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingVerificationCount}</div>
                <p className="text-xs text-muted-foreground">
                  {pendingUsers.filter(user => user.isVendor).length} vendors,{' '}
                  {pendingUsers.filter(user => !user.isVendor && !user.isAdmin).length} customers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Services
                </CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingServicesCount}</div>
                <p className="text-xs text-muted-foreground">
                  Services awaiting your approval
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Booking Status
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge className="bg-yellow-500">{pendingBookingsCount} Pending</Badge>
                  <Badge className="bg-green-500">{confirmedBookingsCount} Confirmed</Badge>
                  <Badge className="bg-blue-500">{completedBookingsCount} Completed</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Payment Status
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fullyPaidBookingsCount} Paid</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-red-600 border-red-200">{unpaidBookingsCount} Unpaid</Badge>
                  <Badge className="bg-yellow-500">{partiallyPaidBookingsCount} Partial</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenue Overview
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱{bookings.reduce((sum, booking) => sum + (booking.amountPaid || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total revenue collected
                </p>
              </CardContent>
            </Card>
          </div>

          {pendingVerificationCount > 0 && (
            <Card className="mt-4 mb-6">
              <CardHeader>
                <CardTitle>Pending User Verifications</CardTitle>
                <CardDescription>
                  Users awaiting account verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingUsers.slice(0, 3).map((pendingUser) => (
                    <div key={pendingUser.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{pendingUser.name}</p>
                        <p className="text-sm text-muted-foreground">{pendingUser.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={pendingUser.isVendor ? "bg-purple-500" : "bg-blue-500"}>
                            {pendingUser.isVendor ? "Vendor" : "Customer"}
                          </Badge>
                          {pendingUser.businessType && (
                            <Badge variant="outline">{pendingUser.businessType}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Registered on {new Date(pendingUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleVerifyUser(pendingUser.id, false)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleVerifyUser(pendingUser.id, true)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingUsers.length > 3 && (
                    <Button variant="link" onClick={() => setActiveTab("users")}>
                      View all {pendingUsers.length} pending users
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {pendingServicesCount > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Pending Service Approvals</CardTitle>
                <CardDescription>
                  Services awaiting your review and approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingServices.slice(0, 3).map((service) => (
                    <div key={service.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                          {service.images && service.images.length > 0 ? (
                            <img 
                              src={service.images[0]} 
                              alt={service.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <Camera className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {service.description.substring(0, 60)}
                            {service.description.length > 60 ? '...' : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize">
                              {service.category}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              by {service.vendorName}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openServiceDetail(service)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  ))}
                  {pendingServices.length > 3 && (
                    <Button variant="link" onClick={() => setActiveTab("services")}>
                      View all {pendingServices.length} pending services
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and verify account requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">Pending Verification ({pendingUsers.length})</TabsTrigger>
                  <TabsTrigger value="all">All Users ({allUsers.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  {pendingUsers.length > 0 ? (
                    <div className="space-y-6">
                      {pendingUsers.map((pendingUser) => (
                        <div key={pendingUser.id} className="border rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{pendingUser.name}</h3>
                              <p className="text-sm text-muted-foreground">{pendingUser.email}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={pendingUser.isVendor ? "bg-purple-500" : "bg-blue-500"}>
                                  {pendingUser.isVendor ? "Vendor" : "Customer"}
                                </Badge>
                                {pendingUser.businessType && (
                                  <Badge variant="outline">{pendingUser.businessType}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleVerifyUser(pendingUser.id, false)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleVerifyUser(pendingUser.id, true)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-semibold">ID Information</p>
                              <p className="text-sm">{pendingUser.idType}: {pendingUser.idNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Registration Date</p>
                              <p className="text-sm">{new Date(pendingUser.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="font-medium text-lg">No Pending Verifications</h3>
                      <p className="text-muted-foreground">All users have been verified</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="all">
                  <div className="overflow-auto max-h-[500px]">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="p-2">Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Role</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{user.name}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">
                              <Badge className={
                                user.isAdmin ? "bg-yellow-500" : 
                                user.isVendor ? "bg-purple-500" : "bg-blue-500"
                              }>
                                {user.isAdmin ? "Admin" : user.isVendor ? "Vendor" : "Customer"}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {user.isVerified ? (
                                <Badge className="bg-green-500">Verified</Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>
                              )}
                            </td>
                            <td className="p-2">
                              {!user.isAdmin && !user.isVerified && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => handleVerifyUser(user.id, true)}
                                  >
                                    Verify
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>
                Review and approve vendor services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">Pending Approval ({pendingServices.length})</TabsTrigger>
                  <TabsTrigger value="all">All Services</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  {pendingServices.length > 0 ? (
                    <div className="space-y-6">
                      {pendingServices.map((service) => (
                        <div key={service.id} className="border rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                              <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                                {service.images && service.images.length > 0 ? (
                                  <img 
                                    src={service.images[0]} 
                                    alt={service.name} 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium text-lg">{service.name}</h3>
                                <p className="text-sm text-muted-foreground">By {service.vendorName}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="capitalize">
                                    {service.category}
                                  </Badge>
                                  <Badge variant="outline">
                                    ₱{service.price.toLocaleString()}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button
                              onClick={() => openServiceDetail(service)}
                            >
                              <FileCheck className="h-4 w-4 mr-1" />
                              Review Details
                            </Button>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-semibold">Description</p>
                            <p className="text-sm text-muted-foreground">
                              {service.description.length > 200 
                                ? `${service.description.substring(0, 200)}...` 
                                : service.description}
                            </p>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {service.images && service.images.slice(0, 4).map((image: string, idx: number) => (
                              <div key={idx} className="h-16 w-16 rounded-md overflow-hidden">
                                <img src={image} alt={`${service.name} ${idx+1}`} className="h-full w-full object-cover" />
                              </div>
                            ))}
                            {service.images && service.images.length > 4 && (
                              <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center">
                                <span className="text-sm text-gray-500">+{service.images.length - 4}</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex justify-end gap-2">
                            <Button
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedService(service);
                                setServiceDetailOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedService(service);
                                setAdminComment('Approved');
                                handleApproveService(true);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <h3 className="font-medium text-lg">No Pending Services</h3>
                      <p className="text-muted-foreground">All services have been reviewed</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="all">
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <h3 className="font-medium text-lg">Service Analytics</h3>
                    <p className="text-muted-foreground">View all services in the marketplace</p>
                    <Button className="mt-4" onClick={() => navigate('/services')}>
                      View All Services
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Booking Management</CardTitle>
                  <CardDescription>
                    Monitor and manage all bookings across vendors
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterPayment} onValueChange={setFilterPayment}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterVendor} onValueChange={setFilterVendor}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vendors</SelectItem>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters to see more bookings
                  </p>
                  <Button variant="outline" onClick={() => {
                    setFilterStatus('all');
                    setFilterPayment('all');
                    setFilterVendor('all');
                  }}>
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Vendor</TableHead>
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
                          <TableCell>{booking.vendorName}</TableCell>
                          <TableCell className="max-w-[120px] truncate" title={booking.serviceName}>
                            {booking.serviceName}
                          </TableCell>
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
                                {booking.amountPaid 
                                  ? `₱${booking.amountPaid.toLocaleString()} of ₱${booking.amount.toLocaleString()}` 
                                  : `₱${booking.amount.toLocaleString()}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenBookingDetail(booking)}
                            >
                              <Info className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="mt-4 text-sm text-muted-foreground text-right">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                System notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adminNotifications.length > 0 ? (
                <div className="space-y-4">
                  {adminNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border rounded-lg p-4 ${!notification.read ? 'bg-blue-50' : ''}`}
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
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="font-medium text-lg">No Notifications</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Service Detail Dialog */}
      <Dialog open={serviceDetailOpen} onOpenChange={setServiceDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Service</DialogTitle>
            <DialogDescription>
              Review details and approve or reject this service
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg">{selectedService.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">By {selectedService.vendorName}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm">Category</h4>
                      <p className="capitalize">{selectedService.category}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm">Price</h4>
                      <p>₱{selectedService.price.toLocaleString()}</p>
                    </div>
                    
                    {selectedService.duration && (
                      <div>
                        <h4 className="font-semibold text-sm">Duration</h4>
                        <p>{selectedService.duration}</p>
                      </div>
                    )}
                    
                    {selectedService.maxCapacity && (
                      <div>
                        <h4 className="font-semibold text-sm">Max Capacity</h4>
                        <p>{selectedService.maxCapacity} guests</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-sm">Description</h4>
                      <p className="text-sm whitespace-pre-wrap">{selectedService.description}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">Images</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedService.images && selectedService.images.map((image: string, idx: number) => (
                      <div key={idx} className="h-32 rounded-md overflow-hidden">
                        <img src={image} alt={`${selectedService.name} ${idx+1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm mb-2">Admin Comment</h4>
                <Textarea 
                  placeholder="Add a comment about this service (optional for approval, required for rejection)"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  className="min-h-24"
                />
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleApproveService(false)}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject Service
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproveService(true)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve Service
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Booking Detail Dialog */}
      <Dialog open={bookingDetailOpen} onOpenChange={setBookingDetailOpen}>
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
                  <h3 className="font-semibold text-sm">Vendor</h3>
                  <p>{selectedBooking.vendorName}</p>
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
                <div>
                  <h3 className="font-semibold text-sm">Booked On</h3>
                  <p>{new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
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
                      {selectedBooking.paymentMethod && (
                        <Badge variant="outline" className="ml-2">
                          via {selectedBooking.paymentMethod}
                        </Badge>
                      )}
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
                    setBookingDetailOpen(false);
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
                <Button variant="outline" onClick={() => setIsMarkAsPaidOpen(false)}>
                  Cancel
                </Button>
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
}
