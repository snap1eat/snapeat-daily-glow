
import { supabase } from '@/integrations/supabase/client';

type WaterLogData = {
  id: string;
  user_id: string;
  date: string;
  glasses: number;
  created_at: string;
  updated_at: string;
};

export const updateWaterIntake = async (userId: string, date: string, glasses: number) => {
  try {
    // Check if a water log exists for this date
    const { data, error: fetchError } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);
    
    if (fetchError) throw fetchError;
    
    const existingLogs = data as WaterLogData[];
    
    if (existingLogs && existingLogs.length > 0) {
      // Update existing log
      const logId = existingLogs[0].id;
      const { error: updateError } = await supabase
        .from('water_logs')
        .update({ 
          glasses: glasses, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', logId);
      
      if (updateError) throw updateError;
    } else {
      // Create new log
      const { error: createError } = await supabase
        .from('water_logs')
        .insert({
          user_id: userId,
          date: date,
          glasses: glasses
        });
      
      if (createError) throw createError;
    }
  } catch (error) {
    console.error("Error updating water intake:", error);
    throw error;
  }
};

export const incrementWaterIntake = async (userId: string, date: string) => {
  try {
    const { data, error: fetchError } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);
    
    if (fetchError) throw fetchError;
    
    const existingLogs = data as WaterLogData[];
    const currentGlasses = existingLogs && existingLogs.length > 0 ? existingLogs[0].glasses : 0;
    
    await updateWaterIntake(userId, date, currentGlasses + 1);
  } catch (error) {
    console.error("Error incrementing water:", error);
    throw error;
  }
};

export const decrementWaterIntake = async (userId: string, date: string) => {
  try {
    const { data, error: fetchError } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);
    
    if (fetchError) throw fetchError;
    
    const existingLogs = data as WaterLogData[];
    const currentGlasses = existingLogs && existingLogs.length > 0 ? existingLogs[0].glasses : 0;
    
    if (currentGlasses > 0) {
      await updateWaterIntake(userId, date, currentGlasses - 1);
    }
  } catch (error) {
    console.error("Error decrementing water:", error);
    throw error;
  }
};
