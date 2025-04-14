
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { StorageService } from '@/services/storage-service';

export const useAuthManagement = (
  user: any, 
  setUser: React.Dispatch<React.SetStateAction<any>>
) => {
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast({
        description: "Has iniciado sesión correctamente",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "No se pudo iniciar sesión",
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string, profile: Partial<UserProfile>) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: profile.name,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Cuenta creada",
        description: "Te has registrado correctamente",
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Error de registro",
        description: error.message || "No se pudo crear la cuenta",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser({
        profile: user.profile,
        nutritionGoals: user.nutritionGoals,
        dailyLogs: [{
          date: new Date().toISOString().split('T')[0],
          meals: [],
          waterGlasses: 0,
          streakDay: 1,
          eatsPoints: 0,
        }],
        currentStreak: 1,
        totalEatsPoints: 0,
        settings: user.settings,
        isAuthenticated: false,
        isLoading: false,
      });
      
      localStorage.removeItem('snapeat_user');
      StorageService.remove('snapeat_user');
      
      toast({
        description: "Has cerrado sesión correctamente",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
      });
    }
  };

  return {
    login,
    signup,
    logout
  };
};
