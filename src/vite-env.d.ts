
/// <reference types="vite/client" />

// Declare global Capacitor interface
interface Window {
  Capacitor?: {
    isNativePlatform: () => boolean;
    getPlatform: () => string;
  };
}
