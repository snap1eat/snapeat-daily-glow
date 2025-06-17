
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Cambia "appId" para que no de error al compilar
  appId: 'app.lovable.snapEatDailyGlow',
  appName: 'snapeat-daily-glow',
  webDir: 'dist',
  server: {
    // url: 'https://911b1f13-2769-4ee4-a991-f0d79588fffb.lovableproject.com?forceHideBadge=true',
    // Cambiar por URL con IP local
    url: 'http://192.168.1.8:8080',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#F2FCE2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#82BF45",
      splashFullScreen: true,
      splashImmersive: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#82BF45"
    },
    Camera: {
      promptLabelHeader: "Foto de comida",
      promptLabelCancel: "Cancelar",
      promptLabelPhoto: "Galería",
      promptLabelPicture: "Cámara"
    }
  }
};

export default config;
