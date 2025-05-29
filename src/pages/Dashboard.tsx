import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/contexts/BookingContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Calendar,
  CreditCard,
  DollarSign,
  Settings,
  User,
  X,
  Check,
  AlertTriangle,
  Heart,
  Bookmark,
  Clock
} from 'lucide-react';
import PaymentMethodSelection from '@/components/booking/PaymentMethodSelection';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { bookings, cancelBooking, processPayment } = useBooking();
  const { notifications, markAsRead, deleteNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'gcash' | 'maya' | 'bank' | 'cash'>('cash');
  
  const [editProfile, setEditProfile] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  
  const [newPassword, setNewPassword] = useState({
    current: '',
    password: '',
    confirm: ''
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleCancelBooking = (bookingId: string) => {
    cancelBooking(bookingId);
    setSelectedBooking(null);
  };

  const handlePayment = async (bookingId: string) => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const success = await processPayment(bookingId, amount, paymentMethod);
    if (success) {
      setShowPaymentForm(false);
      setPaymentAmount('');
      setSelectedBooking(null);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleProfileUpdate = () => {
    // Simulate profile update
    console.log('Profile updated:', userProfile);
    setEditProfile(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleChangePassword = () => {
    if (newPassword.password !== newPassword.confirm) {
      setPasswordError('Passwords do not match.');
      return;
    }

    // Simulate password change
    console.log('Password changed:', newPassword);
    setPasswordError('');
    setNewPassword({ current: '', password: '', confirm: '' });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Simulate account deletion
      console.log('Account deleted');
      logout();
      navigate('/');
    }
  };

  // Render the dashboard UI
  return (
    <>
      {/* Dashboard Header */}
      <section className="bg-gray-100 py-6 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                Welcome, {user?.name}!
              </h1>
              <p className="text-gray-600">
                Manage your bookings, profile, and notifications
              </p>
            </div>
            <div className="flex gap-3">
              {user?.isAdmin && (
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  Admin Dashboard
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/vendors')}>
                Book a Vendor
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto py-8 px-4">
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full max-w-3xl mx-auto mb-8">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-kasadya-purple data-[state=active]:text-white">
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="notifications" className="relative data-[state=active]:bg-kasadya-purple data-[state=active]:text-white">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
              {notifications.filter(n => !n.read).length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs absolute -top-1 -right-1">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-kasadya-purple data-[state=active]:text-white">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bookings" className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">My Bookings</CardTitle>
                <p className="text-muted-foreground">
                  View and manage your upcoming and past bookings
                </p>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600">No bookings yet.</p>
                    <Button variant="link" onClick={() => navigate('/vendors')}>
                      Find a Vendor
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="border">
                        <CardHeader>
                          <CardTitle className="flex justify-between items-center">
                            {booking.vendorName} - {booking.serviceName}
                            {booking.status === 'pending' && (
                              <Badge variant="secondary">Pending</Badge>
                            )}
                            {booking.status === 'confirmed' && (
                              <Badge className="bg-green-500 text-white">Confirmed</Badge>
                            )}
                            {booking.status === 'cancelled' && (
                              <Badge variant="destructive">Cancelled</Badge>
                            )}
                            {booking.status === 'completed' && (
                              <Badge className="bg-gray-500 text-white">Completed</Badge>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Date & Time</p>
                              <p>{format(new Date(booking.date), 'PPP')} at {booking.time}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Amount</p>
                              <p>₱{booking.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Payment Status</p>
                              <p>{booking.paymentStatus}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Booking ID</p>
                              <p>{booking.id}</p>
                            </div>
                          </div>
                          
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <div className="flex justify-end gap-2">
                              {booking.paymentStatus !== 'paid' && (
                                <Button
                                  variant="secondary"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowPaymentForm(true);
                                  }}
                                >
                                  Make Payment
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                Cancel Booking
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Notifications</CardTitle>
                <p className="text-muted-foreground">
                  Stay up-to-date with important updates and alerts
                </p>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-600">No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <Card key={notification.id} className={`border ${!notification.read ? 'bg-gray-50' : ''}`}>
                          <CardHeader className="flex justify-between items-start">
                            <div className="space-y-1">
                              <CardTitle className="text-sm font-medium">{notification.title}</CardTitle>
                              <p className="text-sm text-gray-500">{notification.message}</p>
                              <p className="text-xs text-gray-400">
                                {format(new Date(notification.createdAt), 'PPP p')}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              {!notification.read && (
                                <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark as Read
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile" className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
                <p className="text-muted-foreground">
                  Manage your personal information and account preferences
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {!editProfile ? (
                  // Profile view mode
                  <div>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Full Name
                        </label>
                        <p className="text-gray-700">{user?.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email Address
                        </label>
                        <p className="text-gray-700">{user?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Phone Number
                        </label>
                        <p className="text-gray-700">{user?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Address
                        </label>
                        <p className="text-gray-700">{user?.address || 'N/A'}</p>
                      </div>
                    </div>
                    <Button onClick={() => setEditProfile(true)} className="mt-4">
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  // Profile edit mode
                  <div>
                    <div className="grid gap-4 mb-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                          Full Name
                        </label>
                        <Input
                          id="name"
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={userProfile.email}
                          onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium mb-1">
                          Address
                        </label>
                        <Input
                          id="address"
                          value={userProfile.address}
                          onChange={(e) => setUserProfile({...userProfile, address: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4">Change Password</h3>
                      <div className="grid gap-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                            Current Password
                          </label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={newPassword.current}
                            onChange={(e) => setNewPassword({...newPassword, current: e.target.value})}
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                            New Password
                          </label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={newPassword.password}
                            onChange={(e) => setNewPassword({...newPassword, password: e.target.value})}
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                            Confirm New Password
                          </label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={newPassword.confirm}
                            onChange={(e) => setNewPassword({...newPassword, confirm: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      {passwordError && (
                        <div className="mt-2 text-red-500 text-sm">
                          {passwordError}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setEditProfile(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleChangePassword}>
                        Change Password
                      </Button>
                      <Button onClick={handleProfileUpdate}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="pt-8 border-t">
                  <h3 className="text-lg font-medium mb-4">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Be careful, these actions can have serious consequences.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Form Modal */}
      {selectedBooking && showPaymentForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Make Payment for Booking
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Enter the amount you wish to pay for booking ID: {selectedBooking.id}.
                </p>
              </div>
              <Input
                type="number"
                placeholder="Enter amount"
                className="mt-4"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <div className="mt-4">
                <PaymentMethodSelection
                  selectedMethod={paymentMethod}
                  onMethodChange={(method) => setPaymentMethod(method as 'gcash' | 'maya' | 'bank' | 'cash')}
                />
              </div>
              <div className="items-center px-4 py-3 mt-4">
                <Button
                  variant="outline"
                  className="px-4 py-2 rounded text-gray-500 hover:bg-gray-100"
                  onClick={() => setShowPaymentForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="ml-4 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-700"
                  onClick={() => handlePayment(selectedBooking.id)}
                >
                  Pay Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
