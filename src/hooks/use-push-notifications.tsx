
import { useEffect, useState } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { useToast } from './use-toast';

export function usePushNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Verificamos si estamos en un entorno móvil nativo
    const isMobileApp = window.Capacitor && window.Capacitor.isNativePlatform();
    if (!isMobileApp) return;

    // Registramos los listeners para las notificaciones
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ' + JSON.stringify(notification));
      setNotifications((notifications) => [...notifications, notification]);
      
      // Mostramos un toast con la notificación
      toast({
        title: notification.title || 'Nueva notificación',
        description: notification.body || '',
      });
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action performed: ' + JSON.stringify(action));
    });

    // Pedimos permiso para enviar notificaciones
    const requestPermissions = async () => {
      try {
        const result = await PushNotifications.requestPermissions();
        setPermissionStatus(result.receive === 'granted');
        
        if (result.receive === 'granted') {
          // Registramos la app para recibir notificaciones
          await PushNotifications.register();
        }
      } catch (error) {
        console.error('Error requesting push notification permissions', error);
      }
    };

    requestPermissions();

    return () => {
      // Limpiamos los listeners cuando el componente se desmonta
      PushNotifications.removeAllListeners();
    };
  }, [toast]);

  return { notifications, permissionStatus };
}
