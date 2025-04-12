
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
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
    
  if (error) throw error;
};

export const getUserNutritionGoals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching nutrition goals:', error);
    return null;
  }
};

export const updateNutritionGoals = async (userId: string, goals: Partial<NutritionGoals>, nutritionGoal?: string) => {
  try {
    // Check if goals already exist for user
    const { data: existingGoals } = await supabase
      .from('user_goals')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    const goalsData = {
      user_id: userId,
      calories: goals.calories,
      protein: goals.protein,
      carbs: goals.carbs,
      fat: goals.fat,
      nutrition_goal: nutritionGoal || 'maintain',
      updated_at: new Date().toISOString()
    };
    
    if (existingGoals) {
      // Update existing record
      const { error } = await supabase
        .from('user_goals')
        .update(goalsData)
        .eq('id', existingGoals.id);
        
      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('user_goals')
        .insert(goalsData);
        
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error updating nutrition goals:', error);
    throw error;
  }
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
