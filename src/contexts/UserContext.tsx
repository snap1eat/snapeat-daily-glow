import { createContext, useContext, ReactNode } from 'react';
import { StorageService } from '../services/storage-service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  DailyLog, 
  MealLog, 
  NutritionGoals, 
  UserContextType, 
  UserProfile, 
  UserSettings,
  HealthData
} from '@/types/user';
import { calculateGoalsBasedOnObjective } from '@/utils/nutritionUtils';
import useUserData from '@/hooks/useUserData';
import * as UserService from '@/services/user-service';

const UserContext = createContext<UserContextType>({} as UserContextType);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { user, setUser } = useUserData();

  const getTodayLog = (): DailyLog => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = user.dailyLogs.find(log => log.date === today);
    
    if (todayLog) {
      return todayLog;
    }

    const newLog: DailyLog = {
      date: today,
      meals: [],
      waterGlasses: 0,
      streakDay: user.currentStreak + 1,
      eatsPoints: 0,
    };

    setUser(prev => ({
      ...prev,
      dailyLogs: [...prev.dailyLogs, newLog],
      currentStreak: prev.currentStreak + 1,
    }));

    return newLog;
  };

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
      await UserService.updateNutritionGoals(userId, goals);
      
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

  const logMeal = async (meal: MealLog) => {
    try {
      console.log("Logging meal:", meal);
      
      const today = new Date().toISOString().split('T')[0];
      let pointsEarned = 10;
      
      if (!user.isAuthenticated) {
        const updatedLogs = user.dailyLogs.map(log => {
          if (log.date === today) {
            return {
              ...log,
              meals: [...log.meals, meal],
              eatsPoints: log.eatsPoints + pointsEarned,
            };
          }
          return log;
        });

        setUser(prev => ({
          ...prev,
          dailyLogs: updatedLogs,
          totalEatsPoints: prev.totalEatsPoints + pointsEarned,
        }));
        
        const userData = { ...user, dailyLogs: updatedLogs, totalEatsPoints: user.totalEatsPoints + pointsEarned };
        StorageService.set('snapeat_user', JSON.stringify(userData));
        
        console.log("Meal logged locally");
        return;
      }
      
      const userId = await UserService.getCurrentUserId();
      
      // Save meal to database
      const mealData = await UserService.saveMeal(userId, meal);
      
      // Update local state with the saved meal data
      const updatedLogs = user.dailyLogs.map(log => {
        if (log.date === today) {
          return {
            ...log,
            meals: [...log.meals, { ...meal, id: mealData.id }],
            eatsPoints: log.eatsPoints + pointsEarned,
          };
        }
        return log;
      });

      setUser(prev => ({
        ...prev,
        dailyLogs: updatedLogs,
        totalEatsPoints: prev.totalEatsPoints + pointsEarned,
      }));
      
      console.log("Meal logged successfully, state updated");
    } catch (error) {
      console.error("Error logging meal:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la comida",
      });
    }
  };

  const incrementWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (!user.isAuthenticated) {
        const updatedLogs = user.dailyLogs.map(log => {
          if (log.date === today) {
            return {
              ...log,
              waterGlasses: Math.min(log.waterGlasses + 1, 8),
            };
          }
          return log;
        });

        setUser(prev => ({
          ...prev,
          dailyLogs: updatedLogs,
        }));
        
        const userData = { ...user, dailyLogs: updatedLogs };
        StorageService.set('snapeat_user', JSON.stringify(userData));
        
        return;
      }
      
      const userId = await UserService.getCurrentUserId();
      
      // Using the new water logs service
      await UserService.incrementWaterIntake(userId, today);
      
      const updatedLogs = user.dailyLogs.map(log => {
        if (log.date === today) {
          return {
            ...log,
            waterGlasses: Math.min(log.waterGlasses + 1, 8),
          };
        }
        return log;
      });

      setUser(prev => ({
        ...prev,
        dailyLogs: updatedLogs,
      }));
      
      console.log("Water intake incremented successfully");
    } catch (error) {
      console.error("Error incrementing water:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar el vaso de agua",
      });
    }
  };

  const decrementWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (!user.isAuthenticated) {
        const updatedLogs = user.dailyLogs.map(log => {
          if (log.date === today && log.waterGlasses > 0) {
            return {
              ...log,
              waterGlasses: log.waterGlasses - 1,
            };
          }
          return log;
        });

        setUser(prev => ({
          ...prev,
          dailyLogs: updatedLogs,
        }));
        
        const userData = { ...user, dailyLogs: updatedLogs };
        StorageService.set('snapeat_user', JSON.stringify(userData));
        
        return;
      }
      
      const userId = await UserService.getCurrentUserId();
      
      // Using the new water logs service
      await UserService.decrementWaterIntake(userId, today);
      
      const updatedLogs = user.dailyLogs.map(log => {
        if (log.date === today && log.waterGlasses > 0) {
          return {
            ...log,
            waterGlasses: log.waterGlasses - 1,
          };
        }
        return log;
      });

      setUser(prev => ({
        ...prev,
        dailyLogs: updatedLogs,
      }));
      
      console.log("Water intake decremented successfully");
    } catch (error) {
      console.error("Error decrementing water:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el vaso de agua",
      });
    }
  };

  const getDailyCalories = (): number => {
    const todayLog = getTodayLog();
    return todayLog.meals.reduce((total, meal) => {
      return total + meal.foods.reduce((mealTotal, food) => mealTotal + food.calories, 0);
    }, 0);
  };

  const getDailyProtein = (): number => {
    const todayLog = getTodayLog();
    return todayLog.meals.reduce((total, meal) => {
      return total + meal.foods.reduce((mealTotal, food) => mealTotal + food.protein, 0);
    }, 0);
  };

  const getDailyCarbs = (): number => {
    const todayLog = getTodayLog();
    return todayLog.meals.reduce((total, meal) => {
      return total + meal.foods.reduce((mealTotal, food) => mealTotal + food.carbs, 0);
    }, 0);
  };

  const getDailyFat = (): number => {
    const todayLog = getTodayLog();
    return todayLog.meals.reduce((total, meal) => {
      return total + meal.foods.reduce((mealTotal, food) => mealTotal + food.fat, 0);
    }, 0);
  };

  const getTodayMealsByType = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink'): MealLog[] => {
    const todayLog = getTodayLog();
    return todayLog.meals.filter(meal => meal.type === type);
  };

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

  return (
    <UserContext.Provider
      value={{
        user,
        updateProfile,
        updateNutritionGoals,
        updateHealthData,
        updateSettings,
        logMeal,
        incrementWater,
        decrementWater,
        getTodayLog,
        getDailyCalories,
        getDailyProtein,
        getDailyCarbs,
        getDailyFat,
        getTodayMealsByType,
        calculateGoalsBasedOnObjective: (objective) => calculateGoalsBasedOnObjective(user.profile, objective),
        login,
        signup,
        logout,
      }}
    >
      {user.isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-snapeat-green mx-auto"></div>
            <p className="mt-4 text-snapeat-green">Cargando...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
