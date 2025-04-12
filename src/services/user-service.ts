
// This file is maintained for backwards compatibility
// It re-exports all services from their new locations
export * from './auth-service';
export * from './profile-service';
export * from './meals-service';
export * from './water-service';
export * from './logs-service';
export * from './goals-service';
export * from './habits-service';

// Add a function to get the current user ID
import { supabase } from '@/integrations/supabase/client';

export const getCurrentUserId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    throw new Error("No active session found");
  }
  
  return data.session.user.id;
};

// Add missing profile functions
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Add missing settings functions
export const getUserSettings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
};

export const updateUserSettings = async (
  userId: string, 
  settings: any, 
  reminderTimes: any = null
) => {
  try {
    const updateData: any = {
      sound_effects: settings.sound,
      vibration: settings.vibration,
      animations: settings.animations,
      motivation_messages: settings.motivationalMessages,
      audio_exercises: settings.audioExercises,
      notification_news: settings.newsNotifications,
    };
    
    if (reminderTimes) {
      updateData.reminder_times = reminderTimes;
    }
    
    const { error } = await supabase
      .from('user_settings')
      .update(updateData)
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return false;
  }
};
