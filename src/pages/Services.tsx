
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Music, Gift, Camera, Cake, Users, Award, Home, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Services = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [vendorServices, setVendorServices] = useState<any[]>([]);
  
  // Service categories with their icons
  const categories = [
    { id: "all", label: "All Services" },
    { id: "photography", label: "Photography", icon: <Camera /> },
    { id: "videography", label: "Videography", icon: <Camera /> },
    { id: "catering", label: "Catering", icon: <Utensils /> },
    { id: "venue", label: "Venues", icon: <Home /> },
    { id: "entertainment", label: "Entertainment", icon: <Music /> },
    { id: "decoration", label: "Decoration", icon: <Gift /> },
    { id: "bakery", label: "Bakery", icon: <Cake /> },
    { id: "florist", label: "Florist", icon: <Gift /> },
    { id: "transportation", label: "Transportation", icon: <Gift /> },
    { id: "beauty", label: "Beauty & Makeup", icon: <Gift /> },
  ];

  useEffect(() => {
    // Load approved vendor services
    try {
      const storedServices = localStorage.getItem('vendorServices') || '[]';
      const services = JSON.parse(storedServices);
      const approvedServices = services.filter((service: any) => service.isApproved);
      setVendorServices(approvedServices);
    } catch (error) {
      console.error('Error loading vendor services:', error);
    }
  }, []);

  // Filter services based on active tab
  const filteredServices = activeTab === "all" 
    ? vendorServices 
    : vendorServices.filter(service => service.category === activeTab);
  
  // Additional filter for popular services (for now, just take the first 4)
  const popularServices = vendorServices.slice(0, 4);

  // Fallback static services if no approved vendor services
  const staticServices = [
    {
      id: 1,
      title: "Wedding Photography",
      description: "Professional photographers to capture your special day with artistic flair and attention to detail.",
      category: "photography",
      icon: <Camera className="h-8 w-8 text-kasadya-purple" />,
      popular: true,
    },
    {
      id: 2,
      title: "Wedding Venues",
      description: "Beautiful venues for your ceremony and reception, from beaches to gardens to elegant ballrooms.",
      category: "venue",
      icon: <Home className="h-8 w-8 text-kasadya-purple" />,
      popular: true,
    },
    {
      id: 3,
      title: "Wedding Catering",
      description: "Exquisite menus and professional service for your wedding dinner.",
      category: "catering",
      icon: <Utensils className="h-8 w-8 text-kasadya-purple" />,
      popular: false,
    },
    {
      id: 4,
      title: "Birthday Party Planning",
      description: "End-to-end planning for memorable birthday celebrations for all ages.",
      category: "bakery",
      icon: <Cake className="h-8 w-8 text-kasadya-purple" />,
      popular: true,
    },
  ];

  // Use vendor services if available, otherwise use static services
  const displayedPopularServices = popularServices.length > 0 ? popularServices : staticServices;
  const displayedServices = filteredServices.length > 0 ? filteredServices : staticServices;

  // Function to get icon for a category
  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || <Gift className="h-8 w-8 text-kasadya-purple" />;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="kasadya-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Our Services</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Discover a wide range of premium event services to make your celebrations truly special.
          </p>
        </div>
      </section>

      {/* Popular Services */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Popular Services</h2>
          <p className="section-subtitle">
            Our most requested event services in Davao del Norte
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedPopularServices.map((service) => (
              <div 
                key={service.id} 
                className="border border-gray-200 rounded-lg p-6 flex flex-col h-full hover:shadow-lg hover:border-kasadya-purple transition-all"
              >
                <div className="mb-4">
                  {service.images && service.images.length > 0 ? (
                    <img 
                      src={service.images[0]} 
                      alt={service.name || service.title} 
                      className="h-40 w-full object-cover rounded-md mb-4"
                    />
                  ) : (
                    getCategoryIcon(service.category)
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{service.name || service.title}</h3>
                <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                  {service.description}
                </p>
                <Button asChild variant="outline" className="w-full border-kasadya-purple text-kasadya-purple hover:bg-kasadya-purple hover:text-white">
                  <Link to={service.vendorId ? `/vendor/${service.vendorId}/service/${service.id}` : "/vendors"}>
                    {service.vendorId ? "View Service" : "Find Providers"}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Services */}
      <section className="section-padding bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Explore All Services</h2>
          <p className="section-subtitle">
            Browse our comprehensive list of event services
          </p>

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8 overflow-x-auto">
              <TabsList className="bg-white">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="data-[state=active]:text-kasadya-purple data-[state=active]:border-b-2 data-[state=active]:border-kasadya-purple"
                  >
                    <div className="flex items-center">
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      {category.label}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedServices.map((service) => (
                  <div 
                    key={service.id} 
                    className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col h-full hover:shadow-lg hover:border-kasadya-purple transition-all"
                  >
                    <div className="mb-4">
                      {service.images && service.images.length > 0 ? (
                        <img 
                          src={service.images[0]} 
                          alt={service.name || service.title} 
                          className="h-40 w-full object-cover rounded-md mb-4"
                        />
                      ) : (
                        getCategoryIcon(service.category)
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{service.name || service.title}</h3>
                    <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                      {service.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500 capitalize">{service.category}</span>
                      {service.price && (
                        <span className="font-bold text-kasadya-purple">₱{service.price.toLocaleString()}</span>
                      )}
                    </div>
                    <Button asChild variant="outline" className="w-full border-kasadya-purple text-kasadya-purple hover:bg-kasadya-purple hover:text-white">
                      <Link to={service.vendorId ? `/vendor/${service.vendorId}/service/${service.id}` : "/vendors"}>
                        {service.vendorId ? "View Service" : "Find Providers"}
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Don't see what you're looking for? Contact us and we'll help you find the perfect service provider.
            </p>
            <Button asChild size="lg" className="bg-kasadya-purple hover:bg-kasadya-deep-purple">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Booking your event services through Kasadya Marketplace is simple
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-kasadya-purple text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-2">Browse Services</h3>
              <p className="text-gray-600">Explore our wide selection of event services and vendors.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-kasadya-purple text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-2">Connect with Vendors</h3>
              <p className="text-gray-600">Contact vendors directly to discuss your specific needs.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-kasadya-purple text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-2">Confirm & Celebrate</h3>
              <p className="text-gray-600">Book your services and get ready for an amazing event!</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-kasadya-purple hover:bg-kasadya-deep-purple">
              <Link to="/vendors">Find Vendors Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
