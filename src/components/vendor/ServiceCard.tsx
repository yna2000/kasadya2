
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Star, Camera } from 'lucide-react';

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    vendorId: string;
    vendorName?: string;
    vendorLocation?: string;
    vendorRating?: number;
  };
  onBookNow?: () => void;
}

const ServiceCard = ({ service, onBookNow }: ServiceCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="h-48 relative overflow-hidden">
        {service.images && service.images.length > 0 ? (
          <img 
            src={service.images[0]} 
            alt={service.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Camera className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <Badge 
          variant="outline" 
          className="absolute top-2 right-2 bg-white capitalize"
        >
          {service.category}
        </Badge>
      </div>
      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="mb-2">
          <h3 className="text-xl font-bold mb-1">{service.name}</h3>
          <p className="text-sm text-gray-500 mb-2">
            {service.vendorName || 'Service Provider'}
          </p>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {service.description}
        </p>
        
        {service.vendorLocation && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
            {service.vendorLocation}
          </div>
        )}
        
        {service.vendorRating && (
          <div className="flex items-center text-sm mb-2">
            <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
            <span className="font-medium mr-1">{service.vendorRating}</span>
          </div>
        )}
        
        <div className="mt-auto pt-4 flex justify-between items-center">
          <div className="text-xl font-bold text-kasadya-purple">
            ₱{service.price.toLocaleString()}
          </div>
          
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link to={`/vendor/${service.vendorId}`}>
                Details
              </Link>
            </Button>
            <Button 
              className="bg-kasadya-purple hover:bg-kasadya-deep-purple"
              size="sm"
              onClick={onBookNow}
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
