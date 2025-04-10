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
          id: userId,
          name: profileData.display_name || defaultProfile.name,
          age: profileData.age || defaultProfile.age,
          gender: profileData.gender || defaultProfile.gender,
          weight: profileData.weight || defaultProfile.weight,
          height: profileData.height || defaultProfile.height,
          activityLevel: profileData.activity_level || defaultProfile.activityLevel,
          avatar: profileData.avatar_url || defaultProfile.avatar,
          username: profileData.display_name || defaultProfile.username,
          healthGoals: profileData.health_goal ? [profileData.health_goal] : defaultProfile.healthGoals,
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
        
        // Fetch user logs with the updated service function
        const logsData = await UserService.fetchUserLogs(userId);
        
        // Calculate total points and streaks
        let totalPoints = 0;
        let currentStreak = 0;
        
        logsData.forEach((log: DailyLog) => {
          totalPoints += log.eatsPoints;
          if (log.streakDay > currentStreak) {
            currentStreak = log.streakDay;
          }
        });
        
        setUser(prev => ({
          ...prev,
          profile: updatedProfile,
          nutritionGoals: updatedGoals,
          settings: updatedSettings,
          dailyLogs: logsData as DailyLog[],
          currentStreak,
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
