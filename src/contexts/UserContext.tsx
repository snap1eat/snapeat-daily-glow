import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { StorageService } from '../services/storage-service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  age: number;
  gender: string;
  weight: number; // in kg
  height: number; // in cm
  activityLevel: string;
  avatar: string;
  username: string;
}

interface NutritionGoals {
  calories: number;
  protein: number; // in g
  carbs: number; // in g
  fat: number; // in g
}

interface MealLog {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
  foods: Food[];
  timestamp: Date;
  photo?: string; // Added photo property
}

interface Food {
  id: string;
  name: string;
  quantity: number; // in g
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium?: number;
  fiber?: number;
  sugar?: number;
}

interface HealthData {
  glycemia?: string;
  cholesterol?: string;
  triglycerides?: string;
  hypertension?: boolean;
  foodIntolerances?: string;
  digestiveIssues?: string;
  additionalHealthInfo?: string;
  familyHypertension?: boolean;
  familyDiabetes?: boolean;
}

interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: MealLog[];
  waterGlasses: number;
  streakDay: number;
  eatsPoints: number;
}

interface ReminderTimes {
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
}

interface UserState {
  profile: UserProfile;
  nutritionGoals: NutritionGoals;
  dailyLogs: DailyLog[];
  currentStreak: number;
  totalEatsPoints: number;
  healthData?: HealthData;
  settings?: UserSettings; // Added settings
  isAuthenticated: boolean; // Added authentication status
  isLoading: boolean; // Added loading state
}

interface UserSettings {
  sound: boolean;
  vibration: boolean;
  animations: boolean;
  motivationalMessages: boolean;
  audioExercises: boolean;
  email?: string;
  phone?: string;
  password?: string;
  reminderTime?: string;
  newsNotifications: boolean;
}

interface UserContextType {
  user: UserState;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  updateHealthData?: (data: Partial<HealthData>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  logMeal: (meal: MealLog) => Promise<void>;
  incrementWater: () => Promise<void>;
  getTodayLog: () => DailyLog;
  getDailyCalories: () => number;
  getDailyProtein: () => number;
  getDailyCarbs: () => number;
  getDailyFat: () => number;
  getTodayMealsByType: (type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink') => MealLog[];
  calculateGoalsBasedOnObjective: (objective: string) => NutritionGoals;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, profile: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: '',
  age: 30,
  gender: 'no-answer',
  weight: 70,
  height: 170,
  activityLevel: 'moderate',
  avatar: '',
  username: 'HealthyPineapple123',
};

const defaultNutritionGoals: NutritionGoals = {
  calories: 2000,
  protein: 100,
  carbs: 250,
  fat: 70,
};

const defaultSettings: UserSettings = {
  sound: true,
  vibration: true,
  animations: true,
  motivationalMessages: true,
  audioExercises: false,
  newsNotifications: true,
};

const UserContext = createContext<UserContextType>({
  user: {
    profile: defaultProfile,
    nutritionGoals: defaultNutritionGoals,
    dailyLogs: [],
    currentStreak: 0,
    totalEatsPoints: 0,
    settings: defaultSettings,
    isAuthenticated: false,
    isLoading: true,
  },
  updateProfile: async () => {},
  updateNutritionGoals: async () => {},
  updateSettings: async () => {},
  logMeal: async () => {},
  incrementWater: async () => {},
  getTodayLog: () => ({
    date: new Date().toISOString().split('T')[0],
    meals: [],
    waterGlasses: 0,
    streakDay: 0,
    eatsPoints: 0,
  }),
  getDailyCalories: () => 0,
  getDailyProtein: () => 0,
  getDailyCarbs: () => 0,
  getDailyFat: () => 0,
  getTodayMealsByType: () => [],
  calculateGoalsBasedOnObjective: () => defaultNutritionGoals,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<UserState>({
    profile: defaultProfile,
    nutritionGoals: defaultNutritionGoals,
    dailyLogs: [{
      date: new Date().toISOString().split('T')[0],
      meals: [],
      waterGlasses: 0,
      streakDay: 1,
      eatsPoints: 0,
    }],
    currentStreak: 1,
    totalEatsPoints: 0,
    settings: defaultSettings,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        setUser(prev => ({
          ...prev,
          isAuthenticated: !!session,
          isLoading: false,
        }));

        if (session) {
          fetchUserData(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setUser(prev => ({
        ...prev,
        isAuthenticated: !!session,
        isLoading: false,
      }));

      if (session) {
        fetchUserData(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      console.log("Fetching user data for:", userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      if (profileData) {
        const updatedProfile: UserProfile = {
          name: profileData.display_name || defaultProfile.name,
          age: profileData.age || defaultProfile.age,
          gender: profileData.gender || defaultProfile.gender,
          weight: profileData.weight || defaultProfile.weight,
          height: profileData.height || defaultProfile.height,
          activityLevel: profileData.activity_level || defaultProfile.activityLevel,
          avatar: profileData.avatar_url || defaultProfile.avatar,
          username: profileData.display_name || defaultProfile.username,
        };
        
        const updatedGoals: NutritionGoals = {
          calories: profileData.daily_calorie_goal || defaultNutritionGoals.calories,
          protein: profileData.daily_protein_goal || defaultNutritionGoals.protein,
          carbs: profileData.daily_carbs_goal || defaultNutritionGoals.carbs,
          fat: profileData.daily_fats_goal || defaultNutritionGoals.fat,
        };
        
        const { data: settingsData, error: settingsError } = await supabase
          .from('user_settings')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
        
        const updatedSettings: UserSettings = settingsData ? {
          sound: settingsData.sound_effects,
          vibration: settingsData.vibration,
          animations: settingsData.animations,
          motivationalMessages: settingsData.motivation_messages,
          audioExercises: settingsData.audio_exercises,
          reminderTime: settingsData.reminder_times ? 
            (typeof settingsData.reminder_times === 'string' 
              ? JSON.parse(settingsData.reminder_times).breakfast 
              : (settingsData.reminder_times as any).breakfast) || '08:00' 
            : '08:00',
          newsNotifications: settingsData.notification_news,
        } : defaultSettings;
        
        setUser(prev => ({
          ...prev,
          profile: updatedProfile,
          nutritionGoals: updatedGoals,
          settings: updatedSettings,
        }));
        
        console.log("User data loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del usuario",
      });
    }
  };

  const calculateGoalsBasedOnObjective = (objective: string): NutritionGoals => {
    const { weight, height, age, gender, activityLevel } = user.profile;
    let bmr = 0;
    
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    let activityMultiplier = 1.2;
    switch(activityLevel) {
      case 'light': activityMultiplier = 1.375; break;
      case 'moderate': activityMultiplier = 1.55; break;
      case 'active': activityMultiplier = 1.725; break;
      case 'extra_active': activityMultiplier = 1.9; break;
    }
    
    let calories = Math.round(bmr * activityMultiplier);
    
    switch(objective) {
      case 'weight_loss': calories -= 500; break;
      case 'weight_gain': calories += 500; break;
      case 'muscle_gain': calories += 300; break;
    }
    
    let protein = 0;
    let fat = 0;
    let carbs = 0;
    
    switch(objective) {
      case 'weight_loss':
        protein = Math.round(weight * 2.2);
        fat = Math.round(weight * 0.4);
        carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);
        break;
      case 'muscle_gain':
        protein = Math.round(weight * 1.6);
        fat = Math.round(calories * 0.25 / 9);
        carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);
        break;
      case 'maintain':
      default:
        protein = Math.round(weight * 1.2);
        fat = Math.round(calories * 0.3 / 9);
        carbs = Math.round((calories - (protein * 4 + fat * 9)) / 4);
    }
    
    calories = Math.max(1200, calories);
    protein = Math.max(50, protein);
    fat = Math.max(30, fat);
    carbs = Math.max(50, carbs);
    
    return { calories, protein, carbs, fat };
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
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.name,
          age: profile.age,
          gender: profile.gender,
          weight: profile.weight,
          height: profile.height,
          activity_level: profile.activityLevel,
          avatar_url: profile.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', await getCurrentUserId());
      
      if (error) throw error;
      
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
      
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_calorie_goal: goals.calories,
          daily_protein_goal: goals.protein,
          daily_carbs_goal: goals.carbs,
          daily_fats_goal: goals.fat,
          updated_at: new Date().toISOString(),
        })
        .eq('id', await getCurrentUserId());
      
      if (error) throw error;
      
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
      
      const userId = await getCurrentUserId();
      
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id, reminder_times')
        .eq('id', userId)
        .single();
      
      let reminderTimes: ReminderTimes = {
        breakfast: '08:00',
        lunch: '13:00',
        dinner: '20:00',
        snack: '11:00'
      };
      
      if (existingSettings?.reminder_times) {
        if (typeof existingSettings.reminder_times === 'string') {
          try {
            reminderTimes = JSON.parse(existingSettings.reminder_times);
          } catch (e) {
            console.error("Error parsing reminder_times:", e);
          }
        } else {
          reminderTimes = existingSettings.reminder_times as unknown as ReminderTimes;
        }
      }
      
      if (settings.reminderTime) {
        reminderTimes.breakfast = settings.reminderTime;
      }
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: userId,
          sound_effects: settings.sound !== undefined ? settings.sound : user.settings?.sound,
          vibration: settings.vibration !== undefined ? settings.vibration : user.settings?.vibration,
          animations: settings.animations !== undefined ? settings.animations : user.settings?.animations,
          motivation_messages: settings.motivationalMessages !== undefined ? settings.motivationalMessages : user.settings?.motivationalMessages,
          audio_exercises: settings.audioExercises !== undefined ? settings.audioExercises : user.settings?.audioExercises,
          notification_reminders: true,
          notification_news: settings.newsNotifications !== undefined ? settings.newsNotifications : user.settings?.newsNotifications,
          reminder_times: reminderTimes,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
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

  const getCurrentUserId = async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    return user.id;
  };

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

  const logMeal = async (meal: MealLog) => {
    try {
      if (!user.isAuthenticated) {
        const today = new Date().toISOString().split('T')[0];
        const updatedLogs = user.dailyLogs.map(log => {
          if (log.date === today) {
            return {
              ...log,
              meals: [...log.meals, meal],
              eatsPoints: log.eatsPoints + 10,
            };
          }
          return log;
        });

        setUser(prev => ({
          ...prev,
          dailyLogs: updatedLogs,
          totalEatsPoints: prev.totalEatsPoints + 10,
        }));
        return;
      }
      
      const userId = await getCurrentUserId();
      
      const totalCalories = meal.foods.reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = meal.foods.reduce((sum, food) => sum + food.protein, 0);
      const totalCarbs = meal.foods.reduce((sum, food) => sum + food.carbs, 0);
      const totalFats = meal.foods.reduce((sum, food) => sum + food.fat, 0);
      const totalFiber = meal.foods.reduce((sum, food) => sum + (food.fiber || 0), 0);
      const totalSodium = meal.foods.reduce((sum, food) => sum + (food.sodium || 0), 0);
      const totalSugar = meal.foods.reduce((sum, food) => sum + (food.sugar || 0), 0);
      const totalQuantity = meal.foods.reduce((sum, food) => sum + food.quantity, 0);
      
      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert({
          user_id: userId,
          meal_type: meal.type,
          total_quantity: totalQuantity,
          total_calories: totalCalories,
          total_protein: totalProtein,
          total_carbs: totalCarbs,
          total_fats: totalFats,
          total_fiber: totalFiber,
          total_sodium: totalSodium,
          total_sugar: totalSugar,
          image_url: meal.photo,
          input_method: 'manual',
        })
        .select()
        .single();
      
      if (mealError) throw mealError;
      
      const mealFoods = meal.foods.map(food => ({
        meal_id: mealData?.id,
        food_item_id: food.id,
        name: food.name,
        quantity: food.quantity,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fat,
        fiber: food.fiber,
        sodium: food.sodium,
        sugar: food.sugar,
      }));
      
      const { error: foodsError } = await supabase
        .from('meal_foods')
        .insert(mealFoods);
      
      if (foodsError) throw foodsError;
      
      const today = new Date().toISOString().split('T')[0];
      const updatedLogs = user.dailyLogs.map(log => {
        if (log.date === today) {
          return {
            ...log,
            meals: [...log.meals, meal],
            eatsPoints: log.eatsPoints + 10,
          };
        }
        return log;
      });

      setUser(prev => ({
        ...prev,
        dailyLogs: updatedLogs,
        totalEatsPoints: prev.totalEatsPoints + 10,
      }));
      
      console.log("Meal logged successfully");
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
      if (!user.isAuthenticated) {
        const today = new Date().toISOString().split('T')[0];
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
        return;
      }
      
      const userId = await getCurrentUserId();
      const today = new Date().toISOString().split('T')[0];
      
      const { data: logData, error: logError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();
      
      if (logError && logError.code !== 'PGRST116') throw logError;
      
      const currentWaterIntake = logData?.water_intake || 0;
      const newWaterIntake = Math.min(currentWaterIntake + 1, 8);
      
      const { error: updateError } = await supabase
        .from('daily_logs')
        .upsert({
          user_id: userId,
          date: today,
          water_intake: newWaterIntake,
          updated_at: new Date().toISOString(),
        });
      
      if (updateError) throw updateError;
      
      const updatedLogs = user.dailyLogs.map(log => {
        if (log.date === today) {
          return {
            ...log,
            waterGlasses: newWaterIntake,
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
        profile: defaultProfile,
        nutritionGoals: defaultNutritionGoals,
        dailyLogs: [{
          date: new Date().toISOString().split('T')[0],
          meals: [],
          waterGlasses: 0,
          streakDay: 1,
          eatsPoints: 0,
        }],
        currentStreak: 1,
        totalEatsPoints: 0,
        settings: defaultSettings,
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
        getTodayLog,
        getDailyCalories,
        getDailyProtein,
        getDailyCarbs,
        getDailyFat,
        getTodayMealsByType,
        calculateGoalsBasedOnObjective,
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
