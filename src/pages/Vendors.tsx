import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Calendar, FileText, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import TermsAndConditionsModal from '@/components/modals/TermsAndConditionsModal';

const Vendors = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = () => {
      try {
        setIsLoading(true);
        // Fetch vendors
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
          const allUsers = JSON.parse(storedUsers);
          // Get all vendor users who are verified
          const vendorUsers = allUsers.filter((user: any) => user.isVendor && user.isVerified);
          setVendors(vendorUsers);
        }

        // Fetch services
        const storedServices = localStorage.getItem('vendorServices');
        if (storedServices) {
          const allServices = JSON.parse(storedServices);
          // Get all approved services
          const approvedServices = allServices.filter((service: any) => service.isApproved === true);
          setServices(approvedServices);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load vendors and services.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handlePostServiceClick = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in as a vendor to post services.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!user.isVendor) {
      toast({
        title: "Vendor Account Required",
        description: "You need a vendor account to post services.",
        variant: "destructive",
      });
      navigate('/register');
      return;
    }

    navigate('/post-service');
  };

  const handleCheckAvailabilityClick = () => {
    navigate('/booking-calendar');
  };

  const handleVendorClick = (vendorId: string) => {
    console.log("Clicked on vendor:", vendorId);
    
    // Check if the user is verified before proceeding
    if (user && !user.isVerified) {
      toast({
        title: 'Account Not Verified',
        description: 'Your account must be verified by an admin before you can access vendor services.',
        variant: 'destructive',
      });
      return;
    }

    // Check if terms and conditions were already accepted
    const termsAccepted = localStorage.getItem('termsAccepted') === 'true';
    
    if (!termsAccepted) {
      // Show terms and conditions first before proceeding to vendor page
      setShowTermsModal(true);
      // Store the vendorId to navigate after accepting terms
      localStorage.setItem('pendingVendorNavigation', vendorId);
    } else {
      // Terms already accepted, proceed directly
      navigateToVendor(vendorId);
    }
  };
  
  const handleAcceptTerms = () => {
    // Get the stored vendorId
    const vendorId = localStorage.getItem('pendingVendorNavigation');
    setShowTermsModal(false);
    
    if (vendorId) {
      // Clear the pending navigation
      localStorage.removeItem('pendingVendorNavigation');
      // Navigate to the vendor page
      navigateToVendor(vendorId);
    }
  };
  
  const navigateToVendor = (vendorId: string) => {
    console.log("Navigating to vendor:", vendorId);
    
    // Find services by this vendor
    const vendorServices = services.filter(service => service.vendorId === vendorId);
    
    if (vendorServices.length > 0) {
      // Navigate to the first service from the vendor
      navigate(`/vendor/${vendorId}/service/${vendorServices[0].id}`);
    } else {
      // Navigate to vendor profile even if they have no services
      navigate(`/vendor/${vendorId}`);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    return (
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.businessType && vendor.businessType.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Our Vendors</h1>
          <p className="text-muted-foreground mt-2">
            Discover trusted vendors for your events and celebrations
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="search"
              placeholder="Search vendors..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={handleCheckAvailabilityClick}
              className="w-full sm:w-auto"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Check Availability
            </Button>
            
            <Button 
              onClick={handlePostServiceClick}
              className="bg-kasadya-purple hover:bg-kasadya-deep-purple w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Post New Service
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start space-x-3 mb-6">
        <FileText size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-amber-800">Terms & Conditions</p>
          <p className="text-amber-700 text-sm">
            Before booking any service, you must agree to our terms and conditions.
            {localStorage.getItem('termsAccepted') === 'true' ? (
              <span className="ml-2 text-green-600 font-medium">
                <Check size={16} className="inline mr-1" />
                You have already accepted our terms.
              </span>
            ) : (
              <Button
                variant="link"
                className="p-0 h-auto text-amber-600 hover:text-amber-800 ml-2"
                onClick={() => setShowTermsModal(true)}
              >
                Read and accept terms
              </Button>
            )}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kasadya-purple"></div>
        </div>
      ) : filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div 
              key={vendor.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleVendorClick(vendor.id)}
            >
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                {vendor.profileImage ? (
                  <img 
                    src={vendor.profileImage} 
                    alt={vendor.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">No Image</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{vendor.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {vendor.businessType || "Service Provider"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="bg-green-100 text-green-800 text-xs py-1 px-2 rounded-full">
                    Verified Vendor
                  </span>
                  <Button 
                    size="sm" 
                    variant="default"
                    className="bg-kasadya-purple hover:bg-kasadya-deep-purple text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVendorClick(vendor.id);
                    }}
                  >
                    View Services
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No vendors found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or check back later</p>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
};

export default Vendors;
