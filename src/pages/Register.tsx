
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Shield, Package, User, UserCheck, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'vendor'], { 
    required_error: 'Please select a role' 
  }),
  idType: z.enum(['national_id', 'passport', 'drivers_license'], {
    required_error: 'Please select an ID type'
  }),
  idNumber: z.string().min(5, { message: 'ID number must be at least 5 characters' }),
  businessType: z.string().optional(),
  additionalInfo: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(
  (data) => data.role !== 'vendor' || (data.role === 'vendor' && data.businessType && data.businessType.length > 0),
  {
    message: "Business type is required for vendors",
    path: ["businessType"],
  }
);

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showBusinessType, setShowBusinessType] = useState(false);
  const [formProgress, setFormProgress] = useState(10);
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      idType: 'national_id',
      idNumber: '',
      businessType: '',
      additionalInfo: '',
    },
  });

  // Watch for role changes to toggle business type field
  const role = form.watch('role');
  const formValues = form.watch();

  useEffect(() => {
    setShowBusinessType(role === 'vendor');
    setShowVerificationInfo(true);
    
    // Calculate form completion percentage
    let filledFields = 0;
    let totalFields = 7; // Base fields
    
    if (formValues.name) filledFields++;
    if (formValues.email) filledFields++;
    if (formValues.password) filledFields++;
    if (formValues.confirmPassword) filledFields++;
    if (formValues.role) filledFields++;
    if (formValues.idType) filledFields++;
    if (formValues.idNumber) filledFields++;
    
    // Add business type field to total if role is vendor
    if (role === 'vendor') {
      totalFields++;
      if (formValues.businessType) filledFields++;
    }
    
    // Add additional info to calculation if it's filled
    if (formValues.additionalInfo && formValues.additionalInfo.trim() !== '') {
      totalFields++;
      filledFields++;
    }
    
    const progress = Math.floor((filledFields / totalFields) * 100);
    setFormProgress(progress < 10 ? 10 : progress); // Minimum 10% progress
  }, [formValues, role]);

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    
    try {
      const success = await registerUser(
        data.name, 
        data.email, 
        data.password, 
        data.role,
        data.idType,
        data.idNumber,
        data.businessType
      );
      
      if (success) {
        // Show a verification message before redirecting
        setShowVerificationInfo(true);
        setTimeout(() => {
          navigate('/dashboard'); // Redirect all users to dashboard after registration
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-2">Create an Account</h1>
          <p className="text-gray-600 text-center mb-6">
            Join Kasadya Marketplace and discover the best services for your events
          </p>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Registration progress</span>
              <span>{formProgress}%</span>
            </div>
            <Progress value={formProgress} className="h-2" />
          </div>

          {showVerificationInfo && (
            <div className="bg-amber-50 p-4 rounded-md mb-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800">Verification Required</h3>
                  <p className="text-amber-700 mt-1">
                    All accounts require admin verification before you can book or offer services. 
                    Please complete the registration with accurate information.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-blue-50 p-4 rounded-md mb-2">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-700">ID Verification Required</h3>
                    <p className="text-xs text-blue-600 mt-1">
                      For security purposes, we require ID verification for all users.
                      Your information will be reviewed by our admins before approval.
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="idType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ID type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="national_id">National ID</SelectItem>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your ID number" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be verified by our security team.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="customer">Customer looking for services</SelectItem>
                        <SelectItem value="vendor">Vendor offering services</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {role === 'vendor' ? (
                      <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-100">
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-purple-500 mt-0.5" />
                          <p className="text-xs text-purple-700">
                            As a vendor, you'll need to be verified before posting services. Once registered, you can start creating your service listings.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-100">
                        <div className="flex items-start gap-2">
                          <UserCheck className="h-4 w-4 text-green-500 mt-0.5" />
                          <p className="text-xs text-green-700">
                            As a customer, your account will need approval before you can book services. This helps ensure a secure marketplace for everyone.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showBusinessType && (
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="photography">Photography</SelectItem>
                          <SelectItem value="videography">Videography</SelectItem>
                          <SelectItem value="catering">Catering</SelectItem>
                          <SelectItem value="venue">Venue Rental</SelectItem>
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
                        This helps categorize your services in our marketplace.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information you'd like to share with the admin for verification"
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This information can help speed up your verification process.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-kasadya-purple hover:bg-kasadya-deep-purple"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-kasadya-purple hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
