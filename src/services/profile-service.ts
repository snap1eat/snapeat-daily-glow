
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, NutritionGoals, UserSettings } from '@/types/user';

export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
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
      health_goal: profile.healthGoals?.length ? profile.healthGoals[0] : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
    
  if (error) throw error;
};

export const updateNutritionGoals = async (userId: string, goals: Partial<NutritionGoals>) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      daily_calorie_goal: goals.calories,
      daily_protein_goal: goals.protein,
      daily_carbs_goal: goals.carbs,
      daily_fats_goal: goals.fat,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
    
  if (error) throw error;
};

export const getUserSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>, currentReminderTimes: any) => {
  let reminderTimes = currentReminderTimes;
  
  if (settings.reminderTime) {
    reminderTimes.breakfast = settings.reminderTime;
  }
  
  const reminderTimesJson = JSON.stringify(reminderTimes) as any;
  
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      id: userId,
      sound_effects: settings.sound,
      vibration: settings.vibration,
      animations: settings.animations,
      motivation_messages: settings.motivationalMessages,
      audio_exercises: settings.audioExercises,
      notification_reminders: true,
      notification_news: settings.newsNotifications,
      reminder_times: reminderTimesJson,
      updated_at: new Date().toISOString(),
    });
    
  if (error) throw error;
};
