
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.911b1f1327694ee4a991f0d79588fffb',
  appName: 'snapeat-daily-glow',
  webDir: 'dist',
  server: {
    url: 'https://911b1f13-2769-4ee4-a991-f0d79588fffb.lovableproject.com?forceHideBadge=true',
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
    }
  }
};

export default config;
