
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'system';
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  getUserNotifications: (userId: string) => Notification[];
  deleteNotification: (notificationId: string) => void;
  recentNotifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  // Load notifications from local storage on startup
  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  // Save notifications to local storage when they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Show toast for new unread notifications for the current user
  useEffect(() => {
    if (user && notifications.length > 0) {
      const latestNotification = notifications[0]; // Assuming notifications are sorted by createdAt desc
      
      if (latestNotification.userId === user.id && !latestNotification.read) {
        // Only show toast for the most recent notification
        toast({
          title: latestNotification.title,
          description: latestNotification.message,
        });
      }
    }
  }, [notifications, user]);

  const unreadCount = user 
    ? notifications.filter(n => !n.read && (user.id === n.userId)).length
    : 0;

  const recentNotifications = user 
    ? notifications
        .filter(n => n.userId === user.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    : [];

  const addNotification = (notificationData: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Math.random().toString(36).substring(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    if (!user) return;
    
    setNotifications(prev =>
      prev.map(notification =>
        notification.userId === user.id ? { ...notification, read: true } : notification
      )
    );
  };

  const getUserNotifications = (userId: string) => {
    return notifications.filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      getUserNotifications,
      deleteNotification,
      recentNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
