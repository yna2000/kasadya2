
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from '@/components/vendor/ImageUpload';
import { Camera, Loader2, Info, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const serviceFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Service name must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  price: z.coerce.number().min(0, {
    message: 'Price must be a positive number.',
  }),
  category: z.string({
    required_error: 'Please select a category.',
  }),
  images: z.array(z.string()).min(1, {
    message: 'At least one image is required.',
  }),
  duration: z.string().optional(),
  maxCapacity: z.coerce.number().min(1, {
    message: 'Maximum capacity must be at least 1.',
  }).optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceUploadFormProps {
  onSuccess?: () => void;
  initialValues?: Partial<ServiceFormValues>;
  isEdit?: boolean;
  serviceId?: string;
}

export default function ServiceUploadForm({ 
  onSuccess, 
  initialValues, 
  isEdit = false,
  serviceId 
}: ServiceUploadFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: initialValues || {
      name: '',
      description: '',
      price: 0,
      category: '',
      images: [],
      duration: '1 hour',
      maxCapacity: 1,
    },
  });

  async function onSubmit(data: ServiceFormValues) {
    setIsSubmitting(true);
    try {
      // In a real app, this would call an API endpoint
      console.log('Service data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock saving to localStorage for demo purposes
      const services = JSON.parse(localStorage.getItem('vendorServices') || '[]');
      
      if (isEdit && serviceId) {
        // Update existing service
        const serviceIndex = services.findIndex((service: any) => service.id === serviceId);
        
        if (serviceIndex !== -1) {
          services[serviceIndex] = {
            ...services[serviceIndex],
            ...data,
            updatedAt: new Date().toISOString(),
          };
        }
        
        toast({
          title: 'Service Updated',
          description: 'Your service has been updated and is pending admin review.',
        });
      } else {
        // Create new service
        const newService = {
          id: `service-${Date.now()}`,
          ...data,
          vendorId: user?.id || '',
          vendorName: user?.name || '',
          businessType: user?.businessType || '',
          isApproved: false, // Default to not approved
          adminComments: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        services.push(newService);
        
        // Create admin notification
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        adminNotifications.push({
          id: `notification-${Date.now()}`,
          title: 'New Service Pending Approval',
          message: `${user?.name} has submitted a new service "${data.name}" for approval.`,
          type: 'serviceApproval',
          serviceId: newService.id,
          userId: user?.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
        
        localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
        
        toast({
          title: 'Service Submitted for Approval',
          description: 'Your service has been submitted and is pending admin approval.',
        });
      }
      
      localStorage.setItem('vendorServices', JSON.stringify(services));
      
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to create service. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Service Approval Process</h3>
            <p className="text-xs text-yellow-700 mt-1">
              All submitted services require admin approval before they appear in the marketplace.
              You will be notified when your service is approved.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Wedding Photography Package" {...field} />
              </FormControl>
              <FormDescription>
                Give your service a clear, descriptive name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what's included in your service, special features, etc."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide detailed information about what clients can expect.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₱)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Set the price for this service package.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="videography">Videography</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="decoration">Decoration</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="florist">Florist</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="beauty">Beauty & Makeup</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the category that best fits your service.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Duration</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="2 hours">2 hours</SelectItem>
                    <SelectItem value="3 hours">3 hours</SelectItem>
                    <SelectItem value="4 hours">4 hours</SelectItem>
                    <SelectItem value="Half day (5-6 hours)">Half day (5-6 hours)</SelectItem>
                    <SelectItem value="Full day (8+ hours)">Full day (8+ hours)</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How long does your service typically take?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Capacity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Maximum number of guests/participants.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Images</FormLabel>
              <FormControl>
                <ImageUpload 
                  value={field.value} 
                  onChange={(urls) => field.onChange(urls)}
                  maxImages={5}
                />
              </FormControl>
              <FormDescription>
                Upload up to 5 high-quality images showcasing your service.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-kasadya-purple hover:bg-kasadya-deep-purple"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? 'Updating Service...' : 'Submitting for Approval...'}
            </>
          ) : (
            <>
              {isEdit ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Update Service
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Submit Service for Approval
                </>
              )}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
