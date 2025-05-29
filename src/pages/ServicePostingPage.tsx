
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ServiceUploadForm from '@/components/vendor/ServiceUploadForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Shield, Info, FileCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ServicePostingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is a vendor
    if (!user) {
      toast({
        title: "Access Denied",
        description: "You need to log in to access this page.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Check if user is a vendor
    if (!user.isVendor) {
      toast({
        title: "Access Denied",
        description: "Only vendors can post services.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    // Check if vendor is verified
    if (!user.isVerified) {
      toast({
        title: "Account Not Verified",
        description: "Your account needs to be verified by an admin before your services can be approved.",
        variant: "destructive",
      });
      // Still allow them to stay on page, but they'll see a warning
    }
    
    // Load vendor's pending services
    loadPendingServices();
    setIsLoading(false);
  }, [user, navigate, toast]);
  
  const loadPendingServices = () => {
    if (user?.id) {
      try {
        const storedServices = localStorage.getItem('vendorServices') || '[]';
        const services = JSON.parse(storedServices);
        const pending = services.filter(
          (service: any) => service.vendorId === user.id && !service.isApproved
        );
        setPendingServices(pending);
      } catch (error) {
        console.error('Error loading pending services:', error);
      }
    }
  };

  // Handler for successful service submission
  const handleSuccess = () => {
    toast({
      title: "Service Submitted",
      description: "Your service has been submitted for admin approval.",
    });
    
    // Reload pending services
    loadPendingServices();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Post a New Service</h1>

      {user && !user.isVerified && (
        <Alert className="bg-yellow-50 mb-6 border-yellow-300">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Account Pending Verification</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your account is pending verification by an administrator. You can create services now, but they won't be published until your account is verified.
          </AlertDescription>
        </Alert>
      )}

      {user && user.isVerified && (
        <Alert className="bg-blue-50 mb-6 border-blue-300">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Service Approval Process</AlertTitle>
          <AlertDescription className="text-blue-700">
            All services require admin approval before they appear in the marketplace. You'll be notified once your service is approved.
          </AlertDescription>
        </Alert>
      )}

      {pendingServices.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-orange-500" />
              Pending Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              You have {pendingServices.length} {pendingServices.length === 1 ? 'service' : 'services'} awaiting admin approval.
            </p>
            <div className="space-y-3">
              {pendingServices.map(service => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">{service.category}</Badge>
                      <Badge variant="outline">₱{service.price.toLocaleString()}</Badge>
                    </div>
                  </div>
                  <Badge className="bg-orange-500">Pending Approval</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user && (
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex items-center mb-6">
            <FileCheck className="h-6 w-6 text-kasadya-purple mr-2" /> 
            <h2 className="text-xl font-semibold">Service Information</h2>
          </div>
          <ServiceUploadForm onSuccess={handleSuccess} />
        </div>
      )}

      {!user && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please log in as a vendor to post services.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/login')}>Log In</Button>
            <Button variant="outline" onClick={() => navigate('/register')}>Register as Vendor</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePostingPage;
