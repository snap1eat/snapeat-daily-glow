import { useEffect, useState } from 'react';
import { StorageService } from '@/services/storage-service';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DailyLog,
  Food,
  MealLog,
  NutritionGoals,
  ReminderTimes,
  UserProfile,
  UserSettings,
  UserState
} from '@/types/user';
import * as UserService from '@/services/user-service';
import { defaultNutritionGoals, defaultProfile, defaultSettings } from '@/constants/userDefaults';

export const useUserData = () => {
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
      
      // Fetch profile data
      const profileData = await UserService.fetchUserProfile(userId);
      
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
          healthGoals: profileData.health_goals ? JSON.parse(profileData.health_goals) : defaultProfile.healthGoals,
        };
        
        const updatedGoals: NutritionGoals = {
          calories: profileData.daily_calorie_goal || defaultNutritionGoals.calories,
          protein: profileData.daily_protein_goal || defaultNutritionGoals.protein,
          carbs: profileData.daily_carbs_goal || defaultNutritionGoals.carbs,
          fat: profileData.daily_fats_goal || defaultNutritionGoals.fat,
        };
        
        // Fetch user settings
        const settingsData = await UserService.getUserSettings(userId);
        
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
        
        // Fetch logs and meals for the past 30 days
        const logsData = await UserService.fetchUserLogs(userId);
        const mealsData = await UserService.fetchUserMeals(userId);
        
        // Process the logs and meals
        const today = new Date().toISOString().split('T')[0];
        const dailyLogs: DailyLog[] = [];
        
        const todayLog: DailyLog = {
          date: today,
          meals: [],
          waterGlasses: 0,
          streakDay: 1,
          eatsPoints: 0,
        };
        
        if (logsData && logsData.length > 0) {
          logsData.forEach(log => {
            const logDate = log.date;
            const existingLog = dailyLogs.find(l => l.date === logDate);
            
            if (existingLog) {
              existingLog.waterGlasses = log.water_intake || 0;
            } else {
              dailyLogs.push({
                date: logDate,
                meals: [],
                waterGlasses: log.water_intake || 0,
                streakDay: 0,
                eatsPoints: 0,
              });
            }
          });
        }
        
        if (!dailyLogs.find(l => l.date === today)) {
          dailyLogs.push(todayLog);
        }
        
        if (mealsData && mealsData.length > 0) {
          mealsData.forEach(meal => {
            const mealDate = new Date(meal.created_at!).toISOString().split('T')[0];
            const logForDate = dailyLogs.find(l => l.date === mealDate);
            
            if (logForDate) {
              const foods: Food[] = meal.meal_foods.map((food: any) => ({
                id: food.id,
                name: food.name,
                quantity: food.quantity,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fats,
                sodium: food.sodium,
                fiber: food.fiber,
                sugar: food.sugar,
              }));
              
              logForDate.meals.push({
                id: meal.id,
                type: meal.meal_type as any,
                foods,
                timestamp: new Date(meal.created_at!),
                photo: meal.image_url || undefined,
              });
              
              logForDate.eatsPoints += 10;
            }
          });
        }
        
        // Calculate streak
        let streak = 0;
        let currentDate = new Date();
        let consecutiveDays = 0;
        
        dailyLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        for (let i = 0; i < 30; i++) {
          const dateString = currentDate.toISOString().split('T')[0];
          const logForDate = dailyLogs.find(l => l.date === dateString);
          
          if (logForDate && (logForDate.meals.length > 0 || logForDate.waterGlasses > 0)) {
            consecutiveDays++;
            logForDate.streakDay = consecutiveDays;
          } else {
            break;
          }
          
          currentDate.setDate(currentDate.getDate() - 1);
        }
        
        streak = consecutiveDays;
        
        const totalPoints = dailyLogs.reduce((sum, log) => sum + log.eatsPoints, 0);
        
        setUser(prev => ({
          ...prev,
          profile: updatedProfile,
          nutritionGoals: updatedGoals,
          settings: updatedSettings,
          dailyLogs,
          currentStreak: streak,
          totalEatsPoints: totalPoints,
          isAuthenticated: true,
          isLoading: false,
        }));
        
        console.log("User data loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del usuario",
      });
      
      setUser(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  return {
    user,
    setUser,
    fetchUserData
  };
};

export default useUserData;
