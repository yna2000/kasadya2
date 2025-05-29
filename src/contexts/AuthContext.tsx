import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export type UserType = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isAdmin?: boolean;
  isVendor?: boolean;
  businessType?: string;
  idType?: 'national_id' | 'passport' | 'drivers_license';
  idNumber?: string;
  isVerified?: boolean;
  createdAt: string;
  lastLogin: string;
};

interface AuthContextType {
  user: UserType | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    role?: string,
    idType?: 'national_id' | 'passport' | 'drivers_license',
    idNumber?: string,
    businessType?: string
  ) => Promise<boolean>;
  logout: () => void;
  verifyUser: (userId: string, isVerified: boolean) => Promise<boolean>;
  getAllUsers: () => UserType[];
  getPendingVerificationUsers: () => UserType[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Create a local function to create notifications without using the NotificationContext
  const createNotification = (userId: string, title: string, message: string, type: 'booking' | 'payment' | 'system') => {
    // Get existing notifications from localStorage
    const storedNotifications = localStorage.getItem('notifications');
    let notifications = [];
    
    if (storedNotifications) {
      notifications = JSON.parse(storedNotifications);
    }
    
    // Create new notification
    const newNotification = {
      id: `notif-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    // Add to notifications array
    notifications = [newNotification, ...notifications];
    
    // Save back to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Show toast
    toast({
      title: title,
      description: message,
    });
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo, we'll use local storage and simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const user = users.find((u: any) => u.email === email);
        
        if (user && user.password === password) {
          // Create a user object without the password
          const { password: _, ...userWithoutPassword } = user;
          
          // Ensure isVendor property exists (for backward compatibility with existing users)
          if (userWithoutPassword.isVendor === undefined) {
            userWithoutPassword.isVendor = userWithoutPassword.role === 'vendor';
          }
          
          // Update last login
          userWithoutPassword.lastLogin = new Date().toISOString();
          
          // Store in state and local storage
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          
          // Create a welcome back notification
          createNotification(
            userWithoutPassword.id,
            "Welcome back!",
            `You've successfully logged in to Kasadya Marketplace.`,
            'system'
          );
          
          toast({
            title: "Login successful",
            description: "Welcome back to Kasadya Marketplace!"
          });
          
          setIsLoading(false);
          return true;
        }
      }
      
      // If we get here, login failed
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      });
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string = 'customer',
    idType: 'national_id' | 'passport' | 'drivers_license' = 'national_id',
    idNumber: string = '',
    businessType: string = ''
  ) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo, we'll use local storage and simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const storedUsers = localStorage.getItem('users') || '[]';
      const users = JSON.parse(storedUsers);
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        toast({
          title: "Registration failed",
          description: "Email already exists. Please use a different email or login.",
          variant: "destructive"
        });
        
        setIsLoading(false);
        return false;
      }
      
      // Create a new user
      const newUser = {
        id: `user-${Math.random().toString(36).substring(2, 9)}`,
        name,
        email,
        password,
        role,
        idType,
        idNumber,
        businessType: role === 'vendor' ? businessType : undefined, // Only set business type for vendors
        isVerified: role === 'vendor' ? false : false, // Both vendors and customers need verification now
        isAdmin: false, // Default to non-admin
        isVendor: role === 'vendor', // Set isVendor based on role
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // Add to users array and store
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Create a user object without the password
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Store in state and local storage
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Create a welcome notification with appropriate message based on role
      const notificationMessage = role === 'vendor' 
        ? `Thank you for registering, ${name}! Your ID verification is pending admin approval. Once approved, you can start posting services.`
        : `Thank you for registering, ${name}! Your account is pending admin approval. Once approved, you can start booking services.`;
        
      createNotification(
        userWithoutPassword.id,
        "Welcome to Kasadya Marketplace!",
        notificationMessage,
        'system'
      );
      
      // Create admin notification about new user
      const storedAdminNotifications = localStorage.getItem('adminNotifications') || '[]';
      const adminNotifications = JSON.parse(storedAdminNotifications);
      
      const newAdminNotification = {
        id: `admin-notif-${Math.random().toString(36).substring(2, 9)}`,
        title: `New ${role} Registration`,
        message: `${name} has registered as a ${role} and requires verification.`,
        userId: userWithoutPassword.id,
        userRole: role,
        userName: name,
        userEmail: email,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      adminNotifications.push(newAdminNotification);
      localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
      
      toast({
        title: "Registration successful",
        description: role === 'vendor' 
          ? "Welcome to Kasadya Marketplace! Your account is pending ID verification."
          : "Welcome to Kasadya Marketplace! Your account is pending verification."
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      
      setIsLoading(false);
      return false;
    }
  };

  // Get all users from localStorage (for admin purposes)
  const getAllUsers = (): UserType[] => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      const users: any[] = JSON.parse(storedUsers);
      
      // Remove password field from each user
      return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    }
    return [];
  };

  // Get users pending verification
  const getPendingVerificationUsers = (): UserType[] => {
    const allUsers = getAllUsers();
    return allUsers.filter(user => user.isVerified === false);
  };

  const verifyUser = async (userId: string, isVerified: boolean): Promise<boolean> => {
    try {
      // Get users from localStorage
      const storedUsers = localStorage.getItem('users') || '[]';
      const users = JSON.parse(storedUsers);
      
      // Find and update the user
      const userIndex = users.findIndex((u: any) => u.id === userId);
      
      if (userIndex === -1) {
        toast({
          title: "Verification failed",
          description: "User not found.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update user verification status
      users[userIndex].isVerified = isVerified;
      
      // Save back to localStorage
      localStorage.setItem('users', JSON.stringify(users));
      
      // If this is the currently logged-in user, update their session
      if (user && user.id === userId) {
        const updatedUser = { ...user, isVerified };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Create notification for the verified user
      createNotification(
        userId,
        isVerified ? "Account Verified" : "Account Verification Update",
        isVerified ? "Your account has been verified. You can now access all features." : "Your account verification status has been updated.",
        "system"
      );
      
      toast({
        title: "User verification updated",
        description: `User ${isVerified ? "verified" : "verification removed"} successfully.`
      });
      
      return true;
    } catch (error) {
      console.error('User verification error:', error);
      toast({
        title: "Verification error",
        description: "An unexpected error occurred during verification.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      verifyUser,
      getAllUsers,
      getPendingVerificationUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};
