
import { useToast } from '@/hooks/use-toast';
import { UserProfile, HealthData, NutritionGoals, UserSettings } from '@/types/user';
import * as UserService from '@/services/user-service';
import { StorageService } from '@/services/storage-service';
import { supabase } from '@/integrations/supabase/client';

export const useProfileManagement = (
  user: any, 
  setUser: React.Dispatch<React.SetStateAction<any>>
) => {
  const { toast } = useToast();

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      if (!user.isAuthenticated) {
        setUser(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            ...profile,
          },
        }));
        return;
      }
      
      const userId = await UserService.getCurrentUserId();
      await UserService.updateUserProfile(userId, profile);
      
      setUser(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          ...profile,
        },
      }));
      
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
      });
    }
  };

  const updateNutritionGoals = async (goals: Partial<NutritionGoals>) => {
    try {
      if (!user.isAuthenticated) {
        setUser(prev => ({
          ...prev,
          nutritionGoals: {
            ...prev.nutritionGoals,
            ...goals,
          },
        }));
        return;
      }
      
      const userId = await UserService.getCurrentUserId();
      
      const nutritionGoal = 'maintain';
      await UserService.updateNutritionGoals(userId, goals, nutritionGoal);
      
      setUser(prev => ({
        ...prev,
        nutritionGoals: {
          ...prev.nutritionGoals,
          ...goals,
        },
      }));
      
      console.log("Nutrition goals updated successfully");
    } catch (error) {
      console.error("Error updating nutrition goals:", error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar los objetivos nutricionales",
      });
    }
  };

  const updateHealthData = async (data: Partial<HealthData>) => {
    try {
      setUser(prev => ({
        ...prev,
        healthData: {
          ...prev.healthData,
          ...data,
        },
      }));
    } catch (error) {
      console.error("Error updating health data:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información de salud",
      });
    }
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    try {
      if (!user.isAuthenticated) {
        setUser(prev => ({
          ...prev,
          settings: {
            ...prev.settings,
            ...settings,
          },
        }));
        return;
      }
      
      const userId = await UserService.getCurrentUserId();
      
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id, reminder_times')
        .eq('id', userId)
        .single();
      
      let reminderTimes = {
        breakfast: '08:00',
        lunch: '13:00',
        dinner: '20:00',
        snack: '11:00'
      };
      
      if (existingSettings?.reminder_times) {
        if (typeof existingSettings.reminder_times === 'string') {
          try {
            reminderTimes = JSON.parse(existingSettings.reminder_times as string);
          } catch (e) {
            console.error("Error parsing reminder_times:", e);
          }
        } else {
          reminderTimes = existingSettings.reminder_times as unknown as any;
        }
      }
      
      await UserService.updateUserSettings(userId, settings, reminderTimes);
      
      setUser(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...settings,
        },
      }));
      
      console.log("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar las configuraciones",
      });
    }
  };

  return {
    updateProfile,
    updateNutritionGoals,
    updateHealthData,
    updateSettings
  };
};
