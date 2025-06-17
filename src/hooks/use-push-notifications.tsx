
import { useEffect } from 'react';
// import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from './use-toast';

export const usePushNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    const registerNotifications = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Request permission to use push notifications
          // const permission = await PushNotifications.requestPermissions();
          
          // if (permission.receive === 'granted') {
          //   // Register with Apple / Google to receive push
          //   await PushNotifications.register();
            
          //   // Register listeners
          //   PushNotifications.addListener('registration', (token) => {
          //     console.log('Push registration success: ', token.value);
          //   });
            
          //   PushNotifications.addListener('registrationError', (error) => {
          //     console.error('Error on registration: ', error);
          //   });
            
          //   PushNotifications.addListener('pushNotificationReceived', (notification) => {
          //     console.log('Push notification received: ', notification);
          //     toast({
          //       title: notification.title || 'Nueva notificación',
          //       description: notification.body || '',
          //     });
          //   });
            
          //   PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          //     console.log('Push notification action performed: ', action);
          //   });
          // }
        } catch (error) {
          console.error('Error initializing push notifications: ', error);
        }
      }
    };

    registerNotifications();

    return () => {
      if (Capacitor.isNativePlatform()) {
        // PushNotifications.removeAllListeners();
      }
    };
  }, []);
};
