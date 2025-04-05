
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Dashboard from "./pages/Dashboard";
import FoodLog from "./pages/FoodLog";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';
import { usePushNotifications } from "./hooks/use-push-notifications";

const queryClient = new QueryClient();

const AppInit = () => {
  // Inicializar plugins de Capacitor
  usePushNotifications();

  useEffect(() => {
    const initApp = async () => {
      // Verificamos si estamos en un entorno móvil nativo
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        try {
          // Configurar la barra de estado
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#82BF45' });
          
          // Ocultar la pantalla de splash después de cargarse
          await SplashScreen.hide();
          
          // Manejar el botón de atrás en Android
          CapApp.addListener('backButton', ({ canGoBack }) => {
            if (!canGoBack) {
              CapApp.exitApp();
            } else {
              window.history.back();
            }
          });
        } catch (error) {
          console.error('Error initializing Capacitor plugins:', error);
        }
      }
    };

    initApp();

    return () => {
      // Limpiar listeners cuando el componente se desmonta
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        CapApp.removeAllListeners();
      }
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/food-log" element={<Layout><FoodLog /></Layout>} />
      <Route path="/history" element={<Layout><History /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppInit />
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
